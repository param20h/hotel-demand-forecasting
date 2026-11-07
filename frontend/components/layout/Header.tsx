
"use client";

import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const pageInfo =
    pathname === "/forecast-analytics"
      ? {
          breadcrumb: "Workspace / Forecast Intelligence",
          title: "Forecast Analytics",
        }
      : pathname === "/evaluation"
        ? {
            breadcrumb: "Workspace / ML Analytics",
            title: "Model Evaluation",
          }
        : pathname === "/room-categories"
  ? {
      breadcrumb: "Workspace / Demand Analytics",
      title: "Room Categories",
    }
    : pathname === "/data-explorer"
  ? {
      breadcrumb: "Workspace / Data Management",
      title: "Data Explorer",
    }
    : pathname === "/hotels"
          ? {
              breadcrumb: "Workspace / Hotel Analytics",
              title: "Hotels",
            }
          : {
              breadcrumb: "Workspace / Analytics",
              title: "Hotel Demand Overview",
            };

  return (
    <header className="sticky top-0 z-20 flex h-[82px] items-center border-b border-[#e8ebf2] bg-white/90 px-5 backdrop-blur-md md:px-8">
      <div>
        <p className="text-xs text-slate-400">
          {pageInfo.breadcrumb}
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-800">
          {pageInfo.title}
        </h2>
      </div>
    </header>
  );
}
