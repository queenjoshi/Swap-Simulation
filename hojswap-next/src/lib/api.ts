const API_BASE = (process.env.NEXT_PUBLIC_API_URL as string | undefined) ?? "";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
