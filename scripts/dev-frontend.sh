#!/bin/bash

# Script para desarrollo del frontend siguiendo estructura de licitxpert_web
# Soporta múltiples ambientes: dev, beta, prod

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para mostrar ayuda
show_help() {
    echo "🚀 Banca por Internet - Frontend Development"
    echo "==========================================="
    echo ""
    echo "Uso: $0 [AMBIENTE] [OPCIONES]"
    echo ""
    echo "Ambientes disponibles:"
    echo "  dev     - Desarrollo (por defecto)"
    echo "  beta    - Beta/Staging"
    echo "  prod    - Producción"
    echo ""
    echo "Opciones:"
    echo "  --help, -h     Mostrar esta ayuda"
    echo "  --build        Solo construir sin iniciar servidor"
    echo "  --preview      Construir y previsualizar"
    echo ""
    echo "Ejemplos:"
    echo "  $0 dev                    # Desarrollo"
    echo "  $0 beta --build          # Construir para beta"
    echo "  $0 prod --preview        # Previsualizar producción"
    echo ""
}

# Función principal
main() {
    # Parsear argumentos
    ENVIRONMENT="dev"
    BUILD_ONLY=false
    PREVIEW=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            dev|beta|prod)
                ENVIRONMENT="$1"
                shift
                ;;
            --build)
                BUILD_ONLY=true
                shift
                ;;
            --preview)
                PREVIEW=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                print_error "Opción desconocida: $1"
                show_help
                exit 1
                ;;
        esac
    done

    echo "🚀 Banca por Internet - Frontend $(echo $ENVIRONMENT | tr '[:lower:]' '[:upper:]')"
    echo "============================================="
    echo ""
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        print_error "No se encontró package.json. Asegúrate de estar en el directorio BancaInternet/"
        exit 1
    fi
    
    # Verificar prerrequisitos
    print_status "Verificando prerrequisitos..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado. Por favor instala npm"
        exit 1
    fi
    
    print_success "Prerrequisitos verificados"
    
    # Crear archivo .env si no existe
    if [ ! -f "frontend/.env" ]; then
        print_status "Creando archivo .env desde env.example..."
        cp frontend/env.example frontend/.env
        print_warning "Archivo .env creado. Por favor edita frontend/.env con tus valores"
        print_warning "Especialmente importante: Variables de Cognito y API"
    else
        print_success "Archivo .env encontrado"
    fi
    
    # Configurar variables de entorno
    export VITE_ENVIRONMENT=$ENVIRONMENT
    
    # Instalar dependencias
    print_status "Instalando dependencias..."
    npm install
    cd frontend
    npm install
    cd ..
    print_success "Dependencias instaladas"
    
    # Construir aplicación
    print_status "Construyendo aplicación para ambiente ${ENVIRONMENT}..."
    cd frontend
    npm run build
    print_success "Aplicación construida"
    
    if [ "$BUILD_ONLY" = true ]; then
        print_success "Construcción completada. Archivos en frontend/dist/"
        exit 0
    fi
    
    if [ "$PREVIEW" = true ]; then
        print_status "Iniciando previsualización..."
        npm run preview
    else
        print_status "Iniciando servidor de desarrollo..."
        print_success "Aplicación disponible en http://localhost:5173"
        print_success "Presiona Ctrl+C para detener el servidor"
        npm run dev
    fi
}

# Ejecutar función principal
main "$@"