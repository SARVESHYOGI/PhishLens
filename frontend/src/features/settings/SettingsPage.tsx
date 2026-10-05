import { useState } from 'react';
import { Bell, Lock } from 'lucide-react';

export function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(true);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#F1F5F9]">Settings</h1>

      <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 space-y-6">
        <h2 className="text-lg font-semibold text-[#F1F5F9]">Account</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#F1F5F9] mb-1">Email</label>
            <input
              type="email"
              defaultValue="analyst@company.com"
              className="w-full px-4 py-2.5 rounded-lg border border-[#1E293B] bg-[#0A0F1E] text-[#F1F5F9] text-sm focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#F1F5F9] mb-1">Display Name</label>
            <input
              type="text"
              defaultValue="SOC Analyst"
              className="w-full px-4 py-2.5 rounded-lg border border-[#1E293B] bg-[#0A0F1E] text-[#F1F5F9] text-sm focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/30"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 space-y-6">
        <h2 className="text-lg font-semibold text-[#F1F5F9]">Preferences</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#1E2435] cursor-pointer hover:bg-[#222d3d] transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-[#22D3EE]" />
              <span className="text-sm text-[#F1F5F9]">Enable notifications</span>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="h-4 w-4 rounded border-[#1E293B] bg-[#0A0F1E] text-[#22D3EE] focus:ring-[#22D3EE]/30"
            />
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#1E2435] cursor-pointer hover:bg-[#222d3d] transition-colors">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-[#F59E0B]" />
              <span className="text-sm text-[#F1F5F9]">Privacy mode</span>
            </div>
            <input
              type="checkbox"
              checked={privacy}
              onChange={() => setPrivacy(!privacy)}
              className="h-4 w-4 rounded border-[#1E293B] bg-[#0A0F1E] text-[#22D3EE] focus:ring-[#22D3EE]/30"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
