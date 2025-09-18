import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/skeleton'
import { ApiService } from '@/services/apiService'
import { AccountMapper, Account } from '@/mappers/accountMapper'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { useAppContext } from '@/components/AppInitializationProvider'
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp,
  DollarSign,
  Plus,
  Eye,
  RefreshCw,
  Database
} from 'lucide-react'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function DashboardPage() {
  const { config } = useAppContext();
  const apiService = new ApiService(config!);
  const queryClient = useQueryClient();

  const { data: accountsData, isLoading: accountsLoading, error: accountsError } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await apiService.getAccounts();
      return AccountMapper.toAccountResponse(response);
    },
  })

  // Mutación para cargar datos de ejemplo adicionales
  const seedDataMutation = useMutation({
    mutationFn: async () => {
      return await apiService.createSeedData();
    },
    onSuccess: () => {
      toast.success('Datos de ejemplo cargados exitosamente');
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al cargar datos de ejemplo');
    },
  })

  const accounts = accountsData?.accounts || []

  // Generar datos de ejemplo para el gráfico (últimos 30 días)
  const generateChartData = () => {
    const data = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Simular saldo fluctuante
      const baseBalance = 5000
      const variation = Math.sin(i / 5) * 500 + Math.random() * 200 - 100
      const balance = Math.max(0, baseBalance + variation)
      
      data.push({
        date: formatDateShort(date),
        balance: Math.round(balance),
      })
    }
    
    return data
  }

  const chartData = generateChartData()

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  const checkingAccounts = accounts.filter(account => account.accountType === 'CHECKING')
  const savingsAccounts = accounts.filter(account => account.accountType === 'SAVINGS')

  if (accountsError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error al cargar los datos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No se pudieron cargar las cuentas. Por favor, intenta de nuevo.
          </p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Resumen de tus cuentas y movimientos
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['accounts'] })}
            disabled={accountsLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => seedDataMutation.mutate()}
            disabled={seedDataMutation.isPending}
          >
            {seedDataMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Cargar Datos Demo
          </Button>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" asChild>
            <Link to="/transactions">
              <Eye className="h-4 w-4 mr-2" />
              Ver Movimientos
            </Link>
          </Button>
          <Button asChild>
            <Link to="/transfer">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Transferencia
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {accounts.length} cuenta{accounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuenta Corriente</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(checkingAccounts.reduce((sum, acc) => sum + acc.balance, 0))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {checkingAccounts.length} cuenta{checkingAccounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuenta de Ahorros</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {savingsAccounts.length} cuenta{savingsAccounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimientos</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evolución del Saldo</CardTitle>
            <CardDescription>
              Últimos 30 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Saldo']}
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Accounts List */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Cuentas</CardTitle>
            <CardDescription>
              Resumen de todas tus cuentas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accountsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="ml-auto">
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))
              ) : accounts.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No tienes cuentas
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Crea datos de ejemplo para comenzar
                  </p>
                  <Button variant="outline" size="sm">
                    Crear Datos de Ejemplo
                  </Button>
                </div>
              ) : (
                accounts.map((account) => (
                  <AccountCard key={account.accountId} account={account} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Operaciones más comunes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
              <Link to="/transfer">
                <ArrowUpRight className="h-6 w-6" />
                <span>Transferir</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
              <Link to="/transactions">
                <ArrowDownLeft className="h-6 w-6" />
                <span>Ver Movimientos</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
              <Link to="/profile">
                <CreditCard className="h-6 w-6" />
                <span>Gestionar Cuentas</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AccountCard({ account }: { account: Account }) {
  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'CHECKING':
        return <CreditCard className="h-6 w-6 text-blue-600" />
      case 'SAVINGS':
        return <TrendingUp className="h-6 w-6 text-green-600" />
      default:
        return <CreditCard className="h-6 w-6 text-gray-600" />
    }
  }

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'CHECKING':
        return 'Cuenta Corriente'
      case 'SAVINGS':
        return 'Cuenta de Ahorros'
      default:
        return 'Cuenta'
    }
  }

  return (
    <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex-shrink-0">
        {getAccountIcon(account.accountType)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {account.accountName}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {getAccountTypeLabel(account.accountType)}
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {formatCurrency(account.balance)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {account.currency}
        </p>
      </div>
    </div>
  )
}
