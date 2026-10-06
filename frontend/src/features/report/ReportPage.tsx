import { SAMPLE_INVESTIGATION } from '@/constants/sampleData';
import { severityColors, verdictColors, categoryColors } from '@/constants/colors';
import { Shield, CheckCircle2, AlertTriangle, Download, Clock, TrendingUp, Layout, List, Settings, Circle } from 'lucide-react';
import { useState } from 'react';

function MiniGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 24;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#EF4444' : score >= 50 ? '#F59E0B' : '#10B981';

  return (
    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="22" stroke="#1E293B" strokeWidth="3" fill="none" />
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
        <h1 className="text-2xl font-bold text-[#F1F5F9]">Forensic Report</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#94A3B8] flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(inv.uploadedAt).toLocaleDateString()}
          </span>
          <button className="rounded-lg border border-[#1E293B] bg-[#0F172A] px-3 py-1.5 text-sm text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#22D3EE]/30 transition-colors">
            <Download className="h-3 w-3" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 border-r border-[#1E293B]">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full text-left rounded-lg p-3 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#22D3EE]/10 text-[#22D3EE] border-l-4 border-[#22D3EE]'
                    : 'text-[#94A3B8] hover:bg-[#111827]'
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
        <div className="flex-1 rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6">
          {activeTab === 'executive' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Executive Summary</h2>
              <p className="text-sm text-[#CBD5E1] leading-relaxed">{inv.summary}</p>
            </div>
          )}

          {activeTab === 'verdict' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Verdict & Risk Assessment</h2>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <MiniGauge score={inv.riskScore} />
                  <div>
                    <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${verdictColors[inv.verdict]}`}>
                      {inv.verdict.toUpperCase()}
                    </div>
                    <div className="text-2xl font-bold text-[#F1F5F9]">{inv.riskScore}/100</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-3 w-3 text-[#EF4444]" />
                    <span className="text-sm text-[#EF4444]">Attack Type: {inv.attackTypes.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-[#10B981]" />
                    <span className="text-sm text-[#10B981]">Confidence: {inv.ml.phishing}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Evidence Summary</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#1E293B]">
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider">ID</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Finding</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {inv.evidence.map((ev) => (
                      <tr key={ev.id} className="hover:bg-[#111827]">
                        <td className="px-4 py-3 text-sm font-mono">{ev.id}</td>
                        <td className="px-4 py-3 text-sm capitalize">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryColors[ev.category as keyof typeof categoryColors] || 'bg-[#94A3B8]/20 text-[#94A3B8]'}`}>
                            {ev.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#CBD5E1]">{ev.finding}</td>
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
              <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Indicators of Compromise</h2>
              <div className="space-y-3">
                {inv.iocs.map((ioc) => (
                  <div key={ioc.value} className="flex items-center justify-between p-4 rounded-xl bg-[#1E2435]">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ioc.type === 'domain' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : ioc.type === 'ip' ? 'bg-[#EF4444]/20 text-[#EF4444]' : ioc.type === 'url' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : ioc.type === 'hash' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-[#94A3B8]/20 text-[#94A3B8]'}`}>
                          {ioc.type.toUpperCase()}
                        </span>
                        <div className="text-sm font-mono text-[#F1F5F9]">{ioc.value}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${severityColors[ioc.severity]}`}>
                        {ioc.severity}
                      </span>
                      <span className="text-xs text-[#94A3B8]">{ioc.reputation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Attack Timeline</h2>
              <div className="space-y-3">
                {inv.timeline.map((event, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-[#1E2435]">
                    <div className="flex-shrink-0">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#22D3EE] flex-shrink-0" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-[#94A3B8] mb-1">{event.timestamp}</div>
                      <div className="text-sm text-[#F1F5F9]">{event.event}</div>
                      {event.source && (
                        <div className="text-xs text-[#94A3B8] mt-1">({event.source})</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Recommendations</h2>
              <div className="space-y-3">
                {inv.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Circle className="h-2.5 w-2.5 rounded-full bg-[#22D3EE] flex-shrink-0" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#CBD5E1] leading-relaxed">{i + 1}. {rec}</p>
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
