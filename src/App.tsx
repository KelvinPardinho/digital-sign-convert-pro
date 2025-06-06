
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { useState } from "react";
import Index from "./pages/Index";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Converter from "./pages/converter";
import Sign from "./pages/sign";
import Blog from "./pages/blog";
import BlogPost from "./pages/blog/[slug]";
import AdminBlog from "./pages/admin/blog";
import NotFound from "./pages/NotFound";
import History from "./pages/history";
import Subscription from "./pages/subscription";
import SubscriptionSuccess from "./pages/subscription-success";
import CertManager from "./pages/cert-manager";
import Merge from "./pages/merge";
import Split from "./pages/split";
import Ocr from "./pages/ocr";
import Protect from "./pages/protect";
import Unlock from "./pages/unlock";

const App = () => {
  // Create a new QueryClient instance inside the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/converter" element={<Converter />} />
                <Route path="/sign" element={<Sign />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/admin/blog" element={<AdminBlog />} />
                <Route path="/history" element={<History />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/subscription-success" element={<SubscriptionSuccess />} />
                <Route path="/cert-manager" element={<CertManager />} />
                <Route path="/merge" element={<Merge />} />
                <Route path="/split" element={<Split />} />
                <Route path="/ocr" element={<Ocr />} />
                <Route path="/protect" element={<Protect />} />
                <Route path="/unlock" element={<Unlock />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
