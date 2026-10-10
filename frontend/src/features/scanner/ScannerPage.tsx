import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Search } from 'lucide-react';

export function ScannerPage() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{
    status: 'clean' | 'suspicious' | 'malicious';
    score: number;
  } | null>(null);

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
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-foreground text-3xl font-bold">URL Scanner</h1>
      <div className="border-border bg-card rounded-2xl border p-6">
        <label className="text-foreground mb-2 block text-sm font-medium" htmlFor="scan-url">
          Enter URL to scan
        </label>
        <div className="flex gap-2">
          <input
            id="scan-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/30 flex-1 rounded-lg border px-4 py-2.5 text-sm transition-colors focus:ring-1 focus:outline-none"
          />
          <button
            onClick={handleScan}
            disabled={scanning || !url}
            className="bg-primary text-background hover:bg-primary/90 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {scanning ? 'Scanning...' : 'Scan'}
          </button>
        </div>
      </div>

      {scanning && (
        <div className="border-border bg-card rounded-2xl border p-6">
          <div className="mb-4 flex items-center gap-3">
            <Search className="text-primary h-5 w-5 animate-pulse" />
            <span className="text-foreground font-medium">Analyzing URL...</span>
          </div>
          <div className="space-y-2">
            {[
              'Fetching domain info',
              'Checking reputation',
              'Analyzing content',
              'Generating verdict',
            ].map((step) => (
              <div key={step} className="flex items-center gap-3 text-sm">
                <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
                <span className="text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div
          className={`rounded-2xl border p-6 ${
            result.status === 'clean'
              ? 'border-success/30 bg-success/5'
              : result.status === 'suspicious'
                ? 'border-warning/30 bg-warning/5'
                : 'border-destructive/30 bg-destructive/5'
          }`}
        >
          <div className="mb-4 flex items-center gap-3">
            {result.status === 'clean' ? (
              <CheckCircle2 className="text-success h-6 w-6" />
            ) : result.status === 'suspicious' ? (
              <AlertTriangle className="text-warning h-6 w-6" />
            ) : (
              <Shield className="text-destructive h-6 w-6" />
            )}
            <h2
              className={`text-xl font-bold ${
                result.status === 'clean'
                  ? 'text-success'
                  : result.status === 'suspicious'
                    ? 'text-warning'
                    : 'text-destructive'
              }`}
            >
              {result.status === 'clean'
                ? 'Clean'
                : result.status === 'suspicious'
                  ? 'Suspicious'
                  : 'Malicious'}
            </h2>
          </div>
          <div className="text-muted-foreground text-sm">
            Risk Score: <span className="text-foreground font-bold">{result.score}/100</span>
          </div>
        </div>
      )}
    </div>
  );
}
