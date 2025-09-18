# 🏦 Banca por Internet - Micro-POV

Una demostración funcional completa de una aplicación bancaria moderna construida con AWS CDK, React, TypeScript y Python.

## 🎯 Objetivo

Este proyecto es una **micro-POV (Proof of Value)** que demuestra las capacidades de una aplicación bancaria moderna con:

- ✅ **Autenticación real** con Amazon Cognito + JWT
- ✅ **API REST completa** con AWS Lambda (Python) y API Gateway  
- ✅ **Base de datos real** con DynamoDB (4 tablas)
- ✅ **Frontend moderno** con React + TypeScript + Vite
- ✅ **Transferencias bancarias** con validación, idempotencia y límites
- ✅ **Perfil de usuario** con datos reales desde DynamoDB
- ✅ **Monitoreo** con CloudWatch + Alarmas
- ✅ **Datos automáticos** - Cuentas y transacciones al registrarse

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Lambda        │
│   React + TS    │◄──►│   REST API      │◄──►│   Functions     │
│   Vite + Tailwind│    │   JWT Auth      │    │   Python 3.11  │
│   + shadcn/ui   │    │   CORS Enabled  │    │   + boto3       │
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
                       │   - Post-confirm│
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   CloudWatch    │
                       │   - Logs        │
                       │   - Metrics     │
                       │   - Alarms      │
                       └─────────────────┘
```

## 🚀 Despliegue Completo desde Cero

### Prerrequisitos

- **Node.js 18+** y npm
- **Python 3.11+** (para Lambdas)
- **AWS CLI** configurado con credenciales
- **CDK CLI** instalado: `npm install -g aws-cdk`
- **Git** para clonar el repositorio

### 1. Configuración Inicial

#### 1.1 Clonar el Repositorio
```bash
git clone <repository-url>
cd BancaInternet
```

#### 1.2 Configurar AWS CLI
```bash
# Crear perfil AWS (recomendado)
aws configure --profile bancainternet

# O usar credenciales por defecto
aws configure
```

#### 1.3 Verificar CDK
```bash
cdk --version
# Debe mostrar: 2.100.0 o superior
```

### 2. Configurar Variables de Entorno

#### 2.1 Backend (infra)
```bash
cd infra
cp env.example .env
```

Editar `.env` con tus valores:
```bash
# infra/.env
AWS_ACCOUNT_ID=123456789012
AWS_REGION=us-east-1
ENVIRONMENT=dev
```

#### 2.2 Frontend (se genera automáticamente)
El archivo `.env` del frontend se genera automáticamente después del despliegue del backend.

### 3. Desplegar Backend (Infraestructura)

#### 3.1 Instalar Dependencias
```bash
cd infra
npm install
```

#### 3.2 Bootstrap CDK (solo la primera vez)
```bash
cdk bootstrap --profile bancainternet
```

#### 3.3 Desplegar Infraestructura
```bash
cdk deploy --profile bancainternet --require-approval never
```

**Esto creará:**
- ✅ Cognito User Pool + App Client
- ✅ 4 tablas DynamoDB (Accounts, Transactions, Users, Idempotency)
- ✅ 6 funciones Lambda (Python)
- ✅ API Gateway con JWT Auth
- ✅ CloudWatch Logs + Alarmas
- ✅ Archivo `.env` para el frontend

### 4. Configurar Frontend

#### 4.1 Instalar Dependencias
```bash
cd ../frontend
npm install
```

#### 4.2 Verificar Variables de Entorno
El archivo `.env` debe haberse generado automáticamente con:
```bash
# frontend/.env (generado automáticamente)
VITE_ENVIRONMENT=dev
VITE_API_BASE_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/dev
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxx
VITE_COGNITO_USER_POOL_CLIENT_ID=xxxxx
VITE_COGNITO_DOMAIN=banca-internet-dev
VITE_AWS_REGION=us-east-1
```

### 5. Iniciar Frontend

```bash
npm run dev
```

**El frontend estará disponible en:** `http://localhost:5173`

### 6. Probar la Aplicación

1. **Registrarse** con email y contraseña
2. **Verificar email** (auto-confirmado)
3. **Iniciar sesión** 
4. **Explorar Dashboard** - Ver cuentas creadas automáticamente
5. **Revisar Movimientos** - Ver transacciones de ejemplo
6. **Hacer Transferencias** - Entre cuentas propias
7. **Ver Perfil** - Datos reales desde DynamoDB

## 📁 Estructura del Proyecto

