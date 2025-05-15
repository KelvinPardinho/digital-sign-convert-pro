
import { createContext, useContext, useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

// Tipos para nosso contexto de autenticação
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  plan: 'free' | 'premium'
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

  // Simular a verificação do usuário ao carregar a página
  useEffect(() => {
    const storedUser = localStorage.getItem('convertUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // Função de login (simulada para o MVP)
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
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
      setUser(safeUser)
      localStorage.setItem('convertUser', JSON.stringify(safeUser))
      
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo de volta, ${safeUser.name}!`,
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

  // Função de registro (simulada para o MVP)
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)
      
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
        plan: 'free',
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
  const signOut = () => {
    setUser(null)
    localStorage.removeItem('convertUser')
    toast({
      title: 'Sessão encerrada',
      description: 'Você saiu do sistema.',
    })
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
