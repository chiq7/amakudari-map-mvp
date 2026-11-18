export function searchKey(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/gu, "");
}
