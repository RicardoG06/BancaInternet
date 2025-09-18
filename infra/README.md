# Banca por Internet - Infraestructura

Este directorio contiene la infraestructura de AWS para la aplicación de Banca por Internet, organizada siguiendo el patrón de licitxpert_crawl.

## 📁 Estructura

```
infra/
├── bin/
│   └── app.ts                    # Punto de entrada de CDK
├── config/
│   ├── config-env.ts            # Configuración centralizada
│   ├── dev.json                 # Configuración para desarrollo
│   ├── beta.json                # Configuración para beta
│   └── prod.json                # Configuración para producción
├── lib/
│   ├── constructs/              # Constructs de CDK por servicio
│   │   ├── cognito.ts           # Cognito User Pool
│   │   ├── dynamodb.ts          # DynamoDB Tables
│   │   ├── lambdas.ts           # Lambda Functions
│   │   ├── api_gateway.ts       # API Gateway
│   │   ├── buckets.ts           # S3 + CloudFront
│   │   └── monitoring.ts        # CloudWatch
│   ├── stacks/
│   │   └── banca-internet-stack.ts  # Stack principal
│   └── banca-internet-stack.ts  # Stack principal (legacy)
├── src/
│   └── lambdas/                 # Código de las funciones Lambda
│       ├── transfer.ts          # Lógica de transferencias
│       ├── accounts.ts          # Obtener cuentas
│       ├── transactions.ts      # Obtener transacciones
│       └── seed-data.ts         # Crear datos de ejemplo
├── docs/
│   └── api.yaml                 # Documentación de la API
├── package.json                 # Dependencias de Node.js
├── tsconfig.json               # Configuración de TypeScript
├── cdk.json                    # Configuración de CDK
└── env.example                 # Variables de entorno de ejemplo
```

## 🚀 Uso

### Prerrequisitos

1. **Node.js 18+**
2. **AWS CLI configurado**
3. **AWS CDK instalado**: `npm install -g aws-cdk`

### Configuración

1. **Copiar archivo de configuración:**
   ```bash
   cp env.example .env
   ```

2. **Editar variables de entorno:**
   ```bash
   # Editar .env con tu AWS_ACCOUNT_ID
   AWS_ACCOUNT_ID=123456789012
   AWS_REGION=us-east-1
   ENVIRONMENT=dev
   ```

### Deploy

```bash
# Desde el directorio raíz del proyecto
./scripts/deploy.sh dev      # Desarrollo
./scripts/deploy.sh beta     # Beta
./scripts/deploy.sh prod     # Producción
```

### Comandos CDK

```bash
# Instalar dependencias
npm install

# Compilar
npm run build

# Deploy
cdk deploy BancaInternet-dev

# Destroy
cdk destroy BancaInternet-dev

# Listar stacks
cdk list

# Verificar sintaxis
cdk synth
```

## 🏗️ Constructs

### CognitoConstruct
- User Pool con configuración de seguridad
- User Pool Client para autenticación
- User Pool Domain para Hosted UI

### DynamoDBConstruct
- **Accounts Table**: Cuentas bancarias de usuarios
- **Transactions Table**: Historial de transacciones
- **Idempotency Table**: Control de idempotencia

### LambdasConstruct
- **transfer**: Procesar transferencias bancarias
- **accounts**: Obtener cuentas del usuario
- **transactions**: Obtener transacciones de una cuenta
- **seed-data**: Crear datos de ejemplo

### ApiGatewayConstruct
- API REST con autenticación JWT
- CORS configurado
- Métricas y logging habilitados

### BucketsConstruct
- S3 bucket para hosting estático
- CloudFront distribution con HTTPS
- Configuración de cache optimizada

### MonitoringConstruct
- CloudWatch Log Groups
- Alarmas de errores y latencia
- SNS topics para notificaciones

## 🔧 Configuración por Ambiente

### Desarrollo (dev)
- MFA deshabilitado
- Límites de transferencia reducidos
- Logs retenidos por 7 días
- CORS amplio para desarrollo local

### Beta
- MFA habilitado
- Límites de transferencia intermedios
- Logs retenidos por 30 días
- CORS restringido a dominios beta

### Producción (prod)
- MFA habilitado
- Límites de transferencia completos
- Logs retenidos por 90 días
- CORS restringido a dominios de producción
- Alarmas más estrictas

## 📊 Outputs

El stack genera los siguientes outputs:

- `UserPoolId`: ID del User Pool de Cognito
- `UserPoolClientId`: ID del User Pool Client
- `UserPoolDomain`: Dominio del User Pool
- `ApiUrl`: URL de la API
- `FrontendUrl`: URL del frontend
- `Region`: Región de AWS
- `AccountsTableName`: Nombre de la tabla de cuentas
- `TransactionsTableName`: Nombre de la tabla de transacciones
- `IdempotencyTableName`: Nombre de la tabla de idempotencia

## 🔒 Seguridad

- **IAM**: Permisos mínimos necesarios
- **Cognito**: Autenticación JWT con MFA
- **DynamoDB**: Encriptación en reposo
- **API Gateway**: Autorización JWT requerida
- **CloudFront**: HTTPS obligatorio
- **Logs**: Sin información sensible (PII)

## 📈 Monitoreo

- **CloudWatch Logs**: Logs estructurados con correlation ID
- **CloudWatch Metrics**: Métricas personalizadas de transferencias
- **CloudWatch Alarms**: Alertas de errores y latencia
- **SNS**: Notificaciones de alarmas

## 🧪 Testing

```bash
# Ejecutar tests (si están implementados)
npm test

# Verificar sintaxis TypeScript
npm run build
```

## 📝 Notas

- Los archivos de configuración JSON se pueden modificar para ajustar parámetros por ambiente
- Las lambdas están en `src/lambdas/` para separar el código de la infraestructura
- Los constructs están separados por servicio para facilitar el mantenimiento
- El stack principal orquesta todos los constructs
