import { useState } from 'react';
import { Search, Copy, Shield } from 'lucide-react';

const mockIocs = [
  { type: 'domain', value: 'company-secure-login.com', reputation: 'malicious', firstSeen: '2024-01-10', age: '2 days', source: 'PhishTank' },
  { type: 'domain', value: 'company-secure.com', reputation: 'suspicious', firstSeen: '2024-01-12', age: '3 days', source: 'VirusTotal' },
  { type: 'ip', value: '198.51.100.42', reputation: 'malicious', firstSeen: '2024-01-11', age: '2 days', source: 'AbuseIPDB' },
  { type: 'url', value: 'https://company-secure-login.com/verify', reputation: 'malicious', firstSeen: '2024-01-10', age: '2 days', source: 'URLhaus' },
  { type: 'hash', value: 'a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1', reputation: 'malicious', firstSeen: '2024-01-15', age: '0 days', source: 'Hybrid Analysis' },
];

const typeIcons = {
  domain: '🌐',
  ip: '🔢',
  url: '🔗',
  hash: '🔑',
  email: '📧',
};

const reputationColors = {
  malicious: 'bg-destructive/20 text-destructive',
  suspicious: 'bg-warning/20 text-warning',
  benign: 'bg-success/20 text-success',
};

export function IocPage() {
  const [query, setQuery] = useState('');
  const [selectedIoc, setSelectedIoc] = useState<string | null>(null);

  const filtered = mockIocs.filter((ioc) =>
    ioc.value.toLowerCase().includes(query.toLowerCase())
  );

  const selected = mockIocs.find((ioc) => ioc.value === selectedIoc);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">IOC Search / Threat Intelligence</h1>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search domain, IP, hash"
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results Table */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Value</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Reputation</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">First Seen</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((ioc) => (
                <tr
                  key={ioc.value}
                  onClick={() => setSelectedIoc(ioc.value)}
                  className="hover:bg-surface-hover cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm">{typeIcons[ioc.type as keyof typeof typeIcons]}</td>
                  <td className="px-4 py-3 text-sm font-mono text-foreground">{ioc.value}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${reputationColors[ioc.reputation as keyof typeof reputationColors]}`}>
                      {ioc.reputation}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{ioc.firstSeen}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{ioc.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Drawer */}
        <div className="rounded-2xl border border-border bg-card p-6 h-fit">
          {selected ? (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground">IOC Details</h2>
              <div className="rounded-xl bg-secondary p-4">
                <div className="text-xs text-muted-foreground mb-1">Value</div>
                <div className="text-sm font-mono text-foreground break-all">{selected.value}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-secondary p-3">
                  <div className="text-xs text-muted-foreground">Reputation</div>
                  <div className="text-sm font-medium text-foreground capitalize">{selected.reputation}</div>
                </div>
                <div className="rounded-xl bg-secondary p-3">
                  <div className="text-xs text-muted-foreground">First Seen</div>
                  <div className="text-sm font-medium text-foreground">{selected.firstSeen}</div>
                </div>
                <div className="rounded-xl bg-secondary p-3">
                  <div className="text-xs text-muted-foreground">Domain Age</div>
                  <div className="text-sm font-medium text-foreground">{selected.age}</div>
                </div>
                <div className="rounded-xl bg-secondary p-3">
                  <div className="text-xs text-muted-foreground">Source</div>
                  <div className="text-sm font-medium text-foreground">{selected.source}</div>
                </div>
              </div>
              <button className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors flex items-center justify-center gap-2">
                <Copy className="h-3.5 w-3.5" /> Copy IOC
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select an IOC to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
