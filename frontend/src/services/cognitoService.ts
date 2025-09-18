import { Amplify } from 'aws-amplify';
import { Auth } from 'aws-amplify';

// Configuración de Amplify
export const configureAmplify = () => {
  const config = {
    Auth: {
      region: import.meta.env.VITE_AWS_REGION,
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolWebClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
      authenticationFlowType: 'USER_SRP_AUTH',
    },
  };

  Amplify.configure(config);
};

// Interfaces para tipos
export interface CognitoUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Servicio de autenticación con Cognito
export class CognitoAuthService {
  private static instance: CognitoAuthService;

  private constructor() {
    configureAmplify();
  }

  public static getInstance(): CognitoAuthService {
    if (!CognitoAuthService.instance) {
      CognitoAuthService.instance = new CognitoAuthService();
    }
    return CognitoAuthService.instance;
  }

  // Registro de usuario
  async signUp(data: RegisterData): Promise<{ user: CognitoUser; needsConfirmation: boolean }> {
    try {
      const { user } = await Auth.signUp({
        username: data.email,
        password: data.password,
        attributes: {
          email: data.email,
          given_name: data.firstName,
          family_name: data.lastName,
        },
      });

      const cognitoUser: CognitoUser = {
        id: user.getUsername(),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        emailVerified: false,
        mfaEnabled: false,
      };

      return {
        user: cognitoUser,
        needsConfirmation: !(user as any).userConfirmed,
      };
    } catch (error: any) {
      console.error('Error en signUp:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Confirmar registro (si es necesario)
  async confirmSignUp(email: string, code: string): Promise<void> {
    try {
      await Auth.confirmSignUp(email, code);
    } catch (error: any) {
      console.error('Error en confirmSignUp:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Reenviar código de confirmación
  async resendSignUp(email: string): Promise<void> {
    try {
      await Auth.resendSignUp(email);
    } catch (error: any) {
      console.error('Error en resendSignUp:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Iniciar sesión
  async signIn(email: string, password: string): Promise<CognitoUser> {
    try {
      const user = await Auth.signIn(email, password);
      
      const cognitoUser: CognitoUser = {
        id: user.attributes.sub,
        email: user.attributes.email,
        firstName: user.attributes.given_name,
        lastName: user.attributes.family_name,
        emailVerified: user.attributes.email_verified,
        mfaEnabled: user.preferredMFA !== 'NOMFA',
      };

      return cognitoUser;
    } catch (error: any) {
      console.error('Error en signIn:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Cerrar sesión
  async signOut(): Promise<void> {
    try {
      await Auth.signOut();
    } catch (error: any) {
      console.error('Error en signOut:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Obtener usuario actual
  async getCurrentUser(): Promise<CognitoUser | null> {
    try {
      const user = await Auth.currentAuthenticatedUser();
      
      if (!user) {
        return null;
      }

      return {
        id: user.attributes.sub,
        email: user.attributes.email,
        firstName: user.attributes.given_name,
        lastName: user.attributes.family_name,
        emailVerified: user.attributes.email_verified,
        mfaEnabled: user.preferredMFA !== 'NOMFA',
      };
    } catch (error: any) {
      console.log('No hay usuario autenticado:', error.message);
      return null;
    }
  }

  // Obtener token JWT para APIs
  async getJwtToken(): Promise<string | null> {
    try {
      const session = await Auth.currentSession();
      return session.getIdToken().getJwtToken();
    } catch (error: any) {
      console.error('Error obteniendo token JWT:', error);
      return null;
    }
  }

  // Verificar si el usuario está autenticado
  async isAuthenticated(): Promise<boolean> {
    try {
      await Auth.currentAuthenticatedUser();
      return true;
    } catch (error: any) {
      return false;
    }
  }

  // Cambiar contraseña
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await Auth.currentAuthenticatedUser();
      await Auth.changePassword(user, oldPassword, newPassword);
    } catch (error: any) {
      console.error('Error en changePassword:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Resetear contraseña
  async forgotPassword(email: string): Promise<void> {
    try {
      await Auth.forgotPassword(email);
    } catch (error: any) {
      console.error('Error en forgotPassword:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Confirmar nueva contraseña
  async forgotPasswordSubmit(email: string, code: string, newPassword: string): Promise<void> {
    try {
      await Auth.forgotPasswordSubmit(email, code, newPassword);
    } catch (error: any) {
      console.error('Error en forgotPasswordSubmit:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Manejar errores de Cognito
  private getErrorMessage(error: any): string {
    if (error.code) {
      switch (error.code) {
        case 'UsernameExistsException':
          return 'El usuario ya existe con este email';
        case 'NotAuthorizedException':
          return 'Credenciales incorrectas';
        case 'UserNotConfirmedException':
          return 'El usuario no está confirmado. Por favor verifica tu email';
        case 'InvalidPasswordException':
          return 'La contraseña no cumple con los requisitos de seguridad';
        case 'InvalidParameterException':
          return 'Parámetros inválidos';
        case 'TooManyRequestsException':
          return 'Demasiados intentos. Intenta más tarde';
        case 'LimitExceededException':
          return 'Límite de intentos excedido';
        case 'CodeMismatchException':
          return 'Código de verificación incorrecto';
        case 'ExpiredCodeException':
          return 'El código de verificación ha expirado';
        case 'InvalidUserPoolConfigurationException':
          return 'Configuración del pool de usuarios inválida';
        default:
          return error.message || 'Error de autenticación';
      }
    }
    return error.message || 'Error desconocido';
  }
}

// Instancia singleton
export const cognitoAuth = CognitoAuthService.getInstance();
