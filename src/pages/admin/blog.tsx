import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { BlogPost, BlogFormData } from "@/types/blog";
import { blogPosts } from "@/data/blog-posts";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

export default function AdminBlog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>(blogPosts);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogFormData>({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "tutorial"
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Check if the user is admin
  if (!user || !user.is_admin) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
            <p className="text-muted-foreground mb-8">
              Esta página é restrita para administradores.
            </p>
            <Button asChild>
              <Link to="/">Voltar para Home</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // If not logged in, redirected via Layout component

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentPost(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setCurrentPost(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPost.title || !currentPost.content || !currentPost.coverImage) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // This is where you'd normally save to a database
    // For now we'll just update the local state
    if (isEditing && editingId) {
      // Update existing post
      const updatedPosts = posts.map(post => 
        post.slug === editingId 
          ? {
              ...post,
              title: currentPost.title,
              excerpt: currentPost.excerpt,
              content: currentPost.content,
              coverImage: currentPost.coverImage,
              category: currentPost.category,
            }
          : post
      );
      setPosts(updatedPosts);
      toast({
        title: "Post atualizado",
        description: "O artigo foi atualizado com sucesso."
      });
    } else {
      // Create new post
      const newSlug = currentPost.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      const newPost: BlogPost = {
        title: currentPost.title,
        slug: newSlug,
        excerpt: currentPost.excerpt,
        content: currentPost.content,
        coverImage: currentPost.coverImage,
        date: new Date().toISOString(),
        author: {
          name: user.user_metadata?.name || user.email,
          role: "Administrador",
          avatar: user.user_metadata?.avatar || "/placeholder.svg"
        },
        category: currentPost.category,
        readingTime: Math.ceil(currentPost.content.split(' ').length / 200)
      };
      
      setPosts([newPost, ...posts]);
      toast({
        title: "Post criado",
        description: "O novo artigo foi criado com sucesso."
      });
    }
    
    // Reset form
    setIsEditing(false);
    setEditingId(null);
    setCurrentPost({
      title: "",
      excerpt: "",
      content: "",
      coverImage: "",
      category: "tutorial"
    });
  };

  const handleEdit = (post: BlogPost) => {
    setIsEditing(true);
    setEditingId(post.slug);
    setCurrentPost({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      category: post.category
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (slug: string) => {
    if (confirm("Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.")) {
      setPosts(posts.filter(post => post.slug !== slug));
      toast({
        title: "Post excluído",
        description: "O artigo foi removido com sucesso."
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setCurrentPost({
      title: "",
      excerpt: "",
      content: "",
      coverImage: "",
      category: "tutorial"
    });
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gerenciador de Blog</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {user.user_metadata?.name || user.email}
            </p>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.user_metadata?.avatar || ""} />
            <AvatarFallback>{(user.user_metadata?.name || user.email || "").charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gerenciamento de Blog</h1>
            <p className="text-muted-foreground">Crie e edite artigos para o blog da plataforma.</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Editar Artigo' : 'Novo Artigo'}</CardTitle>
              <CardDescription>
                {isEditing 
                  ? 'Atualize os detalhes do artigo existente' 
                  : 'Preencha os campos para criar um novo artigo para o blog'}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input 
                    id="title" 
                    name="title"
                    value={currentPost.title}
                    onChange={handleChange}
                    placeholder="Digite o título do artigo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Resumo</Label>
                  <Textarea 
                    id="excerpt" 
                    name="excerpt"
                    value={currentPost.excerpt}
                    onChange={handleChange}
                    placeholder="Digite um breve resumo do artigo"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo</Label>
                  <Textarea 
                    id="content" 
                    name="content"
                    value={currentPost.content}
                    onChange={handleChange}
                    placeholder="Digite o conteúdo completo do artigo"
                    rows={10}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coverImage">URL da Imagem de Capa</Label>
                    <Input 
                      id="coverImage" 
                      name="coverImage"
                      value={currentPost.coverImage}
                      onChange={handleChange}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select 
                      value={currentPost.category} 
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                        <SelectItem value="noticia">Notícia</SelectItem>
                        <SelectItem value="guia">Guia</SelectItem>
                        <SelectItem value="dicas">Dicas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                {isEditing ? (
                  <>
                    <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
                    <Button type="submit">Salvar Alterações</Button>
                  </>
                ) : (
                  <>
                    <div></div>
                    <Button type="submit">Publicar Artigo</Button>
                  </>
                )}
              </CardFooter>
            </form>
          </Card>
          
          <div>
            <h2 className="text-2xl font-bold mb-4">Artigos Existentes</h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.slug}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{post.title}</CardTitle>
                        <CardDescription>
                          Publicado em {new Date(post.date).toLocaleDateString('pt-BR')} • {post.readingTime} min de leitura
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleEdit(post)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => handleDelete(post.slug)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
