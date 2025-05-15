
import { Link } from "react-router-dom";
import { ChevronRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/types/blog";

interface FeaturedPostProps {
  post: BlogPost;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <div className="overflow-hidden border-0 shadow-lg md:grid md:grid-cols-2">
      <div className="aspect-video md:aspect-auto overflow-hidden">
        <img 
          src={post.coverImage} 
          alt={post.title} 
          className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" 
        />
      </div>
      <div className="p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" /> 
              <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('pt-BR')}</time>
              <span className="mx-2">•</span>
              <Clock className="mr-1 h-3 w-3" /> 
              <span>{post.readingTime} min de leitura</span>
            </div>
            <h2 className="text-2xl font-bold">{post.title}</h2>
            <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
          </div>
        </div>
        <div className="mt-4">
          <Link to={`/blog/${post.slug}`}>
            <Button>Ler artigo <ChevronRight className="ml-1 h-4 w-4" /></Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
