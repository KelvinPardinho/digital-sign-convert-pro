
import { Layout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { blogPosts } from "@/data/blog-posts";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { FeaturedPost } from "@/components/blog/FeaturedPost";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogAd } from "@/components/blog/BlogAd";

export default function Blog() {
  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col space-y-4 md:space-y-8">
          <BlogHeader 
            title="Blog Convert" 
            description="Dicas, tutoriais e novidades sobre assinatura digital e conversão de documentos"
          />
          
          {/* Destaque principal */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="overflow-hidden border-0 shadow-lg md:col-span-2">
              <FeaturedPost post={blogPosts[0]} />
            </Card>
          </div>
          
          {/* Ad for non-premium users */}
          <BlogAd />
          
          {/* Posts secundários */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
          
          {/* Bottom ad for non-premium users */}
          <BlogAd />
        </div>
      </div>
    </Layout>
  );
}
