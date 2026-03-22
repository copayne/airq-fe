import type { NextApiRequest, NextApiResponse } from 'next';
import { getRingApi } from '~/lib/ringApiManager';

type AlarmAction = 'armHome' | 'armAway' | 'disarm';

const VALID_ACTIONS: AlarmAction[] = ['armHome', 'armAway', 'disarm'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action } = req.body as { action?: string };

  if (!action || !VALID_ACTIONS.includes(action as AlarmAction)) {
    return res.status(400).json({ error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}` });
  }

  try {
    const ringApi = await getRingApi();
    const locations = await ringApi.getLocations();

    if (locations.length === 0) {
      return res.status(404).json({ error: 'No Ring locations found' });
    }

    const location = locations[0]!;

    switch (action as AlarmAction) {
      case 'armHome':
        await location.armHome();
        break;
      case 'armAway':
        await location.armAway();
        break;
      case 'disarm':
        await location.disarm();
        break;
    }

    console.log(`[Ring Alarm] Mode changed to: ${action}`);
    return res.status(200).json({ success: true, action });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Ring Alarm] Failed to set mode:`, message);

    if (message.includes('expired') || message.includes('not valid')) {
      return res.status(401).json({ error: 'Ring token expired', tokenExpired: true });
    }

    return res.status(500).json({ error: message });
  }
}
