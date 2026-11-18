export function searchKey(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/gu, "").replaceAll("チェ―ス", "チェース");
}
