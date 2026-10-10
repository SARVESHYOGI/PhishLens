import { useState } from 'react';
import { Bell, Lock } from 'lucide-react';

export function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(true);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-foreground text-2xl font-bold">Settings</h1>

      <div className="border-border bg-card space-y-6 rounded-2xl border p-6">
        <h2 className="text-foreground text-lg font-semibold">Account</h2>
        <div className="space-y-4">
          <div>
            <label
              className="text-foreground mb-1 block text-sm font-medium"
              htmlFor="settings-email"
            >
              Email
            </label>
            <input
              id="settings-email"
              type="email"
              defaultValue="analyst@company.com"
              className="border-border bg-background text-foreground focus:border-primary focus:ring-primary/30 w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
            />
          </div>
          <div>
            <label
              className="text-foreground mb-1 block text-sm font-medium"
              htmlFor="settings-name"
            >
              Display Name
            </label>
            <input
              id="settings-name"
              type="text"
              defaultValue="SOC Analyst"
              className="border-border bg-background text-foreground focus:border-primary focus:ring-primary/30 w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="border-border bg-card space-y-6 rounded-2xl border p-6">
        <h2 className="text-foreground text-lg font-semibold">Preferences</h2>
        <div className="space-y-4">
          <label className="bg-secondary hover:bg-secondary-hover flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="text-primary h-4 w-4" />
              <span className="text-foreground text-sm">Enable notifications</span>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="border-border bg-background text-primary focus:ring-primary/30 h-4 w-4 rounded"
            />
          </label>
          <label className="bg-secondary hover:bg-secondary-hover flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors">
            <div className="flex items-center gap-3">
              <Lock className="text-warning h-4 w-4" />
              <span className="text-foreground text-sm">Privacy mode</span>
            </div>
            <input
              type="checkbox"
              checked={privacy}
              onChange={() => setPrivacy(!privacy)}
              className="border-border bg-background text-primary focus:ring-primary/30 h-4 w-4 rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
