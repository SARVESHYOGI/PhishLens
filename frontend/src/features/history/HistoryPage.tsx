import { SAMPLE_INVESTIGATION } from '@/constants/sampleData';
import { verdictColors } from '@/constants/colors';
import { Search, Download, Eye, Trash2, FileText } from 'lucide-react';

const mockHistory = [
  { ...SAMPLE_INVESTIGATION, id: 'EV-2024-001' },
  { ...SAMPLE_INVESTIGATION, id: 'EV-2024-002', filename: 'invoice_update.eml', riskScore: 78, verdict: 'malicious' as const, uploadedAt: '2024-01-14T14:32:10Z', attackTypes: ['Phishing'] },
  { ...SAMPLE_INVESTIGATION, id: 'EV-2024-003', filename: 'meeting_notes.eml', riskScore: 12, verdict: 'benign' as const, uploadedAt: '2024-01-13T08:15:22Z', attackTypes: [] },
];

export function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-foreground">Investigation History</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search investigations..."
            className="rounded-lg border border-border bg-card pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">File</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Verdict</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Attack Type</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockHistory.map((item) => (
              <tr key={item.id} className="hover:bg-surface-hover">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground mono">{item.filename}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(item.uploadedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-foreground">{item.riskScore}</div>
                    <div className="w-12 h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.riskScore}%`,
                          backgroundColor: item.riskScore >= 80 ? 'var(--destructive)' : item.riskScore >= 50 ? 'var(--warning)' : 'var(--success)',
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${verdictColors[item.verdict]}`}>
                    {item.verdict === 'malicious' ? '⚠' : item.verdict === 'benign' ? '✓' : '•'}
                    {item.verdict.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {item.attackTypes.length > 0 ? item.attackTypes.join(', ') : '—'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
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
