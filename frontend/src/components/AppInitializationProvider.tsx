import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAppInitialization } from '../hooks/useAppInitialization';
import { BancaInternetConfig } from '../config/config-env';
import { useAuthStore } from '../lib/stores/authStore';
import { initializeApiService } from '../services/apiService';

interface AppContextType {
  config: BancaInternetConfig | null;
  isInitialized: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppInitializationProviderProps {
  children: ReactNode;
}

export function AppInitializationProvider({ children }: AppInitializationProviderProps) {
  const environment = import.meta.env.VITE_ENVIRONMENT || 'dev';
  const { isInitialized, config, error } = useAppInitialization(environment);
  const { initializeAuth } = useAuthStore();

  // Inicializar autenticación y API service cuando la app esté lista
  useEffect(() => {
    if (isInitialized && config) {
      initializeAuth();
      initializeApiService(config);
    }
  }, [isInitialized, config, initializeAuth]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Error de Inicialización</h3>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Inicializando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ config, isInitialized, error }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppInitializationProvider');
  }
  return context;
}
