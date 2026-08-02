import {
  ArrowRight,
  Building2,
  Check,
  FileText,
  Landmark,
  Newspaper,
  Search,
  UserRound,
} from "lucide-react";

export {
  ArrowRight as ArrowRightIcon,
  Building2 as BuildingIcon,
  Check as CheckIcon,
  FileText as DocumentIcon,
  Landmark as MinistryIcon,
  Newspaper as NewsIcon,
  Search as SearchIcon,
  UserRound as PersonIcon,
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
