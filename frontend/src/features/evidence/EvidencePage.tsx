import { SAMPLE_INVESTIGATION } from '@/constants/sampleData';
import { severityColors, categoryColors } from '@/constants/colors';
import { Filter, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function EvidencePage() {
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const evidence = SAMPLE_INVESTIGATION.evidence;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-foreground">Evidence Explorer</h1>
        <div className="flex items-center gap-2">
          {['authentication', 'url', 'domain', 'content', 'ml'].map((cat) => (
            <button key={cat} className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors capitalize">
              {cat}
            </button>
          ))}
          <button className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors flex items-center gap-1">
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
                  ? 'border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(34,211,238,0.1)]'
                  : 'border-border bg-card hover:border-primary/30 hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-mono font-semibold text-primary">
                  {ev.id}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${categoryColors[ev.category as keyof typeof categoryColors] || 'bg-muted-foreground/20 text-muted-foreground'}`}>
                      {ev.category}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${severityColors[ev.severity]}`}>
                      {ev.severity}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{ev.title}</h3>
                  <p className="text-xs text-muted-foreground">{ev.finding}</p>
                </div>
                <ChevronRight className={`h-4 w-4 text-primary shrink-0 transition-transform ${selectedEvidence === ev.id ? 'rotate-90' : ''}`} />
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 h-fit">
          {selectedEvidence ? (
            (() => {
              const ev = evidence.find((e) => e.id === selectedEvidence)!;
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-mono font-semibold text-primary">{ev.id}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryColors[ev.category as keyof typeof categoryColors] || 'bg-muted-foreground/20 text-muted-foreground'}`}>{ev.category}</span>
                  </div>
                  <h2 className="text-lg font-bold text-foreground">{ev.title}</h2>
                  <div className="rounded-xl bg-secondary p-4">
                    <div className="text-xs text-muted-foreground mb-1">Raw Value</div>
                    <div className="text-sm font-mono text-foreground">{ev.rawValue || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Interpretation</div>
                    <p className="text-sm text-secondary-foreground leading-relaxed">{ev.interpretation}</p>
                  </div>
                  <div className="rounded-xl bg-secondary p-4">
                    <div className="text-xs text-muted-foreground mb-1">Source</div>
                    <div className="text-xs font-mono text-muted-foreground">{ev.source}</div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-sm">Select an evidence card to view details</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
