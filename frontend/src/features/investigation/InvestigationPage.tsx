import { SAMPLE_INVESTIGATION } from '@/constants/sampleData';
import { severityColors, verdictColors } from '@/constants/colors';
import { Download, AlertTriangle, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { useState } from 'react';

function Gauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#EF4444' : score >= 50 ? '#F59E0B' : '#10B981';

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" stroke="#1E293B" strokeWidth="6" fill="none" />
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
        <span className="text-3xl font-bold text-[#F1F5F9]">{score}</span>
        <span className="text-xs text-[#94A3B8]">/100</span>
      </div>
    </div>
  );
}

export function InvestigationPage() {
  const [activeTab, setActiveTab] = useState<'authentication' | 'sender' | 'urls' | 'content' | 'attachment'>('authentication');
  const inv = SAMPLE_INVESTIGATION;

  const riskFactors = [
    { name: 'Authentication', score: 25, color: '#EF4444' },
    { name: 'URL', score: 20, color: '#EF4444' },
    { name: 'Domain', score: 20, color: '#F59E0B' },
    { name: 'Sender', score: 15, color: '#F59E0B' },
    { name: 'Content', score: 10, color: '#F59E0B' },
    { name: 'ML', score: 4, color: '#10B981' },
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
          <FileText className="h-5 w-5 text-[#94A3B8]" />
          <span className="text-[#94A3B8] text-sm">{inv.filename}</span>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${verdictColors[inv.verdict]}`}>
            {inv.verdict === 'malicious' ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
            {inv.verdict.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#94A3B8] text-sm flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {new Date(inv.uploadedAt).toLocaleString()}
          </span>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E293B] bg-[#0F172A] px-3 py-1.5 text-sm text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#22D3EE]/30 transition-colors">
            <Download className="h-3.5 w-3.5" />
            Download Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Threat Level */}
        <div className="lg:col-span-4 space-y-6">
          {/* Threat Hero Card */}
          <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6">
            <div className="flex items-center gap-6">
              <Gauge score={inv.riskScore} />
              <div>
                <div className="text-xs font-semibold text-[#EF4444] uppercase tracking-wider mb-1">HIGH RISK</div>
                <div className="text-[#F1F5F9] font-medium">Threat Level</div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {inv.attackTypes.map((type) => (
                    <span key={type} className="inline-flex items-center rounded-md bg-[#1E2435] px-2 py-0.5 text-xs text-[#CBD5E1]">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factor Breakdown */}
          <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6">
            <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">Risk Factors</h3>
            <div className="space-y-3">
              {riskFactors.map((factor) => (
                <div key={factor.name} className="flex items-center gap-3">
                  <span className="text-xs text-[#94A3B8] w-20">{factor.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-[#1E293B] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${factor.score}%`, backgroundColor: factor.color }}
                    />
                  </div>
                  <span className="text-xs font-medium text-[#F1F5F9] w-8 text-right">+{factor.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Evidence Panels */}
        <div className="lg:col-span-8">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-[#1E293B] mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#22D3EE] text-[#22D3EE]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6">
            {activeTab === 'authentication' && (
              <div className="space-y-4">
                {(['spf', 'dkim', 'dmarc'] as const).map((auth) => {
                  const result = inv.auth[auth];
                  const isPass = result.result === 'PASS';
                  const isNone = result.result === 'NONE';
                  return (
                    <div key={auth} className="flex items-center justify-between p-4 rounded-xl bg-[#1E2435]">
                      <div>
                        <div className="text-sm font-medium text-[#F1F5F9] capitalize">{auth}</div>
                        <div className="text-xs text-[#94A3B8] mt-0.5">Domain: {'domain' in result ? result.domain || '—' : '—'}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        isPass ? 'bg-[#10B981]/20 text-[#10B981]' : isNone ? 'bg-[#94A3B8]/20 text-[#94A3B8]' : 'bg-[#EF4444]/20 text-[#EF4444]'
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
                  <div className="p-4 rounded-xl bg-[#1E2435]">
                    <div className="text-xs text-[#94A3B8] mb-1">From</div>
                    <div className="text-sm font-medium text-[#F1F5F9] mono">{inv.sender.from}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1E2435]">
                    <div className="text-xs text-[#94A3B8] mb-1">Reply-To</div>
                    <div className="text-sm font-medium text-[#F1F5F9] mono">{inv.sender.replyTo}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1E2435]">
                    <div className="text-xs text-[#94A3B8] mb-1">Return-Path</div>
                    <div className="text-sm font-medium text-[#F1F5F9] mono">{inv.sender.returnPath}</div>
                  </div>
                </div>
                {inv.sender.mismatch && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20">
                    <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                    <span className="text-sm text-[#EF4444]">Reply-To mismatch detected</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'urls' && (
              <div className="space-y-3">
                {inv.urls.map((url) => (
                  <div key={url.url} className="p-4 rounded-xl bg-[#1E2435]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#F1F5F9] mono">{url.url}</span>
                      <div className="flex gap-1.5">
                        {url.isShortener && <span className="rounded bg-[#F59E0B]/20 px-2 py-0.5 text-xs text-[#F59E0B]">Shortener</span>}
                        {url.isHTTPS && <span className="rounded bg-[#10B981]/20 px-2 py-0.5 text-xs text-[#10B981]">HTTPS</span>}
                        {url.hasPunycode && <span className="rounded bg-[#EF4444]/20 px-2 py-0.5 text-xs text-[#EF4444]">Punycode</span>}
                        {url.isIPBased && <span className="rounded bg-[#EF4444]/20 px-2 py-0.5 text-xs text-[#EF4444]">IP-based</span>}
                      </div>
                    </div>
                    <div className="text-xs text-[#94A3B8]">Domain: {url.domain}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {url.riskIndicators.map((indicator) => (
                        <span key={indicator} className="rounded bg-[#EF4444]/10 px-2 py-0.5 text-xs text-[#EF4444]">{indicator}</span>
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
                  <div key={item.indicator} className="flex items-center gap-3 p-3 rounded-xl bg-[#1E2435]">
                    {item.found ? (
                      <CheckCircle2 className="h-4 w-4 text-[#EF4444]" />
                    ) : (
                      <XCircle className="h-4 w-4 text-[#1E293B]" />
                    )}
                    <span className={`text-sm ${item.found ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'}`}>{item.indicator}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'attachment' && (
              <div className="text-center py-8 text-[#94A3B8]">
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
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6">
          <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">ML Classification</h3>
          <div className="space-y-3">
            {Object.entries(inv.ml).map(([label, prob]) => {
              const color = prob > 70 ? '#EF4444' : prob > 30 ? '#F59E0B' : '#10B981';
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-[#94A3B8] w-24 capitalize">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-[#1E293B] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${prob}%`, backgroundColor: color }} />
                  </div>
                  <span className="text-xs font-medium text-[#F1F5F9] w-10 text-right">{prob}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Investigator */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6">
          <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">AI Investigator</h3>
          <p className="text-sm text-[#CBD5E1] leading-relaxed mb-4">{inv.summary}</p>
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
