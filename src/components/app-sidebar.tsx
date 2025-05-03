import { Link, useLocation } from "react-router-dom";
import {
  Album,
  DoorClosed,
  GraduationCap,
  LayoutDashboard,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

export function AppSidebar() {
  const location = useLocation();
  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Emploi du temps",
      url: "/edt",
      icon: Album,
    },
    {
      title: "Filieres",
      url: "/filieres",
      icon: GraduationCap,
    },
    {
      title: "Salles",
      url: "/salles",
      icon: DoorClosed,
    },
    {
      title: "Modules",
      url: "/modules",
      icon: Album,
    },
    {
      title: "Utilisateurs",
      url: "/users",
      icon: Users,
    },
  ];

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <Sidebar>
      <div className="bg-white h-full border-r border-gray-100">
        <SidebarContent className="pt-6">
          <div className="px-5 mb-8">
            <h2 className="text-lg font-bold flex items-center gap-3">
              <span className="bg-primary/10 p-2 rounded-lg">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </span>
              <span className="text-primary">EDT Manager</span>
            </h2>
          </div>

          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-400 font-medium px-5 text-xs uppercase tracking-wider mb-2">
              Menu principal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        size={"lg"}
                        asChild
                        data-active={active}
                        className="transition-all duration-200"
                      >
                        <Link
                          to={item.url}
                          className={`flex items-center px-5 py-3.5 rounded-lg gap-y-6 text-sm font-medium mr-2
                            ${
                              active
                                ? "bg-primary/5 text-primary border-l-4 border-primary"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                          <item.icon
                            className={`h-7 w-3.5 ${
                              active ? "text-primary" : "text-gray-500"
                            }`}
                          />
                          <span className="text-[15px]">{item.title}</span>
                          {active && (
                            <span className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
