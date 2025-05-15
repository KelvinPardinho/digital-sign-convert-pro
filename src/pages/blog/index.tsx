
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { ChevronRight, Calendar, Clock, FileText } from "lucide-react";
import { blogPosts } from "@/data/blog-posts";

export default function Blog() {
  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col space-y-4 md:space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Blog Convert</h1>
            <p className="text-muted-foreground">
              Dicas, tutoriais e novidades sobre assinatura digital e conversão de documentos
            </p>
          </div>
          
          <Separator />
          
          {/* Destaque principal */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="overflow-hidden border-0 shadow-lg md:col-span-2">
              <div className="md:grid md:grid-cols-2">
                <div className="aspect-video md:aspect-auto overflow-hidden">
                  <img 
                    src={blogPosts[0].coverImage} 
                    alt={blogPosts[0].title} 
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" 
                  />
                </div>
                <div className="p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" /> 
                        <time dateTime={blogPosts[0].date}>{new Date(blogPosts[0].date).toLocaleDateString('pt-BR')}</time>
                        <span className="mx-2">•</span>
                        <Clock className="mr-1 h-3 w-3" /> 
                        <span>{blogPosts[0].readingTime} min de leitura</span>
                      </div>
                      <h2 className="text-2xl font-bold">{blogPosts[0].title}</h2>
                      <p className="text-muted-foreground line-clamp-2">{blogPosts[0].excerpt}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link to={`/blog/${blogPosts[0].slug}`}>
                      <Button>Ler artigo <ChevronRight className="ml-1 h-4 w-4" /></Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Posts secundários */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
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
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
