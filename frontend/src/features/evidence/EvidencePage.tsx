import { SAMPLE_INVESTIGATION } from '@/constants/sampleData';
import { Filter, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const severityColors = {
  low: 'bg-[#10B981]/20 text-[#10B981]',
  medium: 'bg-[#F59E0B]/20 text-[#F59E0B]',
  high: 'bg-[#EF4444]/20 text-[#EF4444]',
  critical: 'bg-[#EF4444]/30 text-[#EF4444]',
};

const categoryColors = {
  authentication: 'bg-[#3B82F6]/20 text-[#3B82F6]',
  sender: 'bg-[#F59E0B]/20 text-[#F59E0B]',
  url: 'bg-[#EF4444]/20 text-[#EF4444]',
  domain: 'bg-[#8B5CF6]/20 text-[#8B5CF6]',
  content: 'bg-[#10B981]/20 text-[#10B981]',
  attachment: 'bg-[#94A3B8]/20 text-[#94A3B8]',
  ml: 'bg-[#22D3EE]/20 text-[#22D3EE]',
};

export function EvidencePage() {
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const evidence = SAMPLE_INVESTIGATION.evidence;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">Evidence Explorer</h1>
        <div className="flex items-center gap-2">
          {['authentication', 'url', 'domain', 'content', 'ml'].map((cat) => (
            <button key={cat} className="rounded-full bg-[#1E2435] px-3 py-1 text-xs text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#22D3EE]/10 transition-colors capitalize">
              {cat}
            </button>
          ))}
          <button className="rounded-full bg-[#1E2435] px-3 py-1 text-xs text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#22D3EE]/10 transition-colors flex items-center gap-1">
            <Filter className="h-3 w-3" /> Severity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {evidence.map((ev) => (
            <button
              key={ev.id}
              onClick={() => setSelectedEvidence(ev.id)}
              className={`w-full text-left rounded-2xl border p-5 transition-all duration-200 ${
                selectedEvidence === ev.id
                  ? 'border-[#22D3EE]/50 bg-[#22D3EE]/5 shadow-[0_0_20px_rgba(34,211,238,0.1)]'
                  : 'border-[#1E293B] bg-[#0F172A] hover:border-[#22D3EE]/30 hover:bg-[#111827]'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="inline-flex items-center rounded-md bg-[#1E2435] px-2.5 py-1 text-xs font-mono font-semibold text-[#22D3EE]">
                  {ev.id}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${categoryColors[ev.category as keyof typeof categoryColors] || 'bg-[#94A3B8]/20 text-[#94A3B8]'}`}>
                      {ev.category}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${severityColors[ev.severity]}`}>
                      {ev.severity}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#F1F5F9] mb-1">{ev.title}</h3>
                  <p className="text-xs text-[#94A3B8]">{ev.finding}</p>
                </div>
                <ChevronRight className={`h-4 w-4 text-[#22D3EE] shrink-0 transition-transform ${selectedEvidence === ev.id ? 'rotate-90' : ''}`} />
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 h-fit">
          {selectedEvidence ? (
            (() => {
              const ev = evidence.find((e) => e.id === selectedEvidence)!;
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-[#1E2435] px-2.5 py-1 text-xs font-mono font-semibold text-[#22D3EE]">{ev.id}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryColors[ev.category as keyof typeof categoryColors] || 'bg-[#94A3B8]/20 text-[#94A3B8]'}`}>{ev.category}</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#F1F5F9]">{ev.title}</h2>
                  <div className="rounded-xl bg-[#1E2435] p-4">
                    <div className="text-xs text-[#94A3B8] mb-1">Raw Value</div>
                    <div className="text-sm font-mono text-[#F1F5F9]">{ev.rawValue || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#94A3B8] mb-1">Interpretation</div>
                    <p className="text-sm text-[#CBD5E1] leading-relaxed">{ev.interpretation}</p>
                  </div>
                  <div className="rounded-xl bg-[#1E2435] p-4">
                    <div className="text-xs text-[#94A3B8] mb-1">Source</div>
                    <div className="text-xs font-mono text-[#94A3B8]">{ev.source}</div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-center py-12 text-[#94A3B8]">
              <div className="text-sm">Select an evidence card to view details</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
