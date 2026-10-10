import { SAMPLE_INVESTIGATION } from '@/constants/sampleData';
import { severityColors, verdictColors } from '@/constants/colors';
import { Download, AlertTriangle, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { useState } from 'react';

function Gauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? 'var(--destructive)' : score >= 50 ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="relative h-40 w-40">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
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
        <span className="text-foreground text-3xl font-bold">{score}</span>
        <span className="text-muted-foreground text-xs">/100</span>
      </div>
    </div>
  );
}

export function InvestigationPage() {
  const [activeTab, setActiveTab] = useState<
    'authentication' | 'sender' | 'urls' | 'content' | 'attachment'
  >('authentication');
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="text-muted-foreground h-5 w-5" />
          <span className="text-muted-foreground text-sm">{inv.filename}</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${verdictColors[inv.verdict]}`}
          >
            {inv.verdict === 'malicious' ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <CheckCircle2 className="h-3 w-3" />
            )}
            {inv.verdict.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Clock className="h-3.5 w-3.5" />
            {new Date(inv.uploadedAt).toLocaleString()}
          </span>
          <button className="border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors">
            <Download className="h-3.5 w-3.5" />
            Download Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column - Threat Level */}
        <div className="space-y-6 lg:col-span-4">
          {/* Threat Hero Card */}
          <div className="border-border bg-card rounded-2xl border p-6">
            <div className="flex items-center gap-6">
              <Gauge score={inv.riskScore} />
              <div>
                <div className="text-destructive mb-1 text-xs font-semibold tracking-wider uppercase">
                  HIGH RISK
                </div>
                <div className="text-foreground font-medium">Threat Level</div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {inv.attackTypes.map((type) => (
                    <span
                      key={type}
                      className="bg-secondary text-secondary-foreground inline-flex items-center rounded-md px-2 py-0.5 text-xs"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factor Breakdown */}
          <div className="border-border bg-card rounded-2xl border p-6">
            <h3 className="text-foreground mb-4 text-sm font-semibold">Risk Factors</h3>
            <div className="space-y-3">
              {riskFactors.map((factor) => (
                <div key={factor.name} className="flex items-center gap-3">
                  <span className="text-muted-foreground w-20 text-xs">{factor.name}</span>
                  <div className="bg-border h-2 flex-1 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${factor.score}%`, backgroundColor: factor.color }}
                    />
                  </div>
                  <span className="text-foreground w-8 text-right text-xs font-medium">
                    +{factor.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Evidence Panels */}
        <div className="lg:col-span-8">
          {/* Tabs */}
          <div className="border-border mb-6 flex gap-1 overflow-x-auto border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="border-border bg-card rounded-2xl border p-6">
            {activeTab === 'authentication' && (
              <div className="space-y-4">
                {(['spf', 'dkim', 'dmarc'] as const).map((auth) => {
                  const result = inv.auth[auth];
                  const isPass = result.result === 'PASS';
                  const isNone = result.result === 'NONE';
                  return (
                    <div
                      key={auth}
                      className="bg-secondary flex items-center justify-between rounded-xl p-4"
                    >
                      <div>
                        <div className="text-foreground text-sm font-medium capitalize">{auth}</div>
                        <div className="text-muted-foreground mt-0.5 text-xs">
                          Domain: {'domain' in result ? result.domain || '—' : '—'}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          isPass
                            ? 'bg-success/20 text-success'
                            : isNone
                              ? 'bg-muted-foreground/20 text-muted-foreground'
                              : 'bg-destructive/20 text-destructive'
                        }`}
                      >
                        {isPass ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : isNone ? (
                          <Clock className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
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
                  <div className="bg-secondary rounded-xl p-4">
                    <div className="text-muted-foreground mb-1 text-xs">From</div>
                    <div className="text-foreground font-mono text-sm font-medium">
                      {inv.sender.from}
                    </div>
                  </div>
                  <div className="bg-secondary rounded-xl p-4">
                    <div className="text-muted-foreground mb-1 text-xs">Reply-To</div>
                    <div className="text-foreground font-mono text-sm font-medium">
                      {inv.sender.replyTo}
                    </div>
                  </div>
                  <div className="bg-secondary rounded-xl p-4">
                    <div className="text-muted-foreground mb-1 text-xs">Return-Path</div>
                    <div className="text-foreground font-mono text-sm font-medium">
                      {inv.sender.returnPath}
                    </div>
                  </div>
                </div>
                {inv.sender.mismatch && (
                  <div className="bg-destructive/10 border-destructive/20 flex items-center gap-2 rounded-xl border p-3">
                    <AlertTriangle className="text-destructive h-4 w-4" />
                    <span className="text-destructive text-sm">Reply-To mismatch detected</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'urls' && (
              <div className="space-y-3">
                {inv.urls.map((url) => (
                  <div key={url.url} className="bg-secondary rounded-xl p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-foreground font-mono text-sm font-medium">
                        {url.url}
                      </span>
                      <div className="flex gap-1.5">
                        {url.isShortener && (
                          <span className="bg-warning/20 text-warning rounded px-2 py-0.5 text-xs">
                            Shortener
                          </span>
                        )}
                        {url.isHTTPS && (
                          <span className="bg-success/20 text-success rounded px-2 py-0.5 text-xs">
                            HTTPS
                          </span>
                        )}
                        {url.hasPunycode && (
                          <span className="bg-destructive/20 text-destructive rounded px-2 py-0.5 text-xs">
                            Punycode
                          </span>
                        )}
                        {url.isIPBased && (
                          <span className="bg-destructive/20 text-destructive rounded px-2 py-0.5 text-xs">
                            IP-based
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-muted-foreground text-xs">Domain: {url.domain}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {url.riskIndicators.map((indicator) => (
                        <span
                          key={indicator}
                          className="bg-destructive/10 text-destructive rounded px-2 py-0.5 text-xs"
                        >
                          {indicator}
                        </span>
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
                  <div
                    key={item.indicator}
                    className="bg-secondary flex items-center gap-3 rounded-xl p-3"
                  >
                    {item.found ? (
                      <CheckCircle2 className="text-destructive h-4 w-4" />
                    ) : (
                      <XCircle className="text-border h-4 w-4" />
                    )}
                    <span
                      className={`text-sm ${item.found ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      {item.indicator}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'attachment' && (
              <div className="text-muted-foreground py-8 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 opacity-30" />
                <p>No attachments found in this email.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - ML + AI Investigator */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ML Probabilities */}
        <div className="border-border bg-card rounded-2xl border p-6">
          <h3 className="text-foreground mb-4 text-sm font-semibold">ML Classification</h3>
          <div className="space-y-3">
            {Object.entries(inv.ml).map(([label, prob]) => {
              const color =
                prob > 70 ? 'var(--destructive)' : prob > 30 ? 'var(--warning)' : 'var(--success)';
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-muted-foreground w-24 text-xs capitalize">{label}</span>
                  <div className="bg-border h-2 flex-1 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${prob}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-foreground w-10 text-right text-xs font-medium">
                    {prob}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Investigator */}
        <div className="border-border bg-card rounded-2xl border p-6">
          <h3 className="text-foreground mb-4 text-sm font-semibold">AI Investigator</h3>
          <p className="text-secondary-foreground mb-4 text-sm leading-relaxed">{inv.summary}</p>
          <div className="flex flex-wrap gap-1.5">
            {inv.evidence.slice(0, 3).map((ev) => (
              <span
                key={ev.id}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${severityColors[ev.severity]}`}
              >
                {ev.id}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
