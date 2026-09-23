"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { adminNav } from "@/config/admin-nav";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

export function AdminShell({
  children,
  user,
  logoSrc,
  logoSrcLight,
  companyName,
}: {
  children: React.ReactNode;
  user: SessionUser;
  logoSrc?: string;
  logoSrcLight?: string;
  companyName?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={cn(
          "border-r border-hairline bg-sidebar lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto",
          open ? "block" : "hidden lg:block",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Logo compact src={logoSrc} srcLight={logoSrcLight} name={companyName} />
          <span className="font-mono text-[10px] tracking-[0.2em] text-copper">CMS</span>
        </div>
        <nav className="space-y-6 px-3 pb-8">
          {adminNav.map((item) => {
            if ("items" in item) {
              return (
                <div key={item.label}>
                  <p className="px-2 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    {item.label}
                  </p>
                  <div className="mt-2 space-y-1">
                    {item.items.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground",
                          pathname === child.href && "bg-sidebar-accent text-foreground",
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground",
                  pathname === item.href && "bg-sidebar-accent text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div>
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <Button variant="ghost" size="icon" className="rounded-full lg:hidden" onClick={() => setOpen((v) => !v)}>
            <Menu className="h-4 w-4" />
          </Button>
          <p className="text-sm text-muted-foreground">
            {user.name} · {user.role.replace("_", " ")}
          </p>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" className="rounded-full">
                Sign out
              </Button>
            </form>
          </div>
        </header>
        <div className="p-5 md:p-8">{children}</div>
      </div>
    </div>
  );
}
