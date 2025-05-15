
import { Link } from "react-router-dom";
import { Calendar, Clock, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/types/blog";

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Card key={post.slug} className="overflow-hidden flex flex-col">
      <div className="aspect-video overflow-hidden">
        <img 
          src={post.coverImage} 
          alt={post.title} 
          className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" 
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Calendar className="mr-1 h-3 w-3" /> 
          <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('pt-BR')}</time>
          <span className="mx-2">•</span>
          <Clock className="mr-1 h-3 w-3" /> 
          <span>{post.readingTime} min de leitura</span>
        </div>
        <CardTitle>{post.title}</CardTitle>
        <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm">
          <FileText className="mr-1 h-4 w-4 text-primary" />
          <span className="font-medium text-primary">{post.category}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link to={`/blog/${post.slug}`} className="w-full">
          <Button variant="outline" className="w-full">Ler artigo</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
