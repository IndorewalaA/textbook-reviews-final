export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // Remove non-alphanumeric chars
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/-+/g, '-');           // Collapse multiple -
}