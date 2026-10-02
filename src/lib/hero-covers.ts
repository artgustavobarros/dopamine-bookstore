const localCoverIds = new Set([15_087_154, 13_267_071, 15_258_724]);

export function heroCoverUrl(coverId: number): string {
  return localCoverIds.has(coverId)
    ? `/covers/${coverId}.webp`
    : `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}
