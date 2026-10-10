import { SAMPLE_INVESTIGATION } from '@/constants/sampleData';
import { severityColors, categoryColors } from '@/constants/colors';
import { Filter, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function EvidencePage() {
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const evidence = SAMPLE_INVESTIGATION.evidence;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-2xl font-bold">Evidence Explorer</h1>
        <div className="flex items-center gap-2">
          {['authentication', 'url', 'domain', 'content', 'ml'].map((cat) => (
            <button
              key={cat}
              className="bg-secondary text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-full px-3 py-1 text-xs capitalize transition-colors"
            >
              {cat}
            </button>
          ))}
          <button className="bg-secondary text-muted-foreground hover:text-foreground hover:bg-primary/10 flex items-center gap-1 rounded-full px-3 py-1 text-xs transition-colors">
            <Filter className="h-3 w-3" /> Severity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {evidence.map((ev) => (
            <button
              key={ev.id}
              onClick={() => setSelectedEvidence(ev.id)}
              className={`w-full rounded-2xl border p-5 text-left transition-all duration-200 ${
                selectedEvidence === ev.id
                  ? 'border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(34,211,238,0.1)]'
                  : 'border-border bg-card hover:border-primary/30 hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="bg-secondary text-primary inline-flex items-center rounded-md px-2.5 py-1 font-mono text-xs font-semibold">
                  {ev.id}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${categoryColors[ev.category as keyof typeof categoryColors] || 'bg-muted-foreground/20 text-muted-foreground'}`}
                    >
                      {ev.category}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${severityColors[ev.severity]}`}
                    >
                      {ev.severity}
                    </span>
                  </div>
                  <h3 className="text-foreground mb-1 text-sm font-semibold">{ev.title}</h3>
                  <p className="text-muted-foreground text-xs">{ev.finding}</p>
                </div>
                <ChevronRight
                  className={`text-primary h-4 w-4 shrink-0 transition-transform ${selectedEvidence === ev.id ? 'rotate-90' : ''}`}
                />
              </div>
            </button>
          ))}
        </div>

        <div className="border-border bg-card h-fit rounded-2xl border p-6">
          {selectedEvidence ? (
            (() => {
              const ev = evidence.find((e) => e.id === selectedEvidence)!;
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-secondary text-primary rounded-md px-2.5 py-1 font-mono text-xs font-semibold">
                      {ev.id}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryColors[ev.category as keyof typeof categoryColors] || 'bg-muted-foreground/20 text-muted-foreground'}`}
                    >
                      {ev.category}
                    </span>
                  </div>
                  <h2 className="text-foreground text-lg font-bold">{ev.title}</h2>
                  <div className="bg-secondary rounded-xl p-4">
                    <div className="text-muted-foreground mb-1 text-xs">Raw Value</div>
                    <div className="text-foreground font-mono text-sm">{ev.rawValue || '—'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1 text-xs">Interpretation</div>
                    <p className="text-secondary-foreground text-sm leading-relaxed">
                      {ev.interpretation}
                    </p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4">
                    <div className="text-muted-foreground mb-1 text-xs">Source</div>
                    <div className="text-muted-foreground font-mono text-xs">{ev.source}</div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-muted-foreground py-12 text-center">
              <div className="text-sm">Select an evidence card to view details</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
