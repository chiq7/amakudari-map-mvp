import contextData from "@/data/editorial/corporation-contexts.json";
import type { CorporationEditorialContext } from "@/lib/types";

const contexts = contextData as CorporationEditorialContext[];

export function getCorporationEditorialContext(corporationSlug: string) {
  return contexts.find((context) => context.corporationSlug === corporationSlug);
}
