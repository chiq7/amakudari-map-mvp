export const SITE_URL = "https://amakudari.jp";

export function canonicalUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

