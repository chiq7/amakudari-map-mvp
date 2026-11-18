export function formatDate(value: string) {
  return value.slice(0, 10).replaceAll("-", "/");
}

// The Cabinet Office sheet uses a horizontal bar in this bank's name.
// The bank writes it with a long vowel mark. Keep identifiers and source records intact.
export function corporationDisplayName(name: string) {
  return name.replace("JPモルガン・チェ―ス銀行", "JPモルガン・チェース銀行");
}
