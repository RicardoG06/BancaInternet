import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/lib/stores/authStore'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { cognitoAuth } from '@/services/cognitoService'

type AuthMode = 'signin' | 'signup'

export function LoginPage() {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={from} replace />
  }

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(undefined)
    
    try {
      // Login real con Cognito
      const cognitoUser = await cognitoAuth.signIn(email, password)
      
      // Convertir a formato del store
      const user = {
        id: cognitoUser.id,
        email: cognitoUser.email,
        firstName: cognitoUser.firstName || '',
        lastName: cognitoUser.lastName || '',
        emailVerified: cognitoUser.emailVerified,
        mfaEnabled: cognitoUser.mfaEnabled,
      }
      
      useAuthStore.getState().login(user)
      toast.success('Inicio de sesión exitoso')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (data: {
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
  }) => {
    setLoading(true)
    setError(undefined)
    
    try {
      // Validar contraseñas
      if (data.password !== data.confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      // Registro real con Cognito
      const result = await cognitoAuth.signUp({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })

      if (result.needsConfirmation) {
        toast.success('Registro exitoso. Por favor verifica tu email para confirmar tu cuenta.')
      } else {
        toast.success('Registro exitoso. Puedes iniciar sesión ahora.')
      }
      
      setMode('signin')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Banca por Internet
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Accede a tu cuenta bancaria de forma segura
          </p>
        </div>

        {/* Formularios */}
        {mode === 'signin' ? (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToRegister={() => setMode('signup')}
            loading={loading}
            error={error}
          />
        ) : (
          <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={() => setMode('signin')}
            loading={loading}
            error={error}
          />
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 Banca por Internet. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}