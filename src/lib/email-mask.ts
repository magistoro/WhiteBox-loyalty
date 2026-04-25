/**
 * Privacy-friendly email for display, e.g. `maksim@gmail.com` → `mak***com`.
 */
export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return "***";
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const parts = domain.split(".");
  const tld = parts.length >= 2 ? parts[parts.length - 1] : domain;
  const showLocal = Math.min(3, Math.max(1, local.length));
  const prefix = local.slice(0, showLocal);
  return `${prefix}***${tld}`;
}
