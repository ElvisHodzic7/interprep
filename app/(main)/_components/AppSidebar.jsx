"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SideBarOptions } from "@/services/Constants";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const path = usePathname();
  const isActive = (p) => path === p || path?.startsWith(p + "/");

  return (
    
    <Sidebar className="dark" >

      {/* HEADER */}
      <SidebarHeader className="px-4 pt-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <Image
              src={"/logo.png"}
              alt="InterPrep"
              width={160}
              height={60}
              className="w-[140px] select-none"
              priority
            />
            <span className="ml-auto text-[11px] px-2 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10">
              v1.0
            </span>
          </div>

          <Link href={"/dashboard/kreiraj-interview"}>
            <Button variant="brand" className="w-full mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Kreiraj novi intervju
            </Button>
          </Link>
        </div>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarContent>
            <SidebarMenu className="mt-2">
              {SideBarOptions.map((option, index) => {
                const active = isActive(option.path);
                return (
                  <SidebarMenuItem key={index} className="relative group">
                    {/* Lijevi “neon” indikator kad je aktivno */}
                    {active && (
                      <span
                        className="
                          absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full
                          bg-gradient-to-b from-cyan-400 to-indigo-500
                          shadow-[0_0_12px_2px_rgba(34,211,238,0.45)]
                        "
                      />
                    )}

                    <SidebarMenuButton
                      asChild
                      className={[
                        "relative w-full p-0 rounded-xl overflow-hidden",
                        "border border-white/10",
                        "bg-white/5 hover:bg-white/10",
                        "text-slate-200",
                        "transition-all duration-300",
                        active
                          ? "ring-2 ring-cyan-400/40 shadow-[0_0_24px_rgba(56,189,248,0.25)] text-white"
                          : "hover:ring-1 hover:ring-white/10",
                      ].join(" ")}
                    >
                      <Link href={option.path} className="flex items-center gap-3 px-4 py-3">
                        <option.icon
                          className={[
                            "h-5 w-5 transition-colors",
                            active ? "text-cyan-400" : "text-slate-300 group-hover:text-cyan-300",
                          ].join(" ")}
                        />
                        <span
                          className={[
                            "text-[15px] font-medium tracking-wide",
                            active ? "text-white" : "text-slate-300 group-hover:text-slate-100",
                          ].join(" ")}
                        >
                          {option.name}
                        </span>

                        {/* suptilni shimmer na hover */}
                        <span
                          className="
                            pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100
                            transition-opacity duration-500
                            bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.06),transparent)]
                          "
                          style={{
                            maskImage:
                              "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                          }}
                        />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER (ostavi prazan ili dodaj kasnije kredite/lang switch) */}
      <SidebarFooter />
    </Sidebar>
  );
}
