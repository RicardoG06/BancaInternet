// Tipos de datos
export interface Transaction {
  accountId: string;
  timestamp: string;
  createdAt?: string; // Fecha de creación (alias de timestamp)
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  counterparty: string;
  transferId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  note?: string;
}

export interface TransactionSummary {
  totalTransactions: number;
  totalDebits: number;
  totalCredits: number;
  completedTransactions: number;
  failedTransactions: number;
  netAmount: number;
}

export interface TransactionResponse {
  accountId: string;
  transactions: Transaction[];
  summary: TransactionSummary;
  pagination: {
    limit: number;
    hasMore: boolean;
  };
  correlationId: string;
}

// Mapper para transacciones
export class TransactionMapper {
  static toTransaction(apiData: any): Transaction {
    return {
      accountId: apiData.accountId,
      timestamp: apiData.timestamp,
      createdAt: apiData.createdAt || apiData.timestamp,
      type: apiData.type,
      amount: parseFloat(apiData.amount) || 0,
      counterparty: apiData.counterparty,
      transferId: apiData.transferId,
      status: apiData.status,
      note: apiData.note,
    };
  }

  static toTransactionSummary(apiData: any): TransactionSummary {
    return {
      totalTransactions: parseInt(apiData.totalTransactions) || 0,
      totalDebits: parseFloat(apiData.totalDebits) || 0,
      totalCredits: parseFloat(apiData.totalCredits) || 0,
      completedTransactions: parseInt(apiData.completedTransactions) || 0,
      failedTransactions: parseInt(apiData.failedTransactions) || 0,
      netAmount: parseFloat(apiData.netAmount) || 0,
    };
  }

  static toTransactionResponse(apiData: any): TransactionResponse {
    return {
      accountId: apiData.accountId,
      transactions: (apiData.transactions || []).map((transaction: any) => this.toTransaction(transaction)),
      summary: this.toTransactionSummary(apiData.summary || {}),
      pagination: {
        limit: parseInt(apiData.pagination?.limit) || 50,
        hasMore: Boolean(apiData.pagination?.hasMore),
      },
      correlationId: apiData.correlationId || '',
    };
  }

  // Utilidades para formateo
  static formatAmount(amount: number, currency: string = 'USD'): string {
    const absAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(absAmount);

    return amount < 0 ? `-${formatted}` : `+${formatted}`;
  }

  static formatTransactionType(type: string): string {
    const types: Record<string, string> = {
      'DEBIT': 'Débito',
      'CREDIT': 'Crédito',
    };
    return types[type] || type;
  }

  static formatStatus(status: string): string {
    const statuses: Record<string, string> = {
      'PENDING': 'Pendiente',
      'COMPLETED': 'Completada',
      'FAILED': 'Fallida',
    };
    return statuses[status] || status;
  }

  static getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'PENDING': 'text-yellow-600',
      'COMPLETED': 'text-green-600',
      'FAILED': 'text-red-600',
    };
    return colors[status] || 'text-gray-600';
  }

  static getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'PENDING': '⏳',
      'COMPLETED': '✅',
      'FAILED': '❌',
    };
    return icons[status] || '❓';
  }

  static formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  static formatRelativeDate(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Hoy';
    } else if (diffInDays === 1) {
      return 'Ayer';
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else {
      return this.formatDate(timestamp);
    }
  }

  static getTransactionIcon(type: string): string {
    const icons: Record<string, string> = {
      'DEBIT': '📤',
      'CREDIT': '📥',
    };
    return icons[type] || '💸';
  }

  static getAmountColor(amount: number): string {
    if (amount > 0) {
      return 'text-green-600';
    } else if (amount < 0) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  }
}
