import { useState } from 'react';
import { Bell, Lock } from 'lucide-react';

export function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(true);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <h2 className="text-lg font-semibold text-foreground">Account</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              defaultValue="analyst@company.com"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Display Name</label>
            <input
              type="text"
              defaultValue="SOC Analyst"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <h2 className="text-lg font-semibold text-foreground">Preferences</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 rounded-xl bg-secondary cursor-pointer hover:bg-secondary-hover transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">Enable notifications</span>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/30"
            />
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl bg-secondary cursor-pointer hover:bg-secondary-hover transition-colors">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-warning" />
              <span className="text-sm text-foreground">Privacy mode</span>
            </div>
            <input
              type="checkbox"
              checked={privacy}
              onChange={() => setPrivacy(!privacy)}
              className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/30"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
