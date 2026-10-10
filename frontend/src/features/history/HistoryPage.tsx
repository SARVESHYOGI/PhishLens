import { SAMPLE_INVESTIGATION } from '@/constants/sampleData';
import { verdictColors } from '@/constants/colors';
import { Search, Download, Eye, Trash2, FileText } from 'lucide-react';

const mockHistory = [
  { ...SAMPLE_INVESTIGATION, id: 'EV-2024-001' },
  {
    ...SAMPLE_INVESTIGATION,
    id: 'EV-2024-002',
    filename: 'invoice_update.eml',
    riskScore: 78,
    verdict: 'malicious' as const,
    uploadedAt: '2024-01-14T14:32:10Z',
    attackTypes: ['Phishing'],
  },
  {
    ...SAMPLE_INVESTIGATION,
    id: 'EV-2024-003',
    filename: 'meeting_notes.eml',
    riskScore: 12,
    verdict: 'benign' as const,
    uploadedAt: '2024-01-13T08:15:22Z',
    attackTypes: [],
  },
];

export function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-2xl font-bold">Investigation History</h1>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search investigations..."
            className="border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/30 rounded-lg border py-2 pr-4 pl-10 text-sm focus:ring-1 focus:outline-none"
          />
        </div>
      </div>

      <div className="border-border bg-card overflow-hidden rounded-2xl border">
        <table className="w-full">
          <thead>
            <tr className="border-border border-b">
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                File
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Date
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Risk
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Verdict
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Attack Type
              </th>
              <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium tracking-wider uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {mockHistory.map((item) => (
              <tr key={item.id} className="hover:bg-surface-hover">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="text-muted-foreground h-4 w-4" />
                    <span className="text-foreground font-mono text-sm font-medium">
                      {item.filename}
                    </span>
                  </div>
                </td>
                <td className="text-muted-foreground px-6 py-4 text-sm">
                  {new Date(item.uploadedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="text-foreground text-sm font-bold">{item.riskScore}</div>
                    <div className="bg-border h-2 w-12 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.riskScore}%`,
                          backgroundColor:
                            item.riskScore >= 80
                              ? 'var(--destructive)'
                              : item.riskScore >= 50
                                ? 'var(--warning)'
                                : 'var(--success)',
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${verdictColors[item.verdict]}`}
                  >
                    {item.verdict === 'malicious' ? '⚠' : item.verdict === 'benign' ? '✓' : '•'}
                    {item.verdict.toUpperCase()}
                  </span>
                </td>
                <td className="text-muted-foreground px-6 py-4 text-sm">
                  {item.attackTypes.length > 0 ? item.attackTypes.join(', ') : '—'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      aria-label={`View ${item.filename}`}
                      className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg p-1.5 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      aria-label={`Download ${item.filename}`}
                      className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg p-1.5 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      aria-label={`Delete ${item.filename}`}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg p-1.5 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
