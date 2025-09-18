export interface BancaInternetConfig {
  // Configuración básica
  environment: string;
  apiBaseUrl: string;
  region: string;
  
  // Configuración de Cognito
  cognito: {
    userPoolId: string;
    userPoolClientId: string;
    domain: string;
    identityPoolId?: string;
  };
  
  // Configuración de la aplicación
  app: {
    name: string;
    version: string;
    description: string;
  };
  
  // Configuración de features
  features: {
    mfaEnabled: boolean;
    darkModeEnabled: boolean;
    notificationsEnabled: boolean;
  };
  
  // Configuración de transferencias
  transfers: {
    dailyLimit: number;
    minAmount: number;
    maxAmount: number;
  };
  
  // Configuración de UI
  ui: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    currency: string;
  };
}

export function getConfig(environment: string): BancaInternetConfig {
  const baseConfig: Partial<BancaInternetConfig> = {
    app: {
      name: 'Banca por Internet',
      version: '1.0.0',
      description: 'Aplicación de banca por internet',
    },
    features: {
      mfaEnabled: true,
      darkModeEnabled: true,
      notificationsEnabled: true,
    },
    transfers: {
      dailyLimit: 500,
      minAmount: 0.01,
      maxAmount: 500,
    },
    ui: {
      theme: 'system',
      language: 'es',
      currency: 'USD',
    },
  };

  switch (environment) {
    case 'dev':
      return {
        ...baseConfig,
        environment: 'dev',
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
        cognito: {
          userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
          userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID || '',
          domain: import.meta.env.VITE_COGNITO_DOMAIN || '',
          identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID || '',
        },
        features: {
          ...baseConfig.features!,
          mfaEnabled: false, // Deshabilitado en desarrollo
        },
        transfers: {
          dailyLimit: 100,
          minAmount: 0.01,
          maxAmount: 100,
        },
      } as BancaInternetConfig;

    case 'beta':
      return {
        ...baseConfig,
        environment: 'beta',
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api-beta.bancainternet.com',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
        cognito: {
          userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
          userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID || '',
          domain: import.meta.env.VITE_COGNITO_DOMAIN || '',
          identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID || '',
        },
        transfers: {
          dailyLimit: 250,
          minAmount: 0.01,
          maxAmount: 250,
        },
      } as BancaInternetConfig;

    case 'prod':
      return {
        ...baseConfig,
        environment: 'prod',
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.bancainternet.com',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
        cognito: {
          userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
          userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID || '',
          domain: import.meta.env.VITE_COGNITO_DOMAIN || '',
          identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID || '',
        },
        transfers: {
          dailyLimit: 500,
          minAmount: 0.01,
          maxAmount: 500,
        },
      } as BancaInternetConfig;

    default:
      return {
        ...baseConfig,
        environment: 'dev',
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
        cognito: {
          userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
          userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID || '',
          domain: import.meta.env.VITE_COGNITO_DOMAIN || '',
          identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID || '',
        },
      } as BancaInternetConfig;
  }
}
