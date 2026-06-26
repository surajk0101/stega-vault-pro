import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  EyeOff,
  ScanLine,
  History,
  ShieldCheck,
  Settings,
  Info,
  Lock,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, group: "Overview" },
  { title: "Hide Data", url: "/hide", icon: EyeOff, group: "Operations" },
  { title: "Extract Data", url: "/extract", icon: ScanLine, group: "Operations" },
  { title: "Integrity", url: "/integrity", icon: ShieldCheck, group: "Operations" },
  { title: "History", url: "/history", icon: History, group: "Records" },
  { title: "Settings", url: "/settings", icon: Settings, group: "System" },
  { title: "About", url: "/about", icon: Info, group: "System" },
] as const;

const groups = ["Overview", "Operations", "Records", "System"] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border glass">
      <SidebarHeader className="px-3 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 rounded-xl bg-[var(--gradient-cyber)] grid place-items-center shadow-[var(--shadow-glow)]">
            <Lock className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-background animate-[pulse-glow_2s_ease-in-out_infinite]" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-display text-sm font-bold tracking-wider text-gradient-cyber">
                STEGAVAULT
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium">
                Pro · v1.0
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {groups.map((g) => (
          <SidebarGroup key={g}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                {g}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {items
                  .filter((i) => i.group === g)
                  .map((item) => {
                    const active = isActive(item.url);
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          className="data-[active=true]:bg-[var(--gradient-cyber)] data-[active=true]:text-primary-foreground data-[active=true]:shadow-[var(--shadow-glow)] hover:bg-sidebar-accent/60 transition-all"
                        >
                          <Link to={item.url} className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            {!collapsed && <span className="font-medium">{item.title}</span>}
                            {!collapsed && active && (
                              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-3 py-3 border-t border-sidebar-border">
        {!collapsed ? (
          <div className="glass rounded-lg p-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Secure Session
            </div>
            <div className="mt-1 font-mono text-xs text-foreground/80">AES-256 · PBKDF2</div>
          </div>
        ) : (
          <div className="h-2 w-2 rounded-full bg-success animate-pulse mx-auto" />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
