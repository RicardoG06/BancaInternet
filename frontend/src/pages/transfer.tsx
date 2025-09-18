import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/skeleton'
import { ApiService } from '@/services/apiService'
import { AccountMapper } from '@/mappers/accountMapper'
import { formatCurrency, generateIdempotencyKey } from '@/lib/utils'
import { useAppContext } from '@/components/AppInitializationProvider'
import { toast } from 'sonner'
import { z } from 'zod'

// Schema de validación para transferencias
const transferSchema = z.object({
  sourceAccountId: z.string().min(1, 'Selecciona una cuenta origen'),
  targetAccountId: z.string().min(1, 'Selecciona una cuenta destino'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a $0.01'),
  note: z.string().optional(),
  idempotencyKey: z.string().optional(),
})

type TransferFormData = z.infer<typeof transferSchema>
import { 
  ArrowLeftRight, 
  CreditCard, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react'

export function TransferPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const { config } = useAppContext();
  const apiService = new ApiService(config!);

  // Obtener cuentas
  const { data: accountsData, isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await apiService.getAccounts();
      return AccountMapper.toAccountResponse(response);
    },
  })

  const accounts = accountsData?.accounts || []

  // Formulario
  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      sourceAccountId: '',
      targetAccountId: '',
      amount: 0,
      note: '',
    },
  })

  // Mutación para transferencia
  const transferMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      return await apiService.createTransfer({
        sourceAccountId: data.sourceAccountId,
        targetAccountId: data.targetAccountId,
        amount: data.amount,
        note: data.note,
        idempotencyKey: generateIdempotencyKey(),
      });
    },
    onSuccess: (data: any) => {
      if (data.status === 'COMPLETED') {
        toast.success('Transferencia completada exitosamente')
        // Invalidar queries para actualizar datos
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
        // Resetear formulario
        form.reset()
      } else {
        toast.error(data.message || 'Error en la transferencia')
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al procesar la transferencia')
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  const onSubmit = async (data: TransferFormData) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    
    // Generar clave de idempotencia
    const idempotencyKey = generateIdempotencyKey()
    
    try {
      await transferMutation.mutateAsync({
        ...data,
        idempotencyKey,
      })
    } catch (error) {
      // Error handled in mutation
    }
  }

  const sourceAccountId = form.watch('sourceAccountId')
  const targetAccountId = form.watch('targetAccountId')
  const amount = form.watch('amount')

  const sourceAccount = accounts.find(acc => acc.accountId === sourceAccountId)
  const targetAccount = accounts.find(acc => acc.accountId === targetAccountId)

  const dailyLimit = 500 // USD
  const remainingDailyLimit = dailyLimit // En una implementación real, esto vendría del backend

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Transferencias
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Transfiere dinero entre tus cuentas de forma segura
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['accounts'] })}
          disabled={accountsLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${accountsLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowLeftRight className="h-5 w-5 mr-2" />
                Nueva Transferencia
              </CardTitle>
              <CardDescription>
                Completa los datos para realizar la transferencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sourceAccountId">Cuenta Origen</Label>
                    <Select
                      value={sourceAccountId}
                      onValueChange={(value) => {
                        form.setValue('sourceAccountId', value)
                        form.setValue('targetAccountId', '') // Reset target when source changes
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona cuenta origen" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountsLoading ? (
                          <SelectItem value="loading" disabled>
                            Cargando cuentas...
                          </SelectItem>
                        ) : accounts.length === 0 ? (
                          <SelectItem value="no-accounts" disabled>
                            No hay cuentas disponibles
                          </SelectItem>
                        ) : (
                          accounts.map((account) => (
                            <SelectItem key={account.accountId} value={account.accountId}>
                              {account.accountName} - {formatCurrency(account.balance)}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.sourceAccountId && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.sourceAccountId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="targetAccountId">Cuenta Destino</Label>
                    <Select
                      value={targetAccountId}
                      onValueChange={(value) => form.setValue('targetAccountId', value)}
                      disabled={!sourceAccountId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona cuenta destino" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts
                          .filter(account => account.accountId !== sourceAccountId)
                          .map((account) => (
                            <SelectItem key={account.accountId} value={account.accountId}>
                              {account.accountName} - {formatCurrency(account.balance)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.targetAccountId && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.targetAccountId.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="amount">Monto</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="500"
                      placeholder="0.00"
                      className="pl-10"
                      {...form.register('amount', { valueAsNumber: true })}
                    />
                  </div>
                  {form.formState.errors.amount && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.amount.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="note">Descripción (Opcional)</Label>
                  <Input
                    id="note"
                    placeholder="Descripción de la transferencia"
                    maxLength={100}
                    {...form.register('note')}
                  />
                  {form.formState.errors.note && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.note.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || accountsLoading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight className="mr-2 h-4 w-4" />
                      Realizar Transferencia
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Transfer Info */}
        <div className="space-y-6">
          {/* Account Balances */}
          <Card>
            <CardHeader>
              <CardTitle>Saldo de Cuentas</CardTitle>
            </CardHeader>
            <CardContent>
              {accountsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-4">
                  <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hay cuentas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.accountId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {account.accountName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {account.accountType === 'CHECKING' ? 'Corriente' : 'Ahorros'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(account.balance)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transfer Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Límites de Transferencia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Límite diario
                  </span>
                  <span className="text-sm font-medium">
                    {formatCurrency(dailyLimit)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Restante hoy
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(remainingDailyLimit)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(remainingDailyLimit / dailyLimit) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Preview */}
          {(sourceAccount && targetAccount && amount > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Resumen de Transferencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Desde
                    </span>
                    <span className="text-sm font-medium">
                      {sourceAccount.accountName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Hacia
                    </span>
                    <span className="text-sm font-medium">
                      {targetAccount.accountName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Monto
                    </span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Saldo después
                      </span>
                      <span className="text-sm font-medium">
                        {formatCurrency(sourceAccount.balance - amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>• Todas las transferencias son seguras y encriptadas</p>
                <p>• Se requiere confirmación para completar</p>
                <p>• Los fondos se transfieren instantáneamente</p>
                <p>• Recibirás confirmación por email</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
