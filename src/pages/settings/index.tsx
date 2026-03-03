import React from 'react';
import Link from 'next/link';
import { MapPin, Cpu, ArrowRightLeft, Link2, ChevronRight } from 'lucide-react';
import { SettingsLayout } from '~/components/settings/SettingsLayout';
import { ProtectedRoute } from '~/components/auth/ProtectedRoute';

const settingsSections = [
  {
    href: '/settings/locations',
    icon: MapPin,
    title: 'locations',
    description: 'manage physical locations where sensors are placed',
    color: 'contrast',
  },
  {
    href: '/settings/sensors',
    icon: Cpu,
    title: 'sensors',
    description: 'manage sensor devices, models, and their active status',
    color: 'primary',
  },
  {
    href: '/settings/assignments',
    icon: ArrowRightLeft,
    title: 'sensor assignments',
    description: 'assign sensors to locations and track their placement history',
    color: 'secondary',
  },
  {
    href: '/settings/integrations',
    icon: Link2,
    title: 'integrations',
    description: 'manage external service connections like Ring',
    color: 'tertiary',
  },
];

const colorClasses = {
  contrast: {
    bg: 'bg-airq-contrast/10',
    icon: 'text-airq-contrast',
  },
  primary: {
    bg: 'bg-airq-primary/10',
    icon: 'text-airq-primary',
  },
  secondary: {
    bg: 'bg-airq-secondary/20',
    icon: 'text-airq-secondary',
  },
  tertiary: {
    bg: 'bg-airq-dark/10',
    icon: 'text-airq-dark/70',
  },
};

const SettingsPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <SettingsLayout
        title="settings"
        description="configure your air quality monitoring system"
      >
        <div className="bg-airq-dark text-airq-light px-4 py-2 border-b border-black/80">
          <p className="text-xs font-semibold">quick access</p>
        </div>
        <div className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              const colors = colorClasses[section.color as keyof typeof colorClasses];

              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className="block p-4 bg-airq-light border border-airq-dark shadow-card hover:shadow-none hover:translate-y-0.5 hover:translate-x-0.5 transition-all"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-10 h-10 ${colors.bg} border border-airq-dark flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-airq-dark">{section.title}</h3>
                        <ChevronRight className="w-4 h-4 text-airq-dark/40" />
                      </div>
                      <p className="mt-1 text-xs text-airq-dark/60">{section.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </SettingsLayout>
    </ProtectedRoute>
  );
};

export default SettingsPage;
