export function formatDate(value: string) {
  return value.slice(0, 10).replaceAll("-", "/");
}

// The Cabinet Office sheet uses a horizontal bar in this bank's name.
// The bank writes it with a long vowel mark. Keep identifiers and source records intact.
export function corporationDisplayName(name: string) {
  return name.replace("JPモルガン・チェ―ス銀行", "JPモルガン・チェース銀行");
}

// 公表表の再就職先欄が「自営」「自営業」の記録は法人ではないため、
// ランキングや「主な再就職先」には出さず、法人ページは「自営」側に1つにまとめる。
const SELF_EMPLOYED_NAMES = new Set(["自営", "自営業"]);

export function isSelfEmployed(name: string) {
  return SELF_EMPLOYED_NAMES.has(name.trim());
}
