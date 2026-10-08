export const severityColors = {
  low: 'bg-success/20 text-success',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-destructive/20 text-destructive',
  critical: 'bg-destructive/30 text-destructive',
} as const;

export const verdictColors = {
  malicious: 'bg-destructive/20 text-destructive border-destructive/30',
  benign: 'bg-success/20 text-success border-success/30',
  suspicious: 'bg-warning/20 text-warning border-warning/30',
} as const;

export const categoryColors = {
  authentication: 'bg-info/20 text-info',
  sender: 'bg-warning/20 text-warning',
  url: 'bg-destructive/20 text-destructive',
  domain: 'bg-purple/20 text-purple',
  content: 'bg-success/20 text-success',
  attachment: 'bg-muted-foreground/20 text-muted-foreground',
  ml: 'bg-primary/20 text-primary',
} as const;