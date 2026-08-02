import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function IconBase({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.2 4.2" />
    </IconBase>
  );
}

export function PersonIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 20c.6-4 2.8-6 6.5-6s5.9 2 6.5 6" />
    </IconBase>
  );
}

export function BuildingIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 21V6l7-3 7 3v15" />
      <path d="M9 9h1M14 9h1M9 13h1M14 13h1M10 21v-4h4v4M3 21h18" />
    </IconBase>
  );
}

export function MinistryIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m3 9 9-5 9 5" />
      <path d="M5 10h14M6 19h12M4 22h16M8 10v9M12 10v9M16 10v9" />
    </IconBase>
  );
}

export function DocumentIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h5M9 12h6M9 16h6" />
    </IconBase>
  );
}

export function NewsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 5h13v15H6a2 2 0 0 1-2-2z" />
      <path d="M17 8h3v10a2 2 0 0 1-2 2M8 9h5M8 13h5M8 17h3" />
    </IconBase>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14M14 7l5 5-5 5" />
    </IconBase>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m5 12 4 4L19 6" />
    </IconBase>
  );
}

export function BrandMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 32 32" width={size * 0.68} height={size * 0.68} fill="none">
        <circle cx="7" cy="16" r="3" fill="currentColor" />
        <circle cx="24" cy="8" r="3" fill="#f5b56b" />
        <circle cx="24" cy="24" r="3" fill="#8ed8c3" />
        <path d="M10 16h5c4.5 0 4.5-8 6-8M15 16c4.5 0 4.5 8 6 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}
