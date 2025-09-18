// Constantes de la aplicación
export const APP_CONFIG = {
  name: 'Banca por Internet',
  version: '1.0.0',
  description: 'Demo funcional de aplicación bancaria moderna',
  currency: 'USD',
  locale: 'es-EC',
  timezone: 'America/Guayaquil',
} as const

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 30000, // 30 segundos
  retryAttempts: 3,
} as const

export const AUTH_CONFIG = {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  domain: import.meta.env.VITE_COGNITO_DOMAIN,
} as const

export const TRANSFER_LIMITS = {
  dailyLimit: 500, // USD
  minAmount: 0.01, // USD
  maxAmount: 500, // USD
  maxNoteLength: 100,
} as const

export const PAGINATION = {
  defaultLimit: 50,
  maxLimit: 100,
} as const

export const THEME_CONFIG = {
  defaultTheme: 'system',
  storageKey: 'banca-theme',
} as const

export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  transactions: '/transactions',
  transfer: '/transfer',
  profile: '/profile',
} as const

export const ACCOUNT_TYPES = {
  CHECKING: 'Cuenta Corriente',
  SAVINGS: 'Cuenta de Ahorros',
} as const

export const TRANSACTION_TYPES = {
  DEBIT: 'Salida',
  CREDIT: 'Entrada',
} as const

export const TRANSACTION_STATUS = {
  COMPLETED: 'Completada',
  FAILED: 'Fallida',
  PENDING: 'Pendiente',
} as const
