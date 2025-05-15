
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import { useAuth } from "@/providers/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FileText, Lock, LogOut, Menu, User, X } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b border-border py-4 bg-background sticky top-0 z-50">
      <div className="container flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <FileText className="h-6 w-6 text-primary" />
            <span>Convert</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <div className="flex gap-6">
                <Link to="/dashboard" className="text-sm hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link to="/converter" className="text-sm hover:text-primary transition-colors">
                  Converter
                </Link>
                <Link to="/sign" className="text-sm hover:text-primary transition-colors">
                  Assinar
                </Link>
                <Link to="/history" className="text-sm hover:text-primary transition-colors">
                  Histórico
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link to="/profile">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        Perfil
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/subscription">
                      <DropdownMenuItem>
                        <Lock className="mr-2 h-4 w-4" />
                        Assinatura
                        <span className="ml-auto bg-primary/15 text-primary text-xs py-0.5 px-2 rounded-full">
                          {user.plan === 'premium' ? 'Premium' : 'Grátis'}
                        </span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-6">
                <Link to="/pricing" className="text-sm hover:text-primary transition-colors">
                  Preços
                </Link>
                <Link to="/features" className="text-sm hover:text-primary transition-colors">
                  Recursos
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Link to="/login">
                  <Button variant="outline">Entrar</Button>
                </Link>
                <Link to="/register">
                  <Button>Criar conta</Button>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden py-4 px-6 bg-background border-t animate-fade-in">
          <div className="flex flex-col gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="py-2" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/converter" className="py-2" onClick={() => setIsOpen(false)}>
                  Converter
                </Link>
                <Link to="/sign" className="py-2" onClick={() => setIsOpen(false)}>
                  Assinar
                </Link>
                <Link to="/history" className="py-2" onClick={() => setIsOpen(false)}>
                  Histórico
                </Link>
                <Link to="/profile" className="py-2" onClick={() => setIsOpen(false)}>
                  Perfil
                </Link>
                <Link to="/subscription" className="py-2" onClick={() => setIsOpen(false)}>
                  Assinatura
                  <span className="ml-2 bg-primary/15 text-primary text-xs py-0.5 px-2 rounded-full">
                    {user.plan === 'premium' ? 'Premium' : 'Grátis'}
                  </span>
                </Link>
                <button onClick={() => { signOut(); setIsOpen(false); }} className="py-2 text-left text-destructive">
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/pricing" className="py-2" onClick={() => setIsOpen(false)}>
                  Preços
                </Link>
                <Link to="/features" className="py-2" onClick={() => setIsOpen(false)}>
                  Recursos
                </Link>
                <Link to="/login" className="py-2" onClick={() => setIsOpen(false)}>
                  Entrar
                </Link>
                <Link to="/register" className="py-2" onClick={() => setIsOpen(false)}>
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
