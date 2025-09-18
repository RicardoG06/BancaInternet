// Tipos de datos
export interface Account {
  accountId: string;
  customerId: string;
  balance: number;
  currency: string;
  accountType: 'CHECKING' | 'SAVINGS';
  accountName?: string; // Nombre descriptivo de la cuenta
  dailyTransferUsed: number;
  dailyTransferLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccountSummary {
  totalBalance: number;
  totalAccounts: number;
  dailyTransferUsed: number;
  dailyTransferLimit: number;
  remainingDailyLimit: number;
}

export interface AccountResponse {
  accounts: Account[];
  summary: AccountSummary;
  correlationId: string;
}

// Mapper para cuentas
export class AccountMapper {
  static toAccount(apiData: any): Account {
    return {
      accountId: apiData.accountId,
      customerId: apiData.customerId,
      balance: parseFloat(apiData.balance) || 0,
      currency: apiData.currency || 'USD',
      accountType: apiData.accountType || 'CHECKING',
      accountName: apiData.accountName || this.generateAccountName(apiData.accountType || 'CHECKING', apiData.accountId),
      dailyTransferUsed: parseFloat(apiData.dailyTransferUsed) || 0,
      dailyTransferLimit: parseFloat(apiData.dailyTransferLimit) || 500,
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt,
    };
  }

  static toAccountSummary(apiData: any): AccountSummary {
    return {
      totalBalance: parseFloat(apiData.totalBalance) || 0,
      totalAccounts: parseInt(apiData.totalAccounts) || 0,
      dailyTransferUsed: parseFloat(apiData.dailyTransferUsed) || 0,
      dailyTransferLimit: parseFloat(apiData.dailyTransferLimit) || 500,
      remainingDailyLimit: parseFloat(apiData.remainingDailyLimit) || 500,
    };
  }

  static toAccountResponse(apiData: any): AccountResponse {
    return {
      accounts: (apiData.accounts || []).map((account: any) => this.toAccount(account)),
      summary: this.toAccountSummary(apiData.summary || {}),
      correlationId: apiData.correlationId || '',
    };
  }

  // Utilidades para formateo
  static formatBalance(balance: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(balance);
  }

  static formatAccountType(accountType: string): string {
    const types: Record<string, string> = {
      'CHECKING': 'Cuenta Corriente',
      'SAVINGS': 'Cuenta de Ahorros',
    };
    return types[accountType] || accountType;
  }

  static getAccountIcon(accountType: string): string {
    const icons: Record<string, string> = {
      'CHECKING': '💳',
      'SAVINGS': '💰',
    };
    return icons[accountType] || '🏦';
  }

  static getAccountColor(accountType: string): string {
    const colors: Record<string, string> = {
      'CHECKING': 'text-blue-600',
      'SAVINGS': 'text-green-600',
    };
    return colors[accountType] || 'text-gray-600';
  }

  static generateAccountName(accountType: string, accountId: string): string {
    const typeNames: Record<string, string> = {
      'CHECKING': 'Cuenta Corriente',
      'SAVINGS': 'Cuenta de Ahorros',
    };
    const shortId = accountId.substring(accountId.length - 4);
    return `${typeNames[accountType] || 'Cuenta'} ****${shortId}`;
  }
}
