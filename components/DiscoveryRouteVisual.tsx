import type { ReactNode } from "react";
import { BuildingIcon, DocumentIcon, MinistryIcon, PersonIcon } from "@/components/icons";

type RouteVariant = "person" | "corporation" | "ministry";

const routeContent: Record<RouteVariant, Array<{ label: string; icon: ReactNode }>> = {
  person: [
    { label: "氏名", icon: <PersonIcon size={27} /> },
    { label: "経歴資料", icon: <DocumentIcon size={27} /> },
    { label: "再就職先", icon: <BuildingIcon size={27} /> },
  ],
  corporation: [
    { label: "法人", icon: <BuildingIcon size={27} /> },
    { label: "公表人物", icon: <PersonIcon size={27} /> },
    { label: "出身省庁", icon: <MinistryIcon size={27} /> },
  ],
  ministry: [
    { label: "省庁", icon: <MinistryIcon size={27} /> },
    { label: "公表人物", icon: <PersonIcon size={27} /> },
    { label: "関係法人", icon: <BuildingIcon size={27} /> },
  ],
};

export default function DiscoveryRouteVisual({ variant }: { variant: RouteVariant }) {
  return (
    <div aria-hidden="true" className="relative mt-6 overflow-hidden border-y border-current/10 py-4">
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-20" viewBox="0 0 360 100" preserveAspectRatio="none">
        <path d="M-20 92 C70 18 118 84 190 30 C260 -20 310 72 390 4" fill="none" stroke="currentColor" strokeWidth="16" />
        <circle cx="50" cy="15" r="28" fill="currentColor" opacity=".18" />
        <circle cx="308" cy="82" r="36" fill="currentColor" opacity=".12" />
      </svg>
      <div className="relative grid grid-cols-[1fr_28px_1fr_28px_1fr] items-start">
        {routeContent[variant].map((stage, index) => (
          <div key={stage.label} className="contents">
            <div className="flex min-w-0 flex-col items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center border-2 border-current bg-white/80 shadow-sm backdrop-blur-sm">
                {stage.icon}
              </span>
              <span className="mt-2 text-[11px] font-extrabold leading-4 tracking-tight sm:text-xs">{stage.label}</span>
            </div>
            {index < 2 ? (
              <span className="mt-5 flex items-center" aria-hidden="true">
                <span className="h-px flex-1 bg-current/50" />
                <span className="-ml-1 h-2 w-2 rotate-45 border-r-2 border-t-2 border-current" />
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
