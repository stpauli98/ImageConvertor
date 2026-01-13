export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function calculateSavings(original: number, converted: number): {
  savedBytes: number;
  savedPercentage: number;
  formattedSavedBytes: string;
} {
  const savedBytes = original - converted;
  const savedPercentage = original > 0 ? Math.round((savedBytes / original) * 100) : 0;

  return {
    savedBytes,
    savedPercentage,
    formattedSavedBytes: formatBytes(Math.abs(savedBytes)),
  };
}
