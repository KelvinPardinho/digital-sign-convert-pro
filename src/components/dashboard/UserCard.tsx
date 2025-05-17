
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";

export function UserCard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.user_metadata?.avatar || ""} />
            <AvatarFallback>
              {(user.user_metadata?.name || user.email || "").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-2xl font-bold">{user.user_metadata?.name || user.email}</h3>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={user.plan === "premium" ? "default" : "outline"}>
                {user.plan === "premium" ? "Premium" : "Free"}
              </Badge>
              {user.is_admin && <Badge variant="secondary">Admin</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
