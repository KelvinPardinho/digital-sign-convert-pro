
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Edit, Download, Layers, Lock, Check } from "lucide-react";

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-convert-50 to-convert-100 dark:from-convert-900 dark:to-convert-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter animate-fade-in">
              Assine e converta documentos com facilidade
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground md:w-2/3 animate-fade-in">
              A plataforma completa para profissionais que precisam assinar digitalmente 
              e converter documentos com segurança e praticidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
              <Link to="/register">
                <Button size="lg" className="gap-2">
                  Começar agora <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline">
                  Ver recursos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Recursos principais</h2>
            <p className="text-muted-foreground mt-4 md:w-2/3 mx-auto">
              Conheça algumas das funcionalidades que farão você economizar tempo e trabalhar com mais eficiência.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col p-6 bg-card rounded-lg shadow-sm border">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Edit className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Assinatura Digital</h3>
              <p className="mt-2 text-muted-foreground">
                Assine documentos com certificado digital ICP-Brasil A1/A3 ou colha assinaturas de clientes e parceiros.
              </p>
            </div>
            
            <div className="flex flex-col p-6 bg-card rounded-lg shadow-sm border">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Conversão de Arquivos</h3>
              <p className="mt-2 text-muted-foreground">
                Converta entre diversos formatos como PDF, Word, Excel e imagens com apenas alguns cliques.
              </p>
            </div>
            
            <div className="flex flex-col p-6 bg-card rounded-lg shadow-sm border">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Manipulação de PDFs</h3>
              <p className="mt-2 text-muted-foreground">
                Junte, divida, comprima e numere páginas de seus documentos PDF com facilidade.
              </p>
            </div>
            
            <div className="flex flex-col p-6 bg-card rounded-lg shadow-sm border">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Gestão de Certificados</h3>
              <p className="mt-2 text-muted-foreground">
                Gerencie seus certificados digitais A1 e A3 em um único lugar com segurança.
              </p>
            </div>
            
            <div className="flex flex-col p-6 bg-card rounded-lg shadow-sm border">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Histórico Completo</h3>
              <p className="mt-2 text-muted-foreground">
                Acompanhe o status de todos os seus documentos com histórico detalhado e notificações.
              </p>
            </div>
            
            <div className="flex flex-col p-6 bg-card rounded-lg shadow-sm border">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Interface Intuitiva</h3>
              <p className="mt-2 text-muted-foreground">
                Design minimalista e responsivo para você trabalhar de qualquer dispositivo, sem complicações.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Planos simples e transparentes</h2>
            <p className="text-muted-foreground mt-4 md:w-2/3 mx-auto">
              Escolha o plano que melhor atende às suas necessidades.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col p-6 bg-card rounded-lg shadow-sm border border-border">
              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground">Plano</p>
                <h3 className="text-2xl font-bold">Gratuito</h3>
              </div>
              <div className="mb-6">
                <p className="text-3xl font-bold">R$ 0<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                <p className="text-sm text-muted-foreground">Para uso pessoal e experimentação</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>5 conversões por mês</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>3 assinaturas por mês</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Manipulação básica de PDFs</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Histórico por 30 dias</span>
                </li>
              </ul>
              <Link to="/register" className="mt-auto">
                <Button variant="outline" className="w-full">
                  Começar grátis
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-col p-6 bg-card rounded-lg shadow-md border-2 border-primary relative">
              <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-xs font-medium py-1 px-3 rounded-full">
                Recomendado
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground">Plano</p>
                <h3 className="text-2xl font-bold">Premium</h3>
              </div>
              <div className="mb-6">
                <p className="text-3xl font-bold">R$ 29<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                <p className="text-sm text-muted-foreground">Para profissionais e empresas</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Conversões ilimitadas</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Assinaturas ilimitadas</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Todos os recursos de manipulação</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Histórico permanente</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Suporte prioritário</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Envio automático por e-mail</span>
                </li>
              </ul>
              <Link to="/register" className="mt-auto">
                <Button className="w-full">
                  Assinar agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-3xl font-bold">Comece a usar o Convert hoje mesmo</h2>
            <p className="text-muted-foreground md:w-2/3">
              Junte-se a milhares de profissionais que economizam tempo e trabalham com mais eficiência.
            </p>
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Criar conta gratuita <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
