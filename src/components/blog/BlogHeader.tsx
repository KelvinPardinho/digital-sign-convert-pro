
import { Separator } from "@/components/ui/separator";

interface BlogHeaderProps {
  title: string;
  description: string;
}

export function BlogHeader({ title, description }: BlogHeaderProps) {
  return (
    <>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
      <Separator />
    </>
  );
}
