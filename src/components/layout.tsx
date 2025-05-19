
import { SidebarNav } from "./sidebar-nav";
import { useAuth } from "@/providers/AuthProvider";
import { Navigate, useLocation } from "react-router-dom";
import { Navbar } from "./navbar";
import { SidebarProvider, SidebarInset, SidebarRail } from "@/components/ui/sidebar";

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function Layout({ children, requireAuth = false }: LayoutProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Se estamos carregando, mostramos um estado de carregamento
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Verificar requisitos de autenticação
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Exibir layout diferente para usuários autenticados vs não autenticados
  if (user) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <SidebarNav />
          <SidebarRail />
          <SidebarInset className="pb-0">
            <div className="flex-1 overflow-auto">
              <main>{children}</main>
              
              <footer className="border-t py-6 bg-muted/30">
                <div className="container">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      © {new Date().getFullYear()} Convert. Todos os direitos reservados.
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <a href="/terms" className="hover:text-foreground transition-colors">Termos</a>
                      <a href="/privacy" className="hover:text-foreground transition-colors">Privacidade</a>
                      <a href="/support" className="hover:text-foreground transition-colors">Suporte</a>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }
  
  // Layout para usuários não autenticados
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      
      <footer className="border-t py-6 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Convert. Todos os direitos reservados.
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="/terms" className="hover:text-foreground transition-colors">Termos</a>
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacidade</a>
              <a href="/support" className="hover:text-foreground transition-colors">Suporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
