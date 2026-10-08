import { SAMPLE_INVESTIGATION } from '@/constants/sampleData';
import { severityColors, verdictColors } from '@/constants/colors';
import { Download, AlertTriangle, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { useState } from 'react';

function Gauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'var(--destructive)' : score >= 50 ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" stroke="var(--border)" strokeWidth="6" fill="none" />
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

export function InvestigationPage() {
  const [activeTab, setActiveTab] = useState<'authentication' | 'sender' | 'urls' | 'content' | 'attachment'>('authentication');
  const inv = SAMPLE_INVESTIGATION;

  const riskFactors = [
    { name: 'Authentication', score: 25, color: 'var(--destructive)' },
    { name: 'URL', score: 20, color: 'var(--destructive)' },
    { name: 'Domain', score: 20, color: 'var(--warning)' },
    { name: 'Sender', score: 15, color: 'var(--warning)' },
    { name: 'Content', score: 10, color: 'var(--warning)' },
    { name: 'ML', score: 4, color: 'var(--success)' },
  ];

  const tabs = [
    { id: 'authentication', label: 'Authentication' },
    { id: 'sender', label: 'Sender' },
    { id: 'urls', label: 'URLs' },
    { id: 'content', label: 'Content' },
    { id: 'attachment', label: 'Attachment' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">{inv.filename}</span>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${verdictColors[inv.verdict]}`}>
            {inv.verdict === 'malicious' ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
            {inv.verdict.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-sm flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {new Date(inv.uploadedAt).toLocaleString()}
          </span>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
            <Download className="h-3.5 w-3.5" />
            Download Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Threat Level */}
        <div className="lg:col-span-4 space-y-6">
          {/* Threat Hero Card */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-6">
              <Gauge score={inv.riskScore} />
              <div>
                <div className="text-xs font-semibold text-destructive uppercase tracking-wider mb-1">HIGH RISK</div>
                <div className="text-foreground font-medium">Threat Level</div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {inv.attackTypes.map((type) => (
                    <span key={type} className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factor Breakdown */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Risk Factors</h3>
            <div className="space-y-3">
              {riskFactors.map((factor) => (
                <div key={factor.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20">{factor.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${factor.score}%`, backgroundColor: factor.color }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground w-8 text-right">+{factor.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Evidence Panels */}
        <div className="lg:col-span-8">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="rounded-2xl border border-border bg-card p-6">
            {activeTab === 'authentication' && (
              <div className="space-y-4">
                {(['spf', 'dkim', 'dmarc'] as const).map((auth) => {
                  const result = inv.auth[auth];
                  const isPass = result.result === 'PASS';
                  const isNone = result.result === 'NONE';
                  return (
                    <div key={auth} className="flex items-center justify-between p-4 rounded-xl bg-secondary">
                      <div>
                        <div className="text-sm font-medium text-foreground capitalize">{auth}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Domain: {'domain' in result ? result.domain || '—' : '—'}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        isPass ? 'bg-success/20 text-success' : isNone ? 'bg-muted-foreground/20 text-muted-foreground' : 'bg-destructive/20 text-destructive'
                      }`}>
                        {isPass ? <CheckCircle2 className="h-3 w-3" /> : isNone ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {result.result}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'sender' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-secondary">
                    <div className="text-xs text-muted-foreground mb-1">From</div>
                    <div className="text-sm font-medium text-foreground mono">{inv.sender.from}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary">
                    <div className="text-xs text-muted-foreground mb-1">Reply-To</div>
                    <div className="text-sm font-medium text-foreground mono">{inv.sender.replyTo}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary">
                    <div className="text-xs text-muted-foreground mb-1">Return-Path</div>
                    <div className="text-sm font-medium text-foreground mono">{inv.sender.returnPath}</div>
                  </div>
                </div>
                {inv.sender.mismatch && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">Reply-To mismatch detected</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'urls' && (
              <div className="space-y-3">
                {inv.urls.map((url) => (
                  <div key={url.url} className="p-4 rounded-xl bg-secondary">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground mono">{url.url}</span>
                      <div className="flex gap-1.5">
                        {url.isShortener && <span className="rounded bg-warning/20 px-2 py-0.5 text-xs text-warning">Shortener</span>}
                        {url.isHTTPS && <span className="rounded bg-success/20 px-2 py-0.5 text-xs text-success">HTTPS</span>}
                        {url.hasPunycode && <span className="rounded bg-destructive/20 px-2 py-0.5 text-xs text-destructive">Punycode</span>}
                        {url.isIPBased && <span className="rounded bg-destructive/20 px-2 py-0.5 text-xs text-destructive">IP-based</span>}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Domain: {url.domain}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {url.riskIndicators.map((indicator) => (
                        <span key={indicator} className="rounded bg-destructive/10 px-2 py-0.5 text-xs text-destructive">{indicator}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-3">
                {[
                  { indicator: 'Urgency language', found: true },
                  { indicator: 'Financial request', found: true },
                  { indicator: 'Credential request', found: true },
                  { indicator: 'Secrecy pressure', found: false },
                ].map((item) => (
                  <div key={item.indicator} className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                    {item.found ? (
                      <CheckCircle2 className="h-4 w-4 text-destructive" />
                    ) : (
                      <XCircle className="h-4 w-4 text-border" />
                    )}
                    <span className={`text-sm ${item.found ? 'text-foreground' : 'text-muted-foreground'}`}>{item.indicator}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'attachment' && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No attachments found in this email.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - ML + AI Investigator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Probabilities */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">ML Classification</h3>
          <div className="space-y-3">
            {Object.entries(inv.ml).map(([label, prob]) => {
              const color = prob > 70 ? 'var(--destructive)' : prob > 30 ? 'var(--warning)' : 'var(--success)';
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 capitalize">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${prob}%`, backgroundColor: color }} />
                  </div>
                  <span className="text-xs font-medium text-foreground w-10 text-right">{prob}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Investigator */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">AI Investigator</h3>
          <p className="text-sm text-secondary-foreground leading-relaxed mb-4">{inv.summary}</p>
          <div className="flex flex-wrap gap-1.5">
            {inv.evidence.slice(0, 3).map((ev) => (
              <span key={ev.id} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${severityColors[ev.severity]}`}>
                {ev.id}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
