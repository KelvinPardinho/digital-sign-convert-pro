
import { createContext, useContext, useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/integrations/supabase/client'

// Tipos para nosso contexto de autenticação
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  plan: 'free' | 'premium'
  isAdmin?: boolean // Added isAdmin property to fix TypeScript errors
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => void
}

// Criando o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

// Provider do contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Verificar se o usuário já está autenticado ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      
      try {
        // Primeiro tentar obter a sessão do Supabase
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Tentar buscar dados adicionais do usuário do banco Supabase
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (userData) {
            // Usuário encontrado no banco do Supabase
            const userWithMappedName = {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name || "Usuário",
              plan: userData.plan as 'free' | 'premium',
              isAdmin: userData.is_admin || false,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.user_metadata?.name || "Usuário")}&background=random`
            }
            
            setUser(userWithMappedName)
          } else if (error) {
            console.error("Erro ao buscar dados do usuário:", error)
            // Fallback para local storage caso já tenha usuário local
            fallbackToLocalStorage()
          }
        } else {
          // Fallback para local storage se não tiver sessão no Supabase
          fallbackToLocalStorage()
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        fallbackToLocalStorage()
      } finally {
        setIsLoading(false)
      }
    }
    
    const fallbackToLocalStorage = () => {
      // Fallback para localStorage (para desenvolvimento / demo)
      const storedUser = localStorage.getItem('convertUser')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      } else {
        setUser(null)
      }
    }
    
    checkAuth()
    
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          try {
            // Buscar dados adicionais do usuário
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (userData) {
              const userWithMappedName = {
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata?.name || "Usuário",
                plan: userData.plan as 'free' | 'premium',
                isAdmin: userData.is_admin || false,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.user_metadata?.name || "Usuário")}&background=random`
              }
              
              setUser(userWithMappedName)
            }
          } catch (error) {
            console.error("Erro ao atualizar dados do usuário:", error)
          }
        } else {
          setUser(null)
        }
      }
    )
    
    return () => {
      // Limpar subscription quando o componente for desmontado
      subscription.unsubscribe()
    }
  }, [])

  // Função de login 
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      // Tentar login no Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      if (data.user) {
        // Login no Supabase bem sucedido
        toast({
          title: 'Login realizado com sucesso',
          description: `Bem-vindo de volta!`,
        })
        return
      }
      
      // Fallback para login local (para desenvolvimento / demo)
      // Simulando um delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Neste MVP, vamos apenas verificar se o usuário existe no localStorage
      const storedUsers = JSON.parse(localStorage.getItem('convertUsers') || '[]')
      const foundUser = storedUsers.find((u: any) => u.email === email)
      
      if (!foundUser || foundUser.password !== password) {
        throw new Error('E-mail ou senha incorretos')
      }
      
      // Removendo a senha antes de salvar no state
      const { password: _, ...safeUser } = foundUser
      
      // Ensure the plan is either 'free' or 'premium'
      const userWithValidPlan = {
        ...safeUser,
        plan: safeUser.plan === 'premium' ? 'premium' : 'free',
        isAdmin: safeUser.isAdmin || false // Ensure isAdmin is defined
      } as User;
      
      setUser(userWithValidPlan)
      localStorage.setItem('convertUser', JSON.stringify(userWithValidPlan))
      
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo de volta, ${userWithValidPlan.name}!`,
      })
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Função de registro
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)
      
      // Tentar criar conta no Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        }
      })
      
      if (error) throw error
      
      if (data.user) {
        // Cadastro no Supabase bem sucedido
        toast({
          title: 'Cadastro realizado com sucesso',
          description: `Bem-vindo ao Convert, ${name}!`,
        })
        return
      }
      
      // Fallback para cadastro local (para desenvolvimento / demo)
      // Simulando um delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Verifica se já existe um usuário com este email
      const storedUsers = JSON.parse(localStorage.getItem('convertUsers') || '[]')
      if (storedUsers.some((user: any) => user.email === email)) {
        throw new Error('E-mail já cadastrado')
      }
      
      // Criar novo usuário
      const newUser = {
        id: `user-${Date.now().toString(36)}`,
        email,
        password,
        name,
        plan: 'free' as const,
        isAdmin: false, // Set default isAdmin value
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      }
      
      // Salvar no "banco de dados" local
      localStorage.setItem('convertUsers', JSON.stringify([...storedUsers, newUser]))
      
      // Remover senha antes de salvar no state
      const { password: _, ...safeUser } = newUser
      setUser(safeUser)
      localStorage.setItem('convertUser', JSON.stringify(safeUser))
      
      toast({
        title: 'Cadastro realizado com sucesso',
        description: `Bem-vindo ao Convert, ${name}!`,
      })
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer cadastro',
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Função de logout
  const signOut = async () => {
    try {
      // Tentar logout do Supabase
      await supabase.auth.signOut()
      
      // Também limpar o localStorage (para desenvolvimento / demo)
      localStorage.removeItem('convertUser')
      
      // Atualizar o estado
      setUser(null)
      
      toast({
        title: 'Sessão encerrada',
        description: 'Você saiu do sistema.',
      })
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      toast({
        variant: 'destructive',
        title: 'Erro ao sair',
        description: 'Ocorreu um erro ao tentar encerrar a sessão.',
      })
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
