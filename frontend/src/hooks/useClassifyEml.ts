import { useMutation } from '@tanstack/react-query';
import { classifyEmlFile } from '@/lib/api';

export function useClassifyEml() {
  return useMutation({
    mutationFn: (file: File) => classifyEmlFile(file),
    retry: false,
  });
}
