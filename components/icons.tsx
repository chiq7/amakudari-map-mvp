import type { SVGProps } from "react";
import { ArrowRight, Check, Search } from "lucide-react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function RecordIconBase({ size = 24, className = "", children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {children}
    </svg>
  );
}

export function PersonIcon(props: IconProps) {
  return (
    <RecordIconBase {...props}>
      <rect x="3.5" y="4" width="17" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.9 16.1c.7-1.7 1.7-2.6 3.1-2.6s2.4.9 3.1 2.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M14.5 9h3M14.5 12h3M14.5 15h2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M7 4V2.8h10V4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </RecordIconBase>
  );
}

export function BuildingIcon(props: IconProps) {
  return (
    <RecordIconBase {...props}>
      <path d="M4 20V6.5h11V20M15 10h5v10M2.5 20h19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M7 4h5" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
      <path d="M7 9h2M11.5 9h1M7 12.5h2M11.5 12.5h1M17.5 13h.2M17.5 16h.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M8 20v-3.5h3V20" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </RecordIconBase>
  );
}

export function MinistryIcon(props: IconProps) {
  return (
    <RecordIconBase {...props}>
      <path d="M3 9h18L12 4 3 9Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M5 10.5V18M9.7 10.5V18M14.3 10.5V18M19 10.5V18M3 20h18M4 18h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <circle cx="12" cy="7.4" r=".8" fill="currentColor" />
    </RecordIconBase>
  );
}

export function DocumentIcon(props: IconProps) {
  return (
    <RecordIconBase {...props}>
      <path d="M5 2.8h9l5 5V21H5V2.8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M14 3v5h5M8 11h7M8 14h5M8 17h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <circle cx="16.3" cy="16.8" r="1.7" fill="currentColor" />
    </RecordIconBase>
  );
}

export function NewsIcon(props: IconProps) {
  return (
    <RecordIconBase {...props}>
      <path d="M4 4h14v16H5.8A1.8 1.8 0 0 1 4 18.2V4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M18 8h2v10.2a1.8 1.8 0 0 1-1.8 1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <rect x="7" y="7" width="8" height="2.4" rx=".5" fill="currentColor" />
      <path d="M7 12h3M12 12h3M7 15h3M12 15h3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
    </RecordIconBase>
  );
}

export {
  ArrowRight as ArrowRightIcon,
  Check as CheckIcon,
  Search as SearchIcon,
};

export function BrandMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-[10px] bg-primary font-serif text-lg font-black text-white shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      天
    </span>
  );
}
