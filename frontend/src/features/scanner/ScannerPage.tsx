import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Search } from 'lucide-react';

export function ScannerPage() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ status: 'clean' | 'suspicious' | 'malicious'; score: number } | null>(null);

  const handleScan = () => {
    if (!url) return;
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      setResult({ status: 'suspicious', score: 67 });
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-[#F1F5F9]">URL Scanner</h1>
      <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6">
        <label className="block text-sm font-medium text-[#F1F5F9] mb-2">Enter URL to scan</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-4 py-2.5 rounded-lg border border-[#1E293B] bg-[#0A0F1E] text-[#F1F5F9] placeholder-[#94A3B8] focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/30 transition-colors text-sm"
          />
          <button
            onClick={handleScan}
            disabled={scanning || !url}
            className="px-6 py-2.5 bg-[#22D3EE] text-[#0A0F1E] rounded-lg hover:bg-[#22D3EE]/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scanning ? 'Scanning...' : 'Scan'}
          </button>
        </div>
      </div>

      {scanning && (
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Search className="h-5 w-5 text-[#22D3EE] animate-pulse" />
            <span className="text-[#F1F5F9] font-medium">Analyzing URL...</span>
          </div>
          <div className="space-y-2">
            {['Fetching domain info', 'Checking reputation', 'Analyzing content', 'Generating verdict'].map((step) => (
              <div key={step} className="flex items-center gap-3 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
                <span className="text-[#94A3B8]">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className={`rounded-2xl border p-6 ${
          result.status === 'clean' ? 'border-[#10B981]/30 bg-[#10B981]/5' :
          result.status === 'suspicious' ? 'border-[#F59E0B]/30 bg-[#F59E0B]/5' :
          'border-[#EF4444]/30 bg-[#EF4444]/5'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {result.status === 'clean' ? <CheckCircle2 className="h-6 w-6 text-[#10B981]" /> :
             result.status === 'suspicious' ? <AlertTriangle className="h-6 w-6 text-[#F59E0B]" /> :
             <Shield className="h-6 w-6 text-[#EF4444]" />}
            <h2 className={`text-xl font-bold ${
              result.status === 'clean' ? 'text-[#10B981]' :
              result.status === 'suspicious' ? 'text-[#F59E0B]' :
              'text-[#EF4444]'
            }`}>
              {result.status === 'clean' ? 'Clean' : result.status === 'suspicious' ? 'Suspicious' : 'Malicious'}
            </h2>
          </div>
          <div className="text-sm text-[#94A3B8]">Risk Score: <span className="text-[#F1F5F9] font-bold">{result.score}/100</span></div>
        </div>
      )}
    </div>
  );
}