```
BancaInternet/
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/         # Componentes UI reutilizables
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   └── *.tsx          # Layout, Header, etc.
│   │   ├── features/          # Funcionalidades por dominio
│   │   │   └── auth/          # Autenticación
│   │   ├── hooks/             # Custom hooks (useProfile, etc.)
│   │   ├── pages/             # Páginas principales
│   │   ├── services/          # API services + Cognito
│   │   ├── mappers/           # Data mappers
│   │   ├── lib/               # Stores (Zustand) + utils
│   │   └── config/            # Configuración por ambiente
│   ├── .env                   # Variables de entorno (generado automáticamente)
│   └── package.json           # Dependencias frontend
├── infra/                      # AWS CDK Infrastructure
│   ├── lib/
│   │   ├── constructs/        # Constructs modulares
│   │   │   ├── cognito.ts     # Cognito User Pool
│   │   │   ├── dynamodb.ts    # Tablas DynamoDB
│   │   │   ├── lambdas.ts     # Funciones Lambda
│   │   │   ├── api_gateway.ts # API Gateway
│   │   │   └── monitoring.ts  # CloudWatch
│   │   └── stacks/            # Stack principal
│   │       └── banca-internet-stack.ts
│   ├── src/lambdas/           # Funciones Lambda (Python)
│   │   ├── get_accounts/      # Obtener cuentas
│   │   ├── get_transactions/  # Obtener transacciones
│   │   ├── post_transfer/     # Procesar transferencias
│   │   ├── get_profile/       # Obtener perfil usuario
│   │   ├── seed_data/         # Crear datos demo
│   │   ├── pre_sign_up/       # Trigger Cognito
│   │   └── post_confirmation/ # Trigger Cognito
│   ├── config/                # Configuración por ambiente
│   │   ├── config-env.ts      # Configuración centralizada
│   │   ├── dev.json           # Config dev
│   │   ├── beta.json          # Config beta
│   │   └── prod.json          # Config prod
│   ├── .env                   # Variables de entorno backend
│   └── package.json           # Dependencias CDK
├── scripts/                   # Scripts de despliegue
│   ├── deploy-backend.sh      # Desplegar infraestructura
│   └── dev-frontend.sh        # Iniciar frontend
├── .gitignore                 # Archivos a ignorar
└── README.md                  # Este archivo
```

## 🔧 Funcionalidades Implementadas

### 🔐 Autenticación (Cognito + JWT)
- **Registro de usuarios** con auto-confirmación de email
- **Login/Logout** con tokens JWT seguros
- **Triggers personalizados**:
  - `pre-signup`: Auto-confirma usuarios (sin verificación manual)
  - `post-confirmation`: Crea perfil completo en DynamoDB + cuentas automáticas
- **Tabla de usuarios** con perfiles personalizados y preferencias
- **Integración real** - No simulado, datos reales en AWS

### 💰 Transferencias Bancarias
- **Validación completa** de fondos y límites diarios
- **Idempotencia** con UUID para evitar transferencias duplicadas
- **Transacciones atómicas** en DynamoDB
- **Historial completo** de movimientos con filtros
- **Validación de cuentas** - Solo transferencias entre cuentas propias
- **Límites diarios** configurables por cuenta

### 📊 API REST (Python + boto3)
- `GET /v1/accounts` - Obtener cuentas del usuario autenticado
- `GET /v1/accounts/{id}/transactions` - Historial con filtros de fecha
- `POST /v1/transfers` - Realizar transferencias con validación
- `GET /v1/profile` - Obtener perfil de usuario desde DynamoDB
- `POST /v1/seed` - Crear datos de ejemplo adicionales
- **CORS habilitado** para desarrollo local
- **JWT Authorization** en todos los endpoints

### 🎨 Frontend Moderno (React + TypeScript)
- **Dashboard** con resumen de cuentas y saldos totales
- **Transferencias** con validación en tiempo real y selección de cuentas
- **Historial** con filtros por fecha, tipo y paginación
- **Perfil de usuario** con datos reales desde DynamoDB
- **UI/UX moderna** con TailwindCSS + shadcn/ui
- **Responsive** - Funciona en móvil y desktop
- **Estados de carga** - Skeleton loaders y manejo de errores

### 🗄️ Base de Datos (DynamoDB)
- **Tabla Accounts** - Cuentas bancarias con GSI por customerId
- **Tabla Transactions** - Historial con sort key por timestamp
- **Tabla Users** - Perfiles de usuario con preferencias
- **Tabla Idempotency** - Control de duplicados con TTL
- **Encriptación** y Point-in-Time Recovery habilitados

### 📈 Monitoreo (CloudWatch)
- **Logs centralizados** de todas las Lambdas
- **Métricas personalizadas** de transferencias y errores
- **Alarmas automáticas** para errores y latencia
- **Dashboards** para monitoreo en tiempo real

## 🌍 Ambientes

El proyecto soporta múltiples ambientes con configuración centralizada:

- **`dev`** - Desarrollo (por defecto) - `us-east-1`
- **`beta`** - Pruebas - `us-east-1` 
- **`prod`** - Producción - `us-east-1`

### Configuración por Ambiente

**Archivos de configuración:**
- `infra/config/dev.json` - Configuración de desarrollo
- `infra/config/beta.json` - Configuración de pruebas  
- `infra/config/prod.json` - Configuración de producción
- `infra/config/config-env.ts` - Configuración centralizada

