export function sanitizeFilename(filename: string): string {
  // Remove invalid characters
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 255); // Limit length
} 