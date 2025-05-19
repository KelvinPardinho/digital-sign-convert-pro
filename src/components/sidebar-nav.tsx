
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import { 
  Home, 
  FileText, 
  History, 
  FileSignature, 
  FilePlus2, 
  CreditCard, 
  Settings, 
  LogOut, 
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SidebarNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActivePath = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const userInitials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : "U";

  const menuItems = [
    { 
      title: "Dashboard", 
      path: "/dashboard", 
      icon: Home 
    },
    { 
      title: "Converter", 
      path: "/converter", 
      icon: FileText 
    },
    { 
      title: "Histórico", 
      path: "/history", 
      icon: History 
    },
    { 
      title: "Assinar Documentos", 
      path: "/sign", 
      icon: FileSignature 
    },
    { 
      title: "Juntar PDFs", 
      path: "/merge", 
      icon: FilePlus2,
      isPremium: true
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar>
            <AvatarImage src={user?.user_metadata?.avatar} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="font-medium truncate">{user?.user_metadata?.name || user?.email}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant={user?.plan === "premium" ? "default" : "outline"}>
            {user?.plan === "premium" ? "Plano Premium" : "Plano Gratuito"}
          </Badge>
          <ThemeToggle />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  isActive={isActivePath(item.path)}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                  {item.isPremium && user?.plan !== "premium" && (
                    <Badge variant="outline" className="ml-auto flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Pro
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Conta</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={isActivePath("/subscription")}
                onClick={() => navigate("/subscription")}
              >
                <CreditCard className="w-4 h-4" />
                <span>Assinatura</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-center text-muted-foreground">
          © {new Date().getFullYear()} Convert
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
