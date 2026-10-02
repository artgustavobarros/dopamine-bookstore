export async function requestAiOrFallback<T>(
  allow: () => Promise<boolean>,
  provider: () => Promise<T>,
  fallback: () => T
): Promise<T> {
  try {
    if (!(await allow())) {
      return fallback();
    }
    return await provider();
  } catch {
    return fallback();
  }
}
