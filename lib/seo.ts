import type { Metadata } from "next";

export const SITE_URL = "https://amakudari.jp";
export const SITE_NAME = "天下りマップ";
export const SHARE_IMAGE = "/ogp.webp";

export function pageMetadata(title: string, description: string, pathname: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: pathname },
    openGraph: {
      type: "website",
      locale: "ja_JP",
      siteName: SITE_NAME,
      title,
      description,
      url: pathname,
      images: [{ url: SHARE_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE] },
  };
}

export function canonicalUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

