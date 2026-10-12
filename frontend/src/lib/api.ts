export type MlClassifyResponse = {
  model: string;
  prediction: { label: number; name: string };
  probabilities: { benign: number; phishing_or_spam: number };
  disclaimer: string;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function classifyEmlFile(file: File): Promise<MlClassifyResponse> {
  const response = await fetch('/api/v1/ml/classify-eml', {
    method: 'POST',
    headers: { 'Content-Type': 'message/rfc822' },
    body: file,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }
  return (await response.json()) as MlClassifyResponse;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: unknown };
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) return 'The email could not be read. Check its subject and body.';
  } catch {
    return `Request failed with status ${response.status}.`;
  }
  return `Request failed with status ${response.status}.`;
}
