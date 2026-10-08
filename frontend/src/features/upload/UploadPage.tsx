import { useState, useCallback } from 'react';
import { Upload, Shield, Radar, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';

export function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.eml')) {
      setUploadedFile(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.eml')) {
      setUploadedFile(file);
    }
  };

  const handleScan = () => {
    if (!uploadedFile) return;
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
          <Shield className="h-3.5 w-3.5" />
          AI-Powered Email Forensics
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
          Analyze suspicious emails before they strike
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
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
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-4">
            <div className={`rounded-full p-4 transition-colors ${uploadedFile ? 'bg-success/20' : 'bg-secondary'}`}>
              {uploadedFile ? (
                <CheckCircle2 className="h-8 w-8 text-success" />
              ) : (
                <Upload className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <p className="text-foreground font-medium text-lg">
                {uploadedFile ? uploadedFile.name : 'Drop your .eml or click to browse'}
              </p>
              <p className="text-muted-foreground text-sm mt-1">Only .eml files supported</p>
            </div>
          </div>
        </label>

        {uploadedFile && !isScanning && (
          <button
            onClick={handleScan}
            className="mt-6 px-8 py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-glow"
          >
            Analyze Email
          </button>
        )}
      </div>

      {isScanning && (
        <div className="w-full max-w-2xl mt-6 rounded-2xl border border-border bg-card p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Radar className="h-6 w-6 text-primary animate-pulse" />
              <div className="absolute inset-0 h-6 w-6 text-primary animate-ping opacity-20">
                <Radar className="h-6 w-6" />
              </div>
            </div>
            <span className="text-foreground font-medium">Scanning email...</span>
          </div>
          <div className="space-y-2">
            {['Parsing headers', 'Extracting URLs', 'Checking authentication', 'Running ML model', 'Generating report'].map((step) => (
              <div key={step} className="flex items-center gap-3 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
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
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
