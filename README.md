# 🏦 Banca por Internet - Micro-POV

Una demostración funcional de una aplicación bancaria moderna construida con AWS CDK, React y TypeScript.

## 🎯 Objetivo

Este proyecto es una **micro-POV (Proof of Value)** que demuestra las capacidades de una aplicación bancaria moderna con:

- ✅ **Autenticación segura** con Amazon Cognito
- ✅ **API REST** con AWS Lambda y API Gateway  
- ✅ **Base de datos** con DynamoDB
- ✅ **Frontend moderno** con React + TypeScript
- ✅ **Transferencias bancarias** con validación y idempotencia
- ✅ **Monitoreo** con CloudWatch

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Lambda        │
│   React + TS    │◄──►│   REST API      │◄──►│   Functions     │
│   Vite + Tailwind│    │   JWT Auth      │    │   Node.js 18+   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   DynamoDB      │
                       │   - Accounts    │
                       │   - Transactions│
                       │   - Users       │
                       │   - Idempotency │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Cognito       │
                       │   - User Pool   │
                       │   - Triggers    │
                       │   - Auto-confirm│
                       └─────────────────┘
```

## 🚀 Despliegue Rápido

### Prerrequisitos

- Node.js 18+
- AWS CLI configurado
- CDK CLI instalado (`npm install -g aws-cdk`)
- Perfil AWS `bancainternet` configurado

### 1. Clonar y Configurar

```bash
git clone <repository>
cd BancaInternet
npm install
```

### 2. Desplegar Backend

```bash
./scripts/deploy-backend.sh dev
```

Este script:
- ✅ Instala dependencias
- ✅ Hace CDK Bootstrap
- ✅ Despliega toda la infraestructura
- ✅ Actualiza el `.env` del frontend

### 3. Iniciar Frontend

```bash
./scripts/dev-frontend.sh dev
```

El frontend estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
BancaInternet/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── features/        # Funcionalidades por dominio
│   │   ├── components/      # Componentes reutilizables
│   │   ├── services/        # Servicios de API
│   │   └── lib/            # Utilidades y stores
│   └── .env                # Variables de entorno (generado automáticamente)
├── infra/                   # AWS CDK Infrastructure
│   ├── lib/
│   │   ├── constructs/     # Constructs modulares
│   │   └── stacks/         # Stacks principales
│   ├── src/lambdas/        # Funciones Lambda
│   └── config/             # Configuración por ambiente
└── scripts/                # Scripts de despliegue
```

## 🔧 Funcionalidades Implementadas

### 🔐 Autenticación (Cognito)
- **Registro de usuarios** con auto-confirmación
- **Login/Logout** con JWT tokens
- **Triggers personalizados**:
  - `pre-signup`: Auto-confirma usuarios
  - `post-confirmation`: Crea perfil en DynamoDB
- **Tabla de usuarios** para perfiles personalizados

### 💰 Transferencias Bancarias
- **Validación de fondos** y límites diarios
- **Idempotencia** con UUID para evitar duplicados
- **Transacciones atómicas** en DynamoDB
- **Historial completo** de movimientos

### 📊 API REST
- `GET /v1/accounts` - Obtener cuentas del usuario
- `GET /v1/accounts/{id}/transactions` - Historial de transacciones
- `POST /v1/transfers` - Realizar transferencias
- `POST /v1/seed` - Crear datos de ejemplo

### 🎨 Frontend Moderno
- **Dashboard** con resumen de cuentas
- **Transferencias** con validación en tiempo real
- **Historial** con filtros y paginación
- **Perfil de usuario** con gestión de datos
- **UI/UX moderna** con TailwindCSS + shadcn/ui

## 🌍 Ambientes

El proyecto soporta múltiples ambientes:

- **`dev`** - Desarrollo (por defecto)
- **`beta`** - Pruebas
- **`prod`** - Producción

Configuración por ambiente en `infra/config/`:
- `dev.json` - Configuración de desarrollo
- `beta.json` - Configuración de pruebas  
- `prod.json` - Configuración de producción

## 📝 Notas de Diseño

### 🎯 Micro-POV vs Producción

Este es un **micro-POV** optimizado para demostración:

- ✅ **Funcionalidad completa** de banca básica
- ✅ **Arquitectura escalable** con AWS
- ✅ **Código limpio** y bien estructurado
- ✅ **Seguridad** con mejores prácticas
- ⚠️ **Hosting simplificado** - Sin CloudFront/S3 (se usará Amplify manualmente)
- ⚠️ **Configuración básica** - Sin CI/CD avanzado

### 🔄 Próximos Pasos (Post-POV)

Para producción se recomienda:

1. **Hosting con Amplify** - Configuración manual para mejor control
2. **CI/CD Pipeline** - GitHub Actions o AWS CodePipeline
3. **Monitoreo avanzado** - X-Ray, CloudWatch Insights
4. **Seguridad adicional** - WAF, Shield, Secrets Manager
5. **Backup y DR** - Cross-region replication
6. **Testing automatizado** - Unit tests, E2E tests

## 🛠️ Comandos Útiles

```bash
# Desplegar backend
./scripts/deploy-backend.sh dev

# Iniciar frontend
./scripts/dev-frontend.sh dev

# Ver logs de Lambda
aws logs tail /aws/lambda/banca-internet-dev-transfer --follow --profile bancainternet

# Verificar recursos desplegados
aws cloudformation describe-stacks --stack-name BancaInternet-dev --profile bancainternet
```

## 📚 Recursos Adicionales

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [React + Vite Documentation](https://vitejs.dev/guide/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

## 🤝 Contribución

Este es un proyecto de demostración. Para contribuciones:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es para fines de demostración y aprendizaje.