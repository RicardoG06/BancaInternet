#!/bin/bash

# Script para desplegar el backend de Banca por Internet a AWS
# Usa el perfil de AWS 'bancainternet'

# Colores para la salida de la consola
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Desplegando Backend a AWS (CDK)      ${NC}"
echo -e "${BLUE}========================================${NC}"

# Verificar que se proporcione el ambiente
if [ -z "$1" ]; then
    echo -e "${RED}Error: Debes especificar el ambiente (dev, beta, prod)${NC}"
    echo -e "${YELLOW}Uso: ./scripts/deploy-backend.sh <ambiente>${NC}"
    echo -e "${YELLOW}Ejemplo: ./scripts/deploy-backend.sh dev${NC}"
    exit 1
fi

ENVIRONMENT=$1
AWS_PROFILE="bancainternet"

echo -e "${YELLOW}Ambiente: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Perfil AWS: ${AWS_PROFILE}${NC}"

# 1. Verificar prerrequisitos
echo -e "${YELLOW}1. Verificando prerrequisitos...${NC}"
command -v aws >/dev/null 2>&1 || { echo -e "${RED}Error: AWS CLI no está instalado. Por favor, instálalo.${NC}"; exit 1; }
command -v cdk >/dev/null 2>&1 || { echo -e "${RED}Error: AWS CDK CLI no está instalado. Por favor, instálalo (npm install -g aws-cdk).${NC}"; exit 1; }
echo -e "${GREEN}Prerrequisitos verificados.${NC}"

# 2. Verificar configuración de AWS
echo -e "${YELLOW}2. Verificando configuración de AWS...${NC}"
aws sts get-caller-identity --profile $AWS_PROFILE >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: No se puede autenticar con AWS usando el perfil '${AWS_PROFILE}'.${NC}"
    echo -e "${YELLOW}Por favor, configura el perfil con: aws configure --profile ${AWS_PROFILE}${NC}"
    exit 1
fi
echo -e "${GREEN}Configuración de AWS verificada.${NC}"

# 3. Instalar dependencias del monorepo
echo -e "${YELLOW}3. Instalando dependencias del monorepo...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Falló la instalación de dependencias del monorepo.${NC}"
    exit 1
fi
echo -e "${GREEN}Dependencias del monorepo instaladas.${NC}"

# 4. Instalar dependencias de la infraestructura
echo -e "${YELLOW}4. Instalando dependencias de la infraestructura...${NC}"
cd infra
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Falló la instalación de dependencias de la infraestructura.${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}Dependencias de la infraestructura instaladas.${NC}"

# 5. Realizar CDK Bootstrap (si es necesario)
echo -e "${YELLOW}5. Realizando CDK Bootstrap (si es necesario)...${NC}"
cd infra
ACCOUNT_ID=$(aws sts get-caller-identity --profile $AWS_PROFILE --query Account --output text)
REGION=$(aws configure get region --profile $AWS_PROFILE)
cdk bootstrap aws://$ACCOUNT_ID/$REGION --profile $AWS_PROFILE
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Falló el CDK Bootstrap.${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}CDK Bootstrap completado.${NC}"

# 6. Desplegar la infraestructura
echo -e "${YELLOW}6. Desplegando la infraestructura a AWS...${NC}"
cd infra
cdk deploy --all --profile $AWS_PROFILE --outputs-file ../frontend/.env.cdk-outputs.json --require-approval never
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Falló el despliegue de CDK.${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}Despliegue de CDK completado.${NC}"

# 7. Actualizar el archivo .env del frontend con los outputs de CDK
echo -e "${YELLOW}7. Actualizando el archivo .env del frontend con los outputs de CDK...${NC}"
node -e "
const fs = require('fs');
const path = require('path');
const cdkOutputs = require(path.join(__dirname, 'frontend', '.env.cdk-outputs.json'));

const stackName = Object.keys(cdkOutputs)[0];
const outputs = cdkOutputs[stackName];

let envContent = '';
envContent += \`# Variables de entorno para el frontend de Banca por Internet\n\`;
envContent += \`# Generado automáticamente por el despliegue de CDK\n\n\`;
envContent += \`# AWS Configuration\n\`;
envContent += \`VITE_AWS_REGION=\${outputs.Region}\n\n\`;
envContent += \`# Cognito Configuration\n\`;
envContent += \`VITE_COGNITO_USER_POOL_ID=\${outputs.UserPoolId}\n\`;
envContent += \`VITE_COGNITO_USER_POOL_CLIENT_ID=\${outputs.UserPoolClientId}\n\`;
envContent += \`VITE_COGNITO_DOMAIN=\${outputs.UserPoolDomain}\n\n\`;
envContent += \`# API Configuration\n\`;
envContent += \`VITE_API_BASE_URL=\${outputs.ApiEndpoint}\n\n\`;
envContent += \`# Environment\n\`;
envContent += \`VITE_ENVIRONMENT=dev\n\n\`;
envContent += \`# Nota: CloudFront y S3 removidos para micro-POV\n\`;
envContent += \`# Se usarán con Amplify manualmente después\n\`;

fs.writeFileSync(path.join(__dirname, 'frontend', '.env'), envContent);
console.log('Archivo .env del frontend actualizado con los outputs de CDK.');
"
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Falló la actualización del archivo .env del frontend.${NC}"
    exit 1
fi
echo -e "${GREEN}Archivo .env del frontend actualizado.${NC}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Despliegue del Backend Completado     ${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Puedes encontrar los outputs en frontend/.env${NC}"
echo -e "${GREEN}Ahora puedes iniciar el frontend con 'cd BancaInternet && ./scripts/dev-frontend.sh ${ENVIRONMENT}' para usar las APIs reales.${NC}"