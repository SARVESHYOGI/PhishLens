import { SAMPLE_INVESTIGATION } from '@/constants/sampleData';
import { severityColors, verdictColors, categoryColors } from '@/constants/colors';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Download,
  Clock,
  TrendingUp,
  Layout,
  List,
  Settings,
  Circle,
} from 'lucide-react';
import { useState } from 'react';

function MiniGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 24;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? 'var(--destructive)' : score >= 50 ? 'var(--warning)' : 'var(--success)';

  return (
    <svg className="h-12 w-12 -rotate-90" viewBox="0 0 50 50">
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
  const [activeTab, setActiveTab] = useState<
    'executive' | 'verdict' | 'evidence' | 'iocs' | 'timeline' | 'recommendations'
  >('executive');

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-2xl font-bold">Forensic Report</h1>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1 text-sm">
            <Clock className="h-3 w-3" />
            {new Date(inv.uploadedAt).toLocaleDateString()}
          </span>
          <button className="border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 rounded-lg border px-3 py-1.5 text-sm transition-colors">
            <Download className="h-3 w-3" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="border-border w-64 border-r">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full rounded-lg p-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary border-primary border-l-4'
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
        <div className="border-border bg-card flex-1 rounded-2xl border p-6">
          {activeTab === 'executive' && (
            <div className="space-y-6">
              <h2 className="text-foreground mb-4 text-lg font-semibold">Executive Summary</h2>
              <p className="text-secondary-foreground text-sm leading-relaxed">{inv.summary}</p>
            </div>
          )}

          {activeTab === 'verdict' && (
            <div className="space-y-6">
              <h2 className="text-foreground mb-4 text-lg font-semibold">
                Verdict & Risk Assessment
              </h2>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <MiniGauge score={inv.riskScore} />
                  <div>
                    <div
                      className={`mb-1 text-xs font-semibold tracking-wider uppercase ${verdictColors[inv.verdict]}`}
                    >
                      {inv.verdict.toUpperCase()}
                    </div>
                    <div className="text-foreground text-2xl font-bold">{inv.riskScore}/100</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle className="text-destructive h-3 w-3" />
                    <span className="text-destructive text-sm">
                      Attack Type: {inv.attackTypes.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-success h-3 w-3" />
                    <span className="text-success text-sm">Confidence: {inv.ml.phishing}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <h2 className="text-foreground mb-4 text-lg font-semibold">Evidence Summary</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-border">
                      <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                        ID
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                        Category
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                        Finding
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                        Severity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {inv.evidence.map((ev) => (
                      <tr key={ev.id} className="hover:bg-surface-hover">
                        <td className="px-4 py-3 font-mono text-sm">{ev.id}</td>
                        <td className="px-4 py-3 text-sm capitalize">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryColors[ev.category as keyof typeof categoryColors] || 'bg-muted-foreground/20 text-muted-foreground'}`}
                          >
                            {ev.category}
                          </span>
                        </td>
                        <td className="text-secondary-foreground px-4 py-3 text-sm">
                          {ev.finding}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${severityColors[ev.severity]}`}
                          >
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
              <h2 className="text-foreground mb-4 text-lg font-semibold">
                Indicators of Compromise
              </h2>
              <div className="space-y-3">
                {inv.iocs.map((ioc) => (
                  <div
                    key={ioc.value}
                    className="bg-secondary flex items-center justify-between rounded-xl p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ioc.type === 'domain' ? 'bg-info/20 text-info' : ioc.type === 'ip' ? 'bg-destructive/20 text-destructive' : ioc.type === 'url' ? 'bg-warning/20 text-warning' : ioc.type === 'hash' ? 'bg-purple/20 text-purple' : 'bg-muted-foreground/20 text-muted-foreground'}`}
                        >
                          {ioc.type.toUpperCase()}
                        </span>
                        <div className="text-foreground font-mono text-sm">{ioc.value}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${severityColors[ioc.severity]}`}
                      >
                        {ioc.severity}
                      </span>
                      <span className="text-muted-foreground text-xs">{ioc.reputation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h2 className="text-foreground mb-4 text-lg font-semibold">Attack Timeline</h2>
              <div className="space-y-3">
                {inv.timeline.map((event, i) => (
                  <div key={i} className="bg-secondary flex items-start gap-4 rounded-xl p-4">
                    <div className="flex-shrink-0">
                      <div className="bg-primary h-2.5 w-2.5 flex-shrink-0 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <div className="text-muted-foreground mb-1 text-xs">{event.timestamp}</div>
                      <div className="text-foreground text-sm">{event.event}</div>
                      {event.source && (
                        <div className="text-muted-foreground mt-1 text-xs">({event.source})</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <h2 className="text-foreground mb-4 text-lg font-semibold">Recommendations</h2>
              <div className="space-y-3">
                {inv.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Circle className="bg-primary h-2.5 w-2.5 flex-shrink-0 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <p className="text-secondary-foreground text-sm leading-relaxed">
                        {i + 1}. {rec}
                      </p>
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
