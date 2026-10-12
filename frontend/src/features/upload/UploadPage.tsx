import { useState, useCallback } from 'react';
import { Upload, Shield, Radar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router';
import { useClassifyEml } from '@/hooks/useClassifyEml';

export function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [rejectedName, setRejectedName] = useState<string | null>(null);
  const classify = useClassifyEml();

  const isEml = (file: File) => file.name.toLowerCase().endsWith('.eml');

  const selectFile = (file: File) => {
    if (isEml(file)) {
      setUploadedFile(file);
      setRejectedName(null);
      classify.reset();
    } else {
      setRejectedName(file.name);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) selectFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) selectFile(file);
  };

  const handleScan = () => {
    if (!uploadedFile || classify.isPending) return;
    setRejectedName(null);
    classify.mutate(uploadedFile);
  };

  const result = classify.data;
  const isScanning = classify.isPending;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12">
      <div className="mb-12 text-center">
        <div className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium">
          <Shield className="h-3.5 w-3.5" />
          AI-Powered Email Forensics
        </div>
        <h1 className="text-foreground mb-4 text-4xl font-bold tracking-tight">
          Analyze suspicious emails before they strike
        </h1>
        <p className="text-muted-foreground mx-auto max-w-xl text-lg">
          Upload a .eml file to run the baseline text classifier on its subject and body.
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full max-w-2xl rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-primary bg-primary/5 shadow-glow-soft'
            : uploadedFile
              ? 'border-success bg-success/5'
              : 'border-border bg-card hover:border-primary/50'
        }`}
      >
        <input
          type="file"
          accept=".eml"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          disabled={isScanning}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer"
          aria-label="Upload a .eml email file"
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className={`rounded-full p-4 transition-colors ${uploadedFile ? 'bg-success/20' : 'bg-secondary'}`}
            >
              {uploadedFile ? (
                <CheckCircle2 className="text-success h-8 w-8" />
              ) : (
                <Upload className="text-primary h-8 w-8" />
              )}
            </div>
            <div>
              <p className="text-foreground text-lg font-medium">
                {uploadedFile ? uploadedFile.name : 'Drop your .eml or click to browse'}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">Only .eml files supported</p>
            </div>
          </div>
        </label>

        {uploadedFile && !isScanning && (
          <button
            onClick={handleScan}
            className="bg-primary text-background hover:bg-primary/90 shadow-glow mt-6 rounded-lg px-8 py-3 font-semibold transition-colors"
          >
            Analyze Email
          </button>
        )}
      </div>

      {rejectedName && (
        <p className="text-destructive mt-4 text-sm">
          "{rejectedName}" is not a .eml file. Only .eml files are supported.
        </p>
      )}

      {isScanning && (
        <div className="border-border bg-card mt-6 w-full max-w-2xl rounded-2xl border p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative">
              <Radar className="text-primary h-6 w-6 animate-pulse" />
            </div>
            <span className="text-foreground font-medium">Running text classifier...</span>
          </div>
        </div>
      )}

      {classify.isError && (
        <div className="border-destructive/30 bg-destructive/5 mt-6 flex w-full max-w-2xl items-start gap-3 rounded-2xl border p-6">
          <AlertTriangle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-destructive text-sm">{classify.error.message}</p>
        </div>
      )}

      {result && (
        <div className="border-border bg-card mt-6 w-full max-w-2xl space-y-4 rounded-2xl border p-8">
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Text classifier result (baseline model)
            </p>
            <h2 className="text-foreground mt-1 text-2xl font-bold">
              {result.prediction.name === 'phishing_or_spam' ? 'Flagged as phishing or spam' : 'Classified as benign'}
            </h2>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Benign</dt>
              <dd className="text-foreground font-semibold">
                {(result.probabilities.benign * 100).toFixed(1)}%
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phishing or spam</dt>
              <dd className="text-foreground font-semibold">
                {(result.probabilities.phishing_or_spam * 100).toFixed(1)}%
              </dd>
            </div>
          </dl>
          <p className="text-muted-foreground border-border border-t pt-4 text-xs">
            {result.disclaimer} This does not cover headers, SPF/DKIM/DMARC, URLs, attachments,
            spoofing, or business email compromise, and is not an overall forensic verdict.
          </p>
        </div>
      )}

      <div className="mt-12 flex items-center gap-6 text-sm">
        <Link to="/history" className="text-primary hover:underline">
          View recent investigations
        </Link>
        <span className="text-border">|</span>
        <Link to="/history" className="text-primary hover:underline">
          Try sample email
        </Link>
      </div>

      <div className="mt-8 flex items-center gap-3">
        {['SPF/DKIM/DMARC', 'URL & Domain Intel', 'AI Investigator'].map((badge) => (
          <span
            key={badge}
            className="bg-secondary text-secondary-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          >
            <span className="bg-primary h-1.5 w-1.5 rounded-full" />
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
