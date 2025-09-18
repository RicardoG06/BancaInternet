export interface BancaInternetConfig {
  // Configuración básica
  projectName: string;
  environment: string;
  region: string;
  accountId: string;
  
  // Configuración de Cognito
  cognito: {
    domainPrefix: string;
    emailFrom: string;
    mfaEnabled: boolean;
  };
  
  // Configuración de API
  api: {
    stage: string;
    description: string;
    corsOrigins: string[];
  };
  
  // Configuración de DynamoDB
  dynamodb: {
    accountsTableName: string;
    transactionsTableName: string;
    idempotencyTableName: string;
    usersTableName: string;
  };
  
  // Configuración de transferencias
  transfers: {
    dailyLimit: number;
    minAmount: number;
    maxAmount: number;
  };
  
  // Configuración de monitoreo
  monitoring: {
    logRetentionDays: number;
    alarmThresholdErrors: number;
    alarmThresholdLatency: number;
  };
  
  // Configuración de frontend
  frontend: {
    url: string;
    domain: string;
  };
}

export function getConfig(environment: string): BancaInternetConfig {
  const baseConfig: Partial<BancaInternetConfig> = {
    projectName: 'banca-internet',
    region: process.env.AWS_REGION || 'us-east-1',
    accountId: process.env.AWS_ACCOUNT_ID || process.env.CDK_DEFAULT_ACCOUNT || '',
    cognito: {
      domainPrefix: 'banca-internet-demo',
      emailFrom: 'noreply@bancainternet.com',
      mfaEnabled: true,
    },
    api: {
      stage: 'prod',
      description: 'Banca por Internet API',
      corsOrigins: ['http://localhost:5173', 'https://localhost:5173', 'http://localhost:5174', 'https://localhost:5174', 'http://localhost:3000', 'https://localhost:3000'],
    },
    dynamodb: {
      accountsTableName: 'banca-accounts',
      transactionsTableName: 'banca-transactions',
      idempotencyTableName: 'banca-idempotency',
      usersTableName: 'banca-users',
    },
    transfers: {
      dailyLimit: 500,
      minAmount: 0.01,
      maxAmount: 500,
    },
    monitoring: {
      logRetentionDays: 30,
      alarmThresholdErrors: 10,
      alarmThresholdLatency: 2000,
    },
    frontend: {
      url: 'http://localhost:5173',
      domain: 'localhost:5173',
    },
  };

  switch (environment) {
    case 'dev':
      return {
        ...baseConfig,
        environment: 'dev',
        cognito: {
          ...baseConfig.cognito!,
          domainPrefix: 'banca-internet-dev',
        },
        api: {
          ...baseConfig.api!,
          stage: 'dev',
        },
        dynamodb: {
          accountsTableName: 'banca-accounts-dev',
          transactionsTableName: 'banca-transactions-dev',
          idempotencyTableName: 'banca-idempotency-dev',
          usersTableName: 'banca-users-dev',
        },
      } as BancaInternetConfig;

    case 'beta':
      return {
        ...baseConfig,
        environment: 'beta',
        cognito: {
          ...baseConfig.cognito!,
          domainPrefix: 'banca-internet-beta',
        },
        api: {
          ...baseConfig.api!,
          stage: 'beta',
        },
        dynamodb: {
          accountsTableName: 'banca-accounts-beta',
          transactionsTableName: 'banca-transactions-beta',
          idempotencyTableName: 'banca-idempotency-beta',
          usersTableName: 'banca-users-beta',
        },
      } as BancaInternetConfig;

    case 'prod':
      return {
        ...baseConfig,
        environment: 'prod',
        cognito: {
          ...baseConfig.cognito!,
          domainPrefix: 'banca-internet-prod',
        },
        api: {
          ...baseConfig.api!,
          stage: 'prod',
        },
        dynamodb: {
          accountsTableName: 'banca-accounts-prod',
          transactionsTableName: 'banca-transactions-prod',
          idempotencyTableName: 'banca-idempotency-prod',
          usersTableName: 'banca-users-prod',
        },
        monitoring: {
          logRetentionDays: 90,
          alarmThresholdErrors: 5,
          alarmThresholdLatency: 1000,
        },
      } as BancaInternetConfig;

    default:
      return {
        ...baseConfig,
        environment: 'demo',
      } as BancaInternetConfig;
  }
}
