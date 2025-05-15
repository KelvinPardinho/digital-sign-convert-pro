
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Clock, User, Facebook, Twitter, Linkedin, ArrowRight } from "lucide-react";
import { blogPosts } from "@/data/blog-posts";
import { BlogAd } from '@/components/blog/BlogAd';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  
  useEffect(() => {
    // Find the post that matches the slug
    const currentPost = blogPosts.find(post => post.slug === slug);
    
    if (currentPost) {
      setPost(currentPost);
      
      // Get related posts from the same category
      const related = blogPosts
        .filter(p => p.slug !== slug && p.category === currentPost.category)
        .slice(0, 3);
      
      setRelatedPosts(related);
    }
  }, [slug]);
  
  if (!post) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Artigo não encontrado</h1>
              <p className="text-muted-foreground mt-2">O artigo que você está procurando não existe ou foi removido.</p>
              <Button asChild className="mt-4">
                <Link to="/blog">Voltar para o blog</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col items-start space-y-8 max-w-3xl mx-auto">
          {/* Back navigation */}
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o blog
            </Link>
          </Button>
          
          {/* Article header */}
          <div className="space-y-4 w-full">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{post.title}</h1>
              <p className="text-xl text-muted-foreground">{post.excerpt}</p>
            </div>
            
            <div className="flex items-center space-x-4 pt-4">
              <Avatar>
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback><User /></AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="font-medium">{post.author.name}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" /> 
                  <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('pt-BR')}</time>
                  <span className="mx-2">•</span>
                  <Clock className="mr-1 h-3 w-3" /> 
                  <span>{post.readingTime} min de leitura</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cover image */}
          <div className="w-full">
            <div className="aspect-[16/9] relative overflow-hidden rounded-lg">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="object-cover w-full h-full" 
              />
            </div>
          </div>
          
          {/* First ad for non-premium users */}
          <BlogAd />
          
          {/* Article content */}
          <article className="prose prose-lg dark:prose-invert max-w-none w-full">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
          
          {/* Second ad for non-premium users */}
          <BlogAd />
          
          {/* Article footer */}
          <div className="w-full border rounded-lg p-6 mt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Escrito por {post.author.name}</p>
                  <p className="text-sm text-muted-foreground">{post.author.role}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="icon">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div className="w-full space-y-4">
              <h2 className="text-2xl font-bold">Artigos relacionados</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map((related) => (
                  <Card key={related.slug} className="overflow-hidden">
                    <Link to={`/blog/${related.slug}`} className="block">
                      <div className="aspect-[16/9] overflow-hidden">
                        <img 
                          src={related.coverImage} 
                          alt={related.title} 
                          className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" /> 
                          <time dateTime={related.date}>{new Date(related.date).toLocaleDateString('pt-BR')}</time>
                        </div>
                        <h3 className="font-bold line-clamp-2">{related.title}</h3>
                        <div className="flex items-center text-primary">
                          <span>Ler artigo</span>
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
