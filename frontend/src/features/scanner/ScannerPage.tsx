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
      <h1 className="text-3xl font-bold text-foreground">URL Scanner</h1>
      <div className="rounded-2xl border border-border bg-card p-6">
        <label className="block text-sm font-medium text-foreground mb-2">Enter URL to scan</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors text-sm"
          />
          <button
            onClick={handleScan}
            disabled={scanning || !url}
            className="px-6 py-2.5 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scanning ? 'Scanning...' : 'Scan'}
          </button>
        </div>
      </div>

      {scanning && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Search className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-foreground font-medium">Analyzing URL...</span>
          </div>
          <div className="space-y-2">
            {['Fetching domain info', 'Checking reputation', 'Analyzing content', 'Generating verdict'].map((step) => (
              <div key={step} className="flex items-center gap-3 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className={`rounded-2xl border p-6 ${
          result.status === 'clean' ? 'border-success/30 bg-success/5' :
          result.status === 'suspicious' ? 'border-warning/30 bg-warning/5' :
          'border-destructive/30 bg-destructive/5'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {result.status === 'clean' ? <CheckCircle2 className="h-6 w-6 text-success" /> :
             result.status === 'suspicious' ? <AlertTriangle className="h-6 w-6 text-warning" /> :
             <Shield className="h-6 w-6 text-destructive" />}
            <h2 className={`text-xl font-bold ${
              result.status === 'clean' ? 'text-success' :
              result.status === 'suspicious' ? 'text-warning' :
              'text-destructive'
            }`}>
              {result.status === 'clean' ? 'Clean' : result.status === 'suspicious' ? 'Suspicious' : 'Malicious'}
            </h2>
          </div>
          <div className="text-sm text-muted-foreground">Risk Score: <span className="text-foreground font-bold">{result.score}/100</span></div>
        </div>
      )}
    </div>
  );
}
