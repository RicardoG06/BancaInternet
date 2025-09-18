import { BancaInternetConfig } from '../config/config-env';
import { cognitoAuth } from './cognitoService';

export class ApiService {
  private config: BancaInternetConfig;
  private baseUrl: string;

  constructor(config: BancaInternetConfig) {
    this.config = config;
    this.baseUrl = config.apiBaseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Environment': this.config.environment,
    };

    // Obtener token JWT de Cognito
    try {
      const token = await cognitoAuth.getJwtToken();
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('No se pudo obtener token JWT:', error);
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }


  // Métodos de autenticación
  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async refreshToken() {
    return this.request('/auth/refresh', { method: 'POST' });
  }

  // Métodos de cuentas
  async getAccounts() {
    return this.request('/v1/accounts');
  }

  async getAccountDetails(accountId: string) {
    return this.request(`/v1/accounts/${accountId}`);
  }

  // Métodos de transacciones
  async getTransactions(accountId: string, params?: {
    from?: string;
    to?: string;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.from) queryParams.append('from', params.from);
    if (params?.to) queryParams.append('to', params.to);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/v1/accounts/${accountId}/transactions${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  // Métodos de transferencias
  async createTransfer(data: {
    sourceAccountId: string;
    targetAccountId: string;
    amount: number;
    note?: string;
    idempotencyKey?: string;
  }) {
    return this.request('/v1/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransferStatus(transferId: string) {
    return this.request(`/v1/transfers/${transferId}`);
  }

  // Métodos de datos de ejemplo
  async createSeedData() {
    return this.request('/v1/seed', {
      method: 'POST',
    });
  }

  // Métodos de perfil
  async getProfile() {
    return this.request('/v1/profile');
  }

  // Métodos de utilidad
  async healthCheck() {
    return this.request('/health');
  }

  // Métodos de utilidad para manejo de tokens (ya no necesarios con Cognito)
  // Los tokens JWT se manejan automáticamente por Cognito
}

// Instancia global del ApiService (se inicializará en AppInitializationProvider)
let apiServiceInstance: ApiService | null = null;

export const initializeApiService = (config: BancaInternetConfig) => {
  apiServiceInstance = new ApiService(config);
  return apiServiceInstance;
};

export const getApiService = (): ApiService => {
  if (!apiServiceInstance) {
    throw new Error('ApiService no ha sido inicializado. Asegúrate de que AppInitializationProvider esté configurado correctamente.');
  }
  return apiServiceInstance;
};

// Exportar la instancia para compatibilidad
export { apiServiceInstance as apiService };
