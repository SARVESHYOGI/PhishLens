import { SAMPLE_INVESTIGATION } from '@/constants/sampleData';
import { Search, Download, Eye, Trash2, FileText } from 'lucide-react';

const mockHistory = [
  { ...SAMPLE_INVESTIGATION, id: 'EV-2024-001' },
  { ...SAMPLE_INVESTIGATION, id: 'EV-2024-002', filename: 'invoice_update.eml', riskScore: 78, verdict: 'malicious' as const, uploadedAt: '2024-01-14T14:32:10Z', attackTypes: ['Phishing'] },
  { ...SAMPLE_INVESTIGATION, id: 'EV-2024-003', filename: 'meeting_notes.eml', riskScore: 12, verdict: 'benign' as const, uploadedAt: '2024-01-13T08:15:22Z', attackTypes: [] },
];

const verdictColors = {
  malicious: 'bg-[#EF4444]/20 text-[#EF4444]',
  benign: 'bg-[#10B981]/20 text-[#10B981]',
  suspicious: 'bg-[#F59E0B]/20 text-[#F59E0B]',
};

export function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">Investigation History</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search investigations..."
            className="rounded-lg border border-[#1E293B] bg-[#0F172A] pl-10 pr-4 py-2 text-sm text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/30"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1E293B]">
              <th className="text-left px-6 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider">File</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Date</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Risk</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Verdict</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Attack Type</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {mockHistory.map((item) => (
              <tr key={item.id} className="hover:bg-[#111827]">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-[#94A3B8]" />
                    <span className="text-sm font-medium text-[#F1F5F9] mono">{item.filename}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#94A3B8]">
                  {new Date(item.uploadedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-[#F1F5F9]">{item.riskScore}</div>
                    <div className="w-12 h-2 rounded-full bg-[#1E293B] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.riskScore}%`,
                          backgroundColor: item.riskScore >= 80 ? '#EF4444' : item.riskScore >= 50 ? '#F59E0B' : '#10B981',
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
                <td className="px-6 py-4 text-sm text-[#94A3B8]">
                  {item.attackTypes.length > 0 ? item.attackTypes.join(', ') : '—'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="rounded-lg p-1.5 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E2435] transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-1.5 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E2435] transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-1.5 text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors">
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
