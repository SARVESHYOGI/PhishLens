import { useState } from 'react';
import { Search, Copy, Shield } from 'lucide-react';

const mockIocs = [
  {
    type: 'domain',
    value: 'company-secure-login.com',
    reputation: 'malicious',
    firstSeen: '2024-01-10',
    age: '2 days',
    source: 'PhishTank',
  },
  {
    type: 'domain',
    value: 'company-secure.com',
    reputation: 'suspicious',
    firstSeen: '2024-01-12',
    age: '3 days',
    source: 'VirusTotal',
  },
  {
    type: 'ip',
    value: '198.51.100.42',
    reputation: 'malicious',
    firstSeen: '2024-01-11',
    age: '2 days',
    source: 'AbuseIPDB',
  },
  {
    type: 'url',
    value: 'https://company-secure-login.com/verify',
    reputation: 'malicious',
    firstSeen: '2024-01-10',
    age: '2 days',
    source: 'URLhaus',
  },
  {
    type: 'hash',
    value: 'a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
    reputation: 'malicious',
    firstSeen: '2024-01-15',
    age: '0 days',
    source: 'Hybrid Analysis',
  },
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

  const filtered = mockIocs.filter((ioc) => ioc.value.toLowerCase().includes(query.toLowerCase()));

  const selected = mockIocs.find((ioc) => ioc.value === selectedIoc);

  return (
    <div className="space-y-6">
      <h1 className="text-foreground text-2xl font-bold">IOC Search / Threat Intelligence</h1>

      <div className="relative max-w-xl">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search domain, IP, hash"
          className="border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/30 w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm focus:ring-1 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Results Table */}
        <div className="border-border bg-card overflow-hidden rounded-2xl border lg:col-span-2">
          <table className="w-full">
            <thead>
              <tr className="border-border border-b">
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Type
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Value
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Reputation
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  First Seen
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {filtered.map((ioc) => (
                <tr
                  key={ioc.value}
                  onClick={() => setSelectedIoc(ioc.value)}
                  className="hover:bg-surface-hover cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm">
                    {typeIcons[ioc.type as keyof typeof typeIcons]}
                  </td>
                  <td className="text-foreground px-4 py-3 font-mono text-sm">{ioc.value}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${reputationColors[ioc.reputation as keyof typeof reputationColors]}`}
                    >
                      {ioc.reputation}
                    </span>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">{ioc.firstSeen}</td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">{ioc.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Drawer */}
        <div className="border-border bg-card h-fit rounded-2xl border p-6">
          {selected ? (
            <div className="space-y-4">
              <h2 className="text-foreground text-sm font-semibold">IOC Details</h2>
              <div className="bg-secondary rounded-xl p-4">
                <div className="text-muted-foreground mb-1 text-xs">Value</div>
                <div className="text-foreground font-mono text-sm break-all">{selected.value}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary rounded-xl p-3">
                  <div className="text-muted-foreground text-xs">Reputation</div>
                  <div className="text-foreground text-sm font-medium capitalize">
                    {selected.reputation}
                  </div>
                </div>
                <div className="bg-secondary rounded-xl p-3">
                  <div className="text-muted-foreground text-xs">First Seen</div>
                  <div className="text-foreground text-sm font-medium">{selected.firstSeen}</div>
                </div>
                <div className="bg-secondary rounded-xl p-3">
                  <div className="text-muted-foreground text-xs">Domain Age</div>
                  <div className="text-foreground text-sm font-medium">{selected.age}</div>
                </div>
                <div className="bg-secondary rounded-xl p-3">
                  <div className="text-muted-foreground text-xs">Source</div>
                  <div className="text-foreground text-sm font-medium">{selected.source}</div>
                </div>
              </div>
              <button className="border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-primary/30 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors">
                <Copy className="h-3.5 w-3.5" /> Copy IOC
              </button>
            </div>
          ) : (
            <div className="text-muted-foreground py-12 text-center">
              <Shield className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p className="text-sm">Select an IOC to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
