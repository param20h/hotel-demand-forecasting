
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  ChartNoAxesCombined,
  Hotel,
  BedDouble,
  Database,
  Settings,
  HelpCircle,
  Waves,
  BrainCircuit,
} from "lucide-react";

const navigation = [
  {
    label: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
      },
      {
        name: "Forecast Analytics",
        icon: ChartNoAxesCombined,
        href: "/forecast-analytics",
      },
      {
        name: "Model Evaluation",
        icon: BrainCircuit,
        href: "/evaluation",
      },
    ],
  },
  {
    label: "ANALYTICS",
    items: [
      {
        name: "Hotels",
        icon: Hotel,
        href: "/hotels",
      },
      {
        name: "Room Categories",
        icon: BedDouble,
        href: "/room-categories",
      },
      {
        name: "Data Explorer",
        icon: Database,
        href: "data-explorer",
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col bg-[#111827] text-white lg:flex">

      {/* Brand */}

      <Link
        href="/"
        className="flex h-[82px] items-center gap-3 border-b border-white/10 px-7"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500">
          <Waves size={23} />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight">
            StayCast
          </h1>

          <p className="text-[10px] tracking-[2px] text-slate-400">
            DEMAND INTELLIGENCE
          </p>
        </div>
      </Link>


      {/* Navigation */}

      <nav className="flex-1 space-y-8 overflow-y-auto px-4 py-8">

        {navigation.map((section) => (
          <div key={section.label}>

            <p className="mb-3 px-3 text-[10px] font-semibold tracking-[1.5px] text-slate-500">
              {section.label}
            </p>

            <div className="space-y-1">

              {section.items.map((item) => {
                const Icon = item.icon;

                const isActive =
                  item.href !== null &&
                  (item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`));

                const className = `flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${
                  isActive
                    ? "bg-indigo-500/15 font-medium text-indigo-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`;

                return item.href ? (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={className}
                  >
                    <Icon size={18} />

                    {item.name}

                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    )}
                  </Link>
                ) : (
                  <button
                    key={item.name}
                    type="button"
                    disabled
                    title="Coming soon"
                    className={`${className} cursor-not-allowed opacity-60`}
                  >
                    <Icon size={18} />

                    {item.name}

                    <span className="ml-auto text-[9px] uppercase tracking-wide text-slate-500">
                      Soon
                    </span>
                  </button>
                );
              })}

            </div>
          </div>
        ))}

      </nav>


      {/* Bottom */}

    </aside>
  );
}
