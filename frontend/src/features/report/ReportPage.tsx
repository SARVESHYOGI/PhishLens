import { SAMPLE_INVESTIGATION } from '@/constants/sampleData';
import { severityColors, verdictColors, categoryColors } from '@/constants/colors';
import { Shield, CheckCircle2, AlertTriangle, Download, Clock, TrendingUp, Layout, List, Settings, Circle } from 'lucide-react';
import { useState } from 'react';

function MiniGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 24;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'var(--destructive)' : score >= 50 ? 'var(--warning)' : 'var(--success)';

  return (
    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="22" stroke="var(--border)" strokeWidth="3" fill="none" />
      <circle
        cx="25"
        cy="25"
        r="22"
        stroke={color}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000"
      />
    </svg>
  );
}

export function ReportPage() {
  const inv = SAMPLE_INVESTIGATION;
  const [activeTab, setActiveTab] = useState<'executive' | 'verdict' | 'evidence' | 'iocs' | 'timeline' | 'recommendations'>('executive');

  const tabs = [
    { id: 'executive', label: 'Executive Summary' },
    { id: 'verdict', label: 'Verdict' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'iocs', label: 'IOCs' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'recommendations', label: 'Recommendations' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-foreground">Forensic Report</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(inv.uploadedAt).toLocaleDateString()}
          </span>
          <button className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
            <Download className="h-3 w-3" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 border-r border-border">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full text-left rounded-lg p-3 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'text-muted-foreground hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {tab.id === 'executive' && <Layout className="h-4 w-4" />}
                    {tab.id === 'verdict' && <Shield className="h-4 w-4" />}
                    {tab.id === 'evidence' && <List className="h-4 w-4" />}
                    {tab.id === 'iocs' && <Circle className="h-4 w-4" />}
                    {tab.id === 'timeline' && <TrendingUp className="h-4 w-4" />}
                    {tab.id === 'recommendations' && <Settings className="h-4 w-4" />}
                  </div>
                  <span className="text-sm font-medium">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 rounded-2xl border border-border bg-card p-6">
          {activeTab === 'executive' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Executive Summary</h2>
              <p className="text-sm text-secondary-foreground leading-relaxed">{inv.summary}</p>
            </div>
          )}

          {activeTab === 'verdict' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Verdict & Risk Assessment</h2>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <MiniGauge score={inv.riskScore} />
                  <div>
                    <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${verdictColors[inv.verdict]}`}>
                      {inv.verdict.toUpperCase()}
                    </div>
                    <div className="text-2xl font-bold text-foreground">{inv.riskScore}/100</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                    <span className="text-sm text-destructive">Attack Type: {inv.attackTypes.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    <span className="text-sm text-success">Confidence: {inv.ml.phishing}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">Evidence Summary</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-border">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Finding</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {inv.evidence.map((ev) => (
                      <tr key={ev.id} className="hover:bg-surface-hover">
                        <td className="px-4 py-3 text-sm font-mono">{ev.id}</td>
                        <td className="px-4 py-3 text-sm capitalize">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryColors[ev.category as keyof typeof categoryColors] || 'bg-muted-foreground/20 text-muted-foreground'}`}>
                            {ev.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-secondary-foreground">{ev.finding}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${severityColors[ev.severity]}`}>
                            {ev.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'iocs' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">Indicators of Compromise</h2>
              <div className="space-y-3">
                {inv.iocs.map((ioc) => (
                  <div key={ioc.value} className="flex items-center justify-between p-4 rounded-xl bg-secondary">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ioc.type === 'domain' ? 'bg-info/20 text-info' : ioc.type === 'ip' ? 'bg-destructive/20 text-destructive' : ioc.type === 'url' ? 'bg-warning/20 text-warning' : ioc.type === 'hash' ? 'bg-purple/20 text-purple' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                          {ioc.type.toUpperCase()}
                        </span>
                        <div className="text-sm font-mono text-foreground">{ioc.value}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${severityColors[ioc.severity]}`}>
                        {ioc.severity}
                      </span>
                      <span className="text-xs text-muted-foreground">{ioc.reputation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">Attack Timeline</h2>
              <div className="space-y-3">
                {inv.timeline.map((event, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-secondary">
                    <div className="flex-shrink-0">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">{event.timestamp}</div>
                      <div className="text-sm text-foreground">{event.event}</div>
                      {event.source && (
                        <div className="text-xs text-muted-foreground mt-1">({event.source})</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recommendations</h2>
              <div className="space-y-3">
                {inv.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Circle className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-secondary-foreground leading-relaxed">{i + 1}. {rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
