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
        <div className="inline-flex items-center gap-2 rounded-full bg-[#22D3EE]/10 px-4 py-1.5 text-xs font-medium text-[#22D3EE] mb-6">
          <Shield className="h-3.5 w-3.5" />
          AI-Powered Email Forensics
        </div>
        <h1 className="text-4xl font-bold text-[#F1F5F9] mb-4 tracking-tight">
          Analyze suspicious emails before they strike
        </h1>
        <p className="text-[#94A3B8] text-lg max-w-xl mx-auto">
          Upload a .eml file and get a complete AI forensic investigation in seconds.
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full max-w-2xl rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-[#22D3EE] bg-[#22D3EE]/5 shadow-[0_0_40px_rgba(34,211,238,0.1)]'
            : uploadedFile
              ? 'border-[#10B981] bg-[#10B981]/5'
              : 'border-[#1E293B] bg-[#0F172A] hover:border-[#22D3EE]/50'
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
            <div className={`rounded-full p-4 transition-colors ${uploadedFile ? 'bg-[#10B981]/20' : 'bg-[#1E2435]'}`}>
              {uploadedFile ? (
                <CheckCircle2 className="h-8 w-8 text-[#10B981]" />
              ) : (
                <Upload className="h-8 w-8 text-[#22D3EE]" />
              )}
            </div>
            <div>
              <p className="text-[#F1F5F9] font-medium text-lg">
                {uploadedFile ? uploadedFile.name : 'Drop your .eml or click to browse'}
              </p>
              <p className="text-[#94A3B8] text-sm mt-1">Only .eml files supported</p>
            </div>
          </div>
        </label>

        {uploadedFile && !isScanning && (
          <button
            onClick={handleScan}
            className="mt-6 px-8 py-3 bg-[#22D3EE] text-[#0A0F1E] font-semibold rounded-lg hover:bg-[#22D3EE]/90 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          >
            Analyze Email
          </button>
        )}
      </div>

      {isScanning && (
        <div className="w-full max-w-2xl mt-6 rounded-2xl border border-[#1E293B] bg-[#0F172A] p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Radar className="h-6 w-6 text-[#22D3EE] animate-pulse" />
              <div className="absolute inset-0 h-6 w-6 text-[#22D3EE] animate-ping opacity-20">
                <Radar className="h-6 w-6" />
              </div>
            </div>
            <span className="text-[#F1F5F9] font-medium">Scanning email...</span>
          </div>
          <div className="space-y-2">
            {['Parsing headers', 'Extracting URLs', 'Checking authentication', 'Running ML model', 'Generating report'].map((step) => (
              <div key={step} className="flex items-center gap-3 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
                <span className="text-[#94A3B8]">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 flex items-center gap-6 text-sm">
        <Link to="/history" className="text-[#22D3EE] hover:underline">
          View recent investigations
        </Link>
        <span className="text-[#1E293B]">|</span>
        <Link to="/history" className="text-[#22D3EE] hover:underline">
          Try sample email
        </Link>
      </div>

      <div className="mt-8 flex items-center gap-3">
        {['SPF/DKIM/DMARC', 'URL & Domain Intel', 'AI Investigator'].map((badge) => (
          <span
            key={badge}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1E2435] px-3 py-1 text-xs font-medium text-[#CBD5E1]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE]" />
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
