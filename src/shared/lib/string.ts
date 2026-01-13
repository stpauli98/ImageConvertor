export function truncateFileName(name: string, maxLength = 25): string {
  if (name.length <= maxLength) return name;

  const extension = name.split('.').pop() || '';
  const baseName = name.slice(0, name.lastIndexOf('.'));
  const truncatedBase = baseName.slice(0, maxLength - extension.length - 4);

  return `${truncatedBase}...${extension}`;
}
