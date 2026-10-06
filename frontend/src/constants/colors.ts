export const severityColors = {
  low: 'bg-[#10B981]/20 text-[#10B981]',
  medium: 'bg-[#F59E0B]/20 text-[#F59E0B]',
  high: 'bg-[#EF4444]/20 text-[#EF4444]',
  critical: 'bg-[#EF4444]/30 text-[#EF4444]',
} as const;

export const verdictColors = {
  malicious: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30',
  benign: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30',
  suspicious: 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30',
} as const;

export const categoryColors = {
  authentication: 'bg-[#3B82F6]/20 text-[#3B82F6]',
  sender: 'bg-[#F59E0B]/20 text-[#F59E0B]',
  url: 'bg-[#EF4444]/20 text-[#EF4444]',
  domain: 'bg-[#8B5CF6]/20 text-[#8B5CF6]',
  content: 'bg-[#10B981]/20 text-[#10B981]',
  attachment: 'bg-[#94A3B8]/20 text-[#94A3B8]',
  ml: 'bg-[#22D3EE]/20 text-[#22D3EE]',
} as const;