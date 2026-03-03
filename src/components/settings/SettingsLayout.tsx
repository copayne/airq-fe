import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MapPin, Cpu, ArrowRightLeft, ChevronLeft, Activity, Bell, Crosshair, Link2 } from 'lucide-react';
import Layout from '../layout/Layout';

interface SettingsLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const navItems = [
  { href: '/settings/locations', label: 'locations', icon: MapPin },
  { href: '/settings/sensors', label: 'sensors', icon: Cpu },
  { href: '/settings/assignments', label: 'assignments', icon: ArrowRightLeft },
  { href: '/settings/diagnostics', label: 'diagnostics', icon: Activity },
  { href: '/settings/calibration', label: 'calibration', icon: Crosshair },
  { href: '/settings/alerts', label: 'alerts', icon: Bell },
  { href: '/settings/integrations', label: 'integrations', icon: Link2 },
];

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  children,
  title,
  description
}) => {
  const router = useRouter();

  return (
    <Layout>
      <div className="min-h-screen bg-airq-light/50">
        {/* Settings Header */}
        <div className="bg-airq-light border-b border-airq-dark">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <div className="flex items-center space-x-2 text-sm text-airq-dark/70 mb-2">
                <Link href="/dash" className="hover:text-airq-contrast flex items-center transition-colors">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  dashboard
                </Link>
                <span>/</span>
                <span className="text-airq-dark">settings</span>
              </div>
              <h1 className="text-2xl font-semibold text-airq-dark">{title}</h1>
              {description && (
                <p className="mt-1 text-sm text-airq-dark/70">{description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Navigation */}
            <nav className="w-full md:w-56 flex-shrink-0">
              <div className="border border-airq-dark shadow-card bg-airq-light">
                <div className="bg-airq-dark text-airq-light px-3 py-2 border-b border-black/80">
                  <p className="text-xs font-semibold">settings</p>
                </div>
                <ul>
                  {navItems.map((item, index) => {
                    const isActive = router.pathname === item.href;
                    const Icon = item.icon;
                    const isLast = index === navItems.length - 1;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center px-3 py-3 text-sm transition-colors ${
                            !isLast ? 'border-b border-airq-dark/20' : ''
                          } ${
                            isActive
                              ? 'bg-airq-contrast/10 text-airq-contrast font-medium'
                              : 'text-airq-dark hover:bg-airq-dark/5'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-airq-contrast' : 'text-airq-dark/60'}`} />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="border border-airq-dark shadow-card bg-airq-light">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsLayout;
