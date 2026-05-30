export function generateUniqueId(phrase: string): string {
  const uniqueSuffix = Date.now().toString(36);
  return `${phrase}.${uniqueSuffix}`;
}
