import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/skeleton'
import { ApiService } from '@/services/apiService'
import { AccountMapper, Account } from '@/mappers/accountMapper'
import { formatCurrency, getInitials } from '@/lib/utils'
import { useAppContext } from '@/components/AppInitializationProvider'
import { useProfileData } from '@/hooks/useProfile'
import { z } from 'zod'

// Schema de validación para perfil
const profileSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
})

type ProfileFormData = z.infer<typeof profileSchema>
import { 
  User, 
  Mail, 
  Shield, 
  CreditCard,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const { config } = useAppContext();
  const apiService = new ApiService(config!);

  // Obtener datos de perfil reales
  const { profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useProfileData();

  // Obtener cuentas
  const { data: accountsData, isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await apiService.getAccounts();
      return AccountMapper.toAccountResponse(response);
    },
  })

  const accounts = accountsData?.accounts || []

  // Formulario de perfil
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.givenName || '',
      lastName: profile?.familyName || '',
      email: profile?.email || '',
    },
  })

  // Mutación para crear datos de ejemplo
  const seedDataMutation = useMutation({
    mutationFn: async () => {
      return await apiService.createSeedData();
    },
    onSuccess: (data: any) => {
      toast.success(`Datos de ejemplo creados: ${data.accountsCreated || 0} cuentas y ${data.transactionsCreated || 0} transacciones`)
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear datos de ejemplo')
    },
  })

  const handleCreateSeedData = () => {
    seedDataMutation.mutate()
  }

  const onSubmit = async (formData: ProfileFormData) => {
    setIsSubmitting(true)
    try {
      // En una implementación real, aquí se actualizaría el perfil
      console.log('Datos del formulario:', formData);
      toast.success('Perfil actualizado exitosamente')
      setIsEditing(false)
    } catch (error) {
      toast.error('Error al actualizar el perfil')
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleCancel = () => {
    setIsEditing(false)
    form.reset()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona tu información personal y cuentas
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            refetchProfile();
          }}
          disabled={accountsLoading || profileLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${(accountsLoading || profileLoading) ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Actualiza tu información personal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ) : profileError ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Error al cargar perfil
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {profileError instanceof Error ? profileError.message : 'Error desconocido'}
                  </p>
                  <Button onClick={() => refetchProfile()} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reintentar
                  </Button>
                </div>
              ) : isEditing ? (
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        {...form.register('firstName')}
                        placeholder="Juan"
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        {...form.register('lastName')}
                        placeholder="Pérez"
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      placeholder="tu@email.com"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : profile ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                        {getInitials(profile.name || profile.email)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {profile.name || 'Usuario'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Nombre
                      </Label>
                      <p className="text-gray-900 dark:text-white">{profile.givenName || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Apellido
                      </Label>
                      <p className="text-gray-900 dark:text-white">{profile.familyName || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email
                      </Label>
                      <p className="text-gray-900 dark:text-white">{profile.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Estado
                      </Label>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-green-600 text-sm capitalize">
                          {profile.status === 'ACTIVE' ? 'Activo' : profile.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Tipo de Cliente
                      </Label>
                      <p className="text-gray-900 dark:text-white capitalize">
                        {profile.customerType === 'INDIVIDUAL' ? 'Individual' : profile.customerType}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Perfil de Riesgo
                      </Label>
                      <p className="text-gray-900 dark:text-white capitalize">
                        {profile.riskProfile === 'CONSERVATIVE' ? 'Conservador' : profile.riskProfile}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Miembro desde
                      </Label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(profile.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Última actualización
                      </Label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(profile.updatedAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No se encontró información del perfil
                  </h3>
                  <Button onClick={() => refetchProfile()} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reintentar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Seguridad
              </CardTitle>
              <CardDescription>
                Configuración de seguridad de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Notificaciones por Email
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {profile?.preferences?.notifications?.email ? 'Activadas' : 'Desactivadas'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-green-600">
                    {profile?.preferences?.notifications?.email ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-1" />
                        <span className="text-sm font-medium">Activo</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 mr-1" />
                        <span className="text-sm font-medium">Inactivo</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Autenticación de Dos Factores
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Añade una capa extra de seguridad
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accounts Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Mis Cuentas
              </CardTitle>
              <CardDescription>
                Resumen de tus cuentas bancarias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accountsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No tienes cuentas
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Crea datos de ejemplo para comenzar
                  </p>
                  <Button 
                    onClick={handleCreateSeedData}
                    disabled={seedDataMutation.isPending}
                    className="w-full"
                  >
                    {seedDataMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      'Crear Datos de Ejemplo'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <AccountSummaryCard key={account.accountId} account={account} />
                  ))}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(accounts.reduce((sum, acc) => sum + acc.balance, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Seguridad
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Notificaciones
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AccountSummaryCard({ account }: { account: Account }) {
  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'CHECKING':
        return <CreditCard className="h-5 w-5 text-blue-600" />
      case 'SAVINGS':
        return <CreditCard className="h-5 w-5 text-green-600" />
      default:
        return <CreditCard className="h-5 w-5 text-gray-600" />
    }
  }

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'CHECKING':
        return 'Corriente'
      case 'SAVINGS':
        return 'Ahorros'
      default:
        return 'Cuenta'
    }
  }

  return (
    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex-shrink-0">
        {getAccountIcon(account.accountType)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {account.accountName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {getAccountTypeLabel(account.accountType)}
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {formatCurrency(account.balance)}
        </p>
      </div>
    </div>
  )
}