**Diferencias por ambiente:**
- **Nombres de recursos** - Sufijo por ambiente
- **Límites de transferencia** - Configurables
- **Retención de logs** - 30 días (dev) vs 90 días (prod)
- **Umbrales de alarmas** - Más estrictos en producción

## 📝 Notas de Diseño

### 🎯 Micro-POV vs Producción

Este es un **micro-POV** optimizado para demostración:

- ✅ **Funcionalidad completa** de banca básica
- ✅ **Arquitectura escalable** con AWS
- ✅ **Código limpio** y bien estructurado
- ✅ **Seguridad** con mejores prácticas
- ✅ **Datos reales** - No simulado, integración completa
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
7. **Rate Limiting** - API Gateway throttling
8. **Multi-región** - Para alta disponibilidad

## 🚨 Solución de Problemas

### Problemas Comunes

#### 1. Error de CORS
```bash
# Verificar que CORS esté habilitado en API Gateway
aws apigateway get-rest-apis --profile bancainternet
```

#### 2. Error de Cognito
```bash
# Verificar configuración de Cognito
aws cognito-idp describe-user-pool --user-pool-id <POOL_ID> --profile bancainternet
```

#### 3. Error de Lambda
```bash
# Ver logs de Lambda
aws logs tail /aws/lambda/banca-internet-dev-transfer --follow --profile bancainternet
```

#### 4. Frontend no conecta
- Verificar que `.env` esté generado correctamente
- Verificar que el backend esté desplegado
- Verificar CORS en API Gateway

### Comandos de Diagnóstico

```bash
# Verificar stack desplegado
aws cloudformation describe-stacks --stack-name BancaInternet-dev --profile bancainternet

# Ver recursos de DynamoDB
aws dynamodb list-tables --profile bancainternet

# Ver funciones Lambda
aws lambda list-functions --profile bancainternet | grep banca-internet

# Ver API Gateway
aws apigateway get-rest-apis --profile bancainternet
```

## 🛠️ Comandos Útiles

### Despliegue
```bash
# Desplegar backend completo
cd infra
npm install
cdk deploy --profile bancainternet --require-approval never

# Iniciar frontend
cd ../frontend
npm install
npm run dev
```

### Desarrollo
```bash
# Ver logs de Lambda en tiempo real
aws logs tail /aws/lambda/banca-internet-dev-transfer --follow --profile bancainternet

# Ver logs de todas las Lambdas
aws logs tail /aws/lambda/banca-internet-dev --follow --profile bancainternet

# Verificar recursos desplegados
aws cloudformation describe-stacks --stack-name BancaInternet-dev --profile bancainternet

# Ver tablas DynamoDB
aws dynamodb list-tables --profile bancainternet

# Ver usuarios en Cognito
aws cognito-idp list-users --user-pool-id <POOL_ID> --profile bancainternet
```

### Limpieza
```bash
# Destruir toda la infraestructura
cd infra
cdk destroy --profile bancainternet --force

# Limpiar archivos generados
rm -rf frontend/.env
rm -rf infra/.env
rm -rf infra/cdk.out
rm -rf infra/lib
```

## 📚 Recursos Adicionales

### Documentación Técnica
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [React + Vite Documentation](https://vitejs.dev/guide/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Amazon Cognito Developer Guide](https://docs.aws.amazon.com/cognito/latest/developerguide/)

### Tecnologías Utilizadas
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, React Query, Zustand
- **Backend**: AWS CDK, Python 3.11, boto3, AWS Lambda, API Gateway, DynamoDB
- **Auth**: Amazon Cognito, JWT tokens
- **Monitoring**: CloudWatch, SNS
- **Deployment**: AWS CDK, npm scripts

## 🤝 Contribución

Este es un proyecto de demostración. Para contribuciones:

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

### Convenciones de Código
- **Commits**: Usar [Conventional Commits](https://www.conventionalcommits.org/)
- **TypeScript**: Configuración estricta habilitada
- **Python**: PEP 8 para las Lambdas
- **React**: Functional components con hooks

## 📄 Licencia

Este proyecto es para fines de demostración y aprendizaje. 

**Uso comercial**: Contactar al autor para permisos específicos.

---

## 🎉 ¡Proyecto Completado!

**Banca por Internet** es una demostración completa de una aplicación bancaria moderna con:

- ✅ **Backend real** en AWS con Python
- ✅ **Frontend moderno** con React + TypeScript  
- ✅ **Base de datos** con DynamoDB
- ✅ **Autenticación** con Cognito
- ✅ **Transferencias** con validación completa
- ✅ **Monitoreo** con CloudWatch
- ✅ **Datos automáticos** al registrarse
- ✅ **Listo para presentación**

**¡Perfecto para demostrar capacidades de AWS y desarrollo moderno!** 🚀