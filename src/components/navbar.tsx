
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, CreditCard, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/auth";

export function Navbar() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-background border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-bold text-2xl">
          Convert
        </Link>
        <nav className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar || ""} alt={user.user_metadata?.name || user.email} />
                    <AvatarFallback>{(user.user_metadata?.name || user.email || "").charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.name || user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/subscription">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Assinatura</span>
                      {user.plan && (
                        <DropdownMenuShortcut>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {user.plan === "premium" ? "Premium" : "Free"}
                          </Badge>
                        </DropdownMenuShortcut>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/history">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Histórico</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {user.is_admin && (
                  <>
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/blog">
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Gerenciar Blog</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">
                <Button>Criar Conta</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
