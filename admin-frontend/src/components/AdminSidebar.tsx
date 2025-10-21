import { NavLink, useLocation } from "react-router-dom";
import {
  FileText,
  Plus,
  FolderOpen,
  Users,
  Settings,
  BarChart3,
  Home,
  Radio,
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
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    roles: ["author", "editor", "admin"],
  },
  {
    title: "Articles",
    url: "/articles",
    icon: FileText,
    roles: ["author", "editor", "admin"],
  },
  {
    title: "New Article",
    url: "/articles/create",
    icon: Plus,
    roles: ["author", "editor", "admin"],
  },
  {
    title: "Categories",
    url: "/categories",
    icon: FolderOpen,
    roles: ["editor", "admin"],
  },
  { title: "Users", url: "/users", icon: Users, roles: ["admin"] },
  {
    title: "Breaking News",
    url: "/breaking-news",
    icon: Radio,
    roles: ["editor", "admin"],
  },
  {
    title: "Block Editor Demo",
    url: "/block-editor-demo",
    icon: FileText,
    roles: ["author", "editor", "admin"],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["author", "editor", "admin"],
  },
];

export function AdminSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100";

  const filteredItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible>
      <SidebarContent className="bg-white border-r">
        <div className="p-4 border-b">
          <h2
            className={`font-bold text-xl text-gray-900 ${
              collapsed ? "hidden" : "block"
            }`}
          >
            News Admin
          </h2>
          {collapsed && (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              N
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "hidden" : "block"}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={getNavCls}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
