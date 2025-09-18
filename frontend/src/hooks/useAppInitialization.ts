import { useEffect, useState } from 'react';
import { BancaInternetConfig, getConfig } from '../config/config-env';

interface AppInitializationState {
  isInitialized: boolean;
  config: BancaInternetConfig | null;
  error: string | null;
}

export function useAppInitialization(environment: string = 'dev') {
  const [state, setState] = useState<AppInitializationState>({
    isInitialized: false,
    config: null,
    error: null,
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Obtener configuración basada en el ambiente
        const config = getConfig(environment);

        // Validar configuración requerida
        if (!config.cognito.userPoolId || !config.cognito.userPoolClientId) {
          throw new Error('Configuración de Cognito incompleta. Verifica las variables de entorno.');
        }

        // Configurar Amplify si está disponible
        if (typeof window !== 'undefined' && (window as any).Amplify) {
          try {
            (window as any).Amplify.configure({
              Auth: {
                Cognito: {
                  userPoolId: config.cognito.userPoolId,
                  userPoolClientId: config.cognito.userPoolClientId,
                  loginWith: {
                    oauth: {
                      domain: `${config.cognito.domain}.auth.${config.region}.amazoncognito.com`,
                      scopes: ['openid', 'email', 'profile'],
                      redirectSignIn: [window.location.origin],
                      redirectSignOut: [window.location.origin],
                      responseType: 'code',
                    },
                    email: true,
                  },
                },
              },
            });
          } catch (amplifyError) {
            console.warn('Error configurando Amplify:', amplifyError);
            // Continuar sin Amplify si hay error
          }
        }

        // Configurar tema si está habilitado
        if (config.features.darkModeEnabled) {
          const savedTheme = localStorage.getItem('theme');
          const theme = savedTheme || config.ui.theme;
          
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else if (theme === 'light') {
            document.documentElement.classList.remove('dark');
          } else {
            // Sistema - seguir preferencia del sistema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        }

        // Configurar idioma
        if (config.ui.language) {
          document.documentElement.lang = config.ui.language;
        }

        setState({
          isInitialized: true,
          config,
          error: null,
        });

        console.log(`Aplicación inicializada para ambiente: ${environment}`);
      } catch (error) {
        console.error('Error inicializando aplicación:', error);
        setState({
          isInitialized: false,
          config: null,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    };

    initializeApp();
  }, [environment]);

  return state;
}
