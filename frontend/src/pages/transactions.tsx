import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/skeleton'
import { ApiService } from '@/services/apiService'
import { AccountMapper } from '@/mappers/accountMapper'
import { TransactionMapper, Transaction } from '@/mappers/transactionMapper'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAppContext } from '@/components/AppInitializationProvider'
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter,
  Search,
  RefreshCw
} from 'lucide-react'

export function TransactionsPage() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [transactionType, setTransactionType] = useState<string>('all')
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

  // Obtener transacciones
  const { 
    data: transactionsData, 
    isLoading: transactionsLoading, 
    error: transactionsError,
    refetch: refetchTransactions 
  } = useQuery({
    queryKey: ['transactions', selectedAccountId, dateFrom, dateTo],
    queryFn: async () => {
      if (!selectedAccountId) return Promise.resolve({ transactions: [], count: 0, accountId: selectedAccountId, hasMore: false })
      const response = await apiService.getTransactions(selectedAccountId, {
        from: dateFrom || undefined,
        to: dateTo || undefined,
        limit: 50,
      });
      return TransactionMapper.toTransactionResponse(response);
    },
    enabled: !!selectedAccountId,
  })

  const transactions = transactionsData?.transactions || []
  const filteredTransactions = transactions.filter(transaction => {
    if (transactionType === 'all') return true
    return transaction.type.toLowerCase() === transactionType.toLowerCase()
  })

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId)
  }

  const handleClearFilters = () => {
    setDateFrom('')
    setDateTo('')
    setTransactionType('all')
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Movimientos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Historial de transacciones de tus cuentas
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetchTransactions()}
          disabled={transactionsLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${transactionsLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
          <CardDescription>
            Filtra las transacciones por cuenta, fecha y tipo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="account">Cuenta</Label>
              <Select value={selectedAccountId} onValueChange={handleAccountChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una cuenta" />
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
            </div>

            <div>
              <Label htmlFor="dateFrom">Desde</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Hasta</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="credit">Entradas</SelectItem>
                  <SelectItem value="debit">Salidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={handleClearFilters}>
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones</CardTitle>
          <CardDescription>
            {selectedAccountId 
              ? `${filteredTransactions.length} transacciones encontradas`
              : 'Selecciona una cuenta para ver las transacciones'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedAccountId ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Selecciona una cuenta
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Elige una cuenta para ver su historial de transacciones
              </p>
            </div>
          ) : transactionsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : transactionsError ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Error al cargar transacciones
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No se pudieron cargar las transacciones. Por favor, intenta de nuevo.
              </p>
              <Button onClick={() => refetchTransactions()}>
                Reintentar
              </Button>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay transacciones
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No se encontraron transacciones con los filtros aplicados
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <TransactionCard 
                  key={`${transaction.transferId}-${transaction.timestamp}`} 
                  transaction={transaction} 
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function TransactionCard({ transaction }: { transaction: Transaction }) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return <ArrowDownLeft className="h-5 w-5 text-green-600" />
      case 'DEBIT':
        return <ArrowUpRight className="h-5 w-5 text-red-600" />
      default:
        return <CreditCard className="h-5 w-5 text-gray-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return 'text-green-600 dark:text-green-400'
      case 'DEBIT':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return 'Entrada'
      case 'DEBIT':
        return 'Salida'
      default:
        return 'Transacción'
    }
  }

  const getAmountPrefix = (type: string) => {
    return type === 'CREDIT' ? '+' : '-'
  }

  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex-shrink-0">
        {getTransactionIcon(transaction.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {transaction.note}
          </p>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            transaction.type === 'CREDIT' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {getTransactionLabel(transaction.type)}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {transaction.createdAt ? formatDate(transaction.createdAt) : '-'}
        </p>
        {transaction.counterparty && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Cuenta: {transaction.counterparty.slice(0, 8)}...
          </p>
        )}
      </div>
      
      <div className="flex-shrink-0 text-right">
        <p className={`text-lg font-semibold ${getTransactionColor(transaction.type)}`}>
          {getAmountPrefix(transaction.type)}{formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {transaction.status === 'COMPLETED' ? 'Completada' : transaction.status}
        </p>
      </div>
    </div>
  )
}
