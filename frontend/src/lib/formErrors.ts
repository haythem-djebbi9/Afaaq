import type { FieldErrors } from 'react-hook-form';

export function errorMessageAt(errors: FieldErrors, path: string): string | undefined {
  const segments = path.split('.');
  let node: unknown = errors;
  for (const segment of segments) {
    if (!node || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[segment];
  }
  if (node && typeof node === 'object' && 'message' in node) {
    const message = (node as {message?: unknown;}).message;
    return typeof message === 'string' ? message : undefined;
  }
  return undefined;
}
