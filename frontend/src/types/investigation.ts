export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Verdict = 'malicious' | 'benign' | 'suspicious';
export type AttackType = 'BEC' | 'Spoofing' | 'Phishing' | 'Impersonation' | 'Malware' | 'Credential Harvesting' | 'Executive Impersonation';
export type IOCType = 'domain' | 'ip' | 'url' | 'hash' | 'email';
export type EvidenceCategory = 'authentication' | 'sender' | 'url' | 'domain' | 'content' | 'attachment' | 'ml';

export interface Evidence {
  id: string;
  category: EvidenceCategory;
  severity: Severity;
  title: string;
  finding: string;
  source: string;
  rawValue?: string;
  interpretation?: string;
}

export interface URLInfo {
  url: string;
  domain: string;
  riskIndicators: string[];
  isShortener: boolean;
  isHTTPS: boolean;
  hasPunycode: boolean;
  isIPBased: boolean;
}

export interface AuthResult {
  spf: { result: string; domain: string };
  dkim: { result: string; domain: string };
  dmarc: { result: string };
}

export interface SenderInfo {
  from: string;
  replyTo: string;
  returnPath: string;
  mismatch?: boolean;
}

export interface IOC {
  type: IOCType;
  value: string;
  severity: Severity;
  reputation?: string;
  firstSeen?: string;
  domainAge?: string;
  source?: string;
}

export interface MLProbabilities {
  benign: number;
  phishing: number;
  spoofing: number;
  bec: number;
  malware: number;
}

export interface InvestigationResult {
  id: string;
  filename: string;
  sha256: string;
  uploadedAt: string;
  verdict: Verdict;
  riskScore: number;
  attackTypes: AttackType[];
  auth: AuthResult;
  sender: SenderInfo;
  urls: URLInfo[];
  evidence: Evidence[];
  iocs: IOC[];
  ml: MLProbabilities;
  timeline: { timestamp: string; event: string; source: string; evidenceId?: string }[];
  summary: string;
  recommendations: string[];
}
