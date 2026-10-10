import { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, Shield, Radar, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';

export function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [rejectedName, setRejectedName] = useState<string | null>(null);
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scanTimer.current) clearTimeout(scanTimer.current);
    };
  }, []);

  const isEml = (file: File) => file.name.toLowerCase().endsWith('.eml');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isEml(file)) {
      setUploadedFile(file);
      setRejectedName(null);
    } else if (file) {
      setRejectedName(file.name);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isEml(file)) {
      setUploadedFile(file);
      setRejectedName(null);
    } else if (file) {
      setRejectedName(file.name);
    }
  };

  const handleScan = () => {
    if (!uploadedFile) return;
    setIsScanning(true);
    setRejectedName(null);
    scanTimer.current = setTimeout(() => setIsScanning(false), 3000);
  };

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
          Upload a .eml file and get a complete AI forensic investigation in seconds.
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
              <div className="text-primary absolute inset-0 h-6 w-6 animate-ping opacity-20">
                <Radar className="h-6 w-6" />
              </div>
            </div>
            <span className="text-foreground font-medium">Scanning email...</span>
          </div>
          <div className="space-y-2">
            {[
              'Parsing headers',
              'Extracting URLs',
              'Checking authentication',
              'Running ML model',
              'Generating report',
            ].map((step) => (
              <div key={step} className="flex items-center gap-3 text-sm">
                <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
                <span className="text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
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
