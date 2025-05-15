
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export function BlogAd() {
  const { user } = useAuth();
  
  // Don't show ads to premium users
  if (user?.plan === 'premium') {
    return null;
  }
  
  return (
    <Card className="my-6 bg-muted/30 border-primary/20">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-medium">Remova os anúncios e acesse recursos exclusivos</p>
            <p className="text-sm text-muted-foreground">Assine nosso plano Premium para uma experiência sem interrupções</p>
          </div>
          <Button asChild>
            <Link to="/subscription">Assinar Premium</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
