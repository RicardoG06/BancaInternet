import json
import boto3
import os
import uuid
from datetime import datetime, timedelta

# Cliente de DynamoDB
dynamodb = boto3.client("dynamodb")
USER_TABLE = os.environ["USERS_TABLE_NAME"]
ACCOUNTS_TABLE = os.environ.get("ACCOUNTS_TABLE_NAME", "banca-accounts-dev-dev")
TRANSACTIONS_TABLE = os.environ.get("TRANSACTIONS_TABLE_NAME", "banca-transactions-dev-dev")

def lambda_handler(event, context):
    """
    Lambda trigger de Cognito para post-confirmation
    Crea un perfil de usuario en DynamoDB después de la confirmación
    """
    print(f"[INFO] Post-confirmation trigger ejecutado: {event}")
    
    user_attributes = event["request"]["userAttributes"]
    user_id = user_attributes.get("sub")
    email = user_attributes.get("email")
    given_name = user_attributes.get("given_name", "")
    family_name = user_attributes.get("family_name", "")
    
    if not user_id or not email:
        error_message = "Missing required user attributes"
        print(f"[ERROR] {error_message}")
        raise Exception(error_message)

    # Crear item para DynamoDB
    item = {
        "id": {"S": user_id},
        "email": {"S": email},
        "name": {"S": f"{given_name} {family_name}".strip() or email},
        "givenName": {"S": given_name},
        "familyName": {"S": family_name},
        "createdAt": {"S": datetime.utcnow().isoformat()},
        "updatedAt": {"S": datetime.utcnow().isoformat()},
        "status": {"S": "ACTIVE"},
        "customerType": {"S": "INDIVIDUAL"},
        "riskProfile": {"S": "CONSERVATIVE"},
        "preferences": {
            "M": {
                "notifications": {
                    "M": {
                        "email": {"BOOL": True},
                        "sms": {"BOOL": False}
                    }
                },
                "language": {"S": "es"},
                "currency": {"S": "USD"}
            }
        },
        "environment": {"S": os.environ.get("ENVIRONMENT", "dev")}
    }

    try:
        dynamodb.put_item(TableName=USER_TABLE, Item=item)
        print(f"[INFO] Perfil de usuario creado en DynamoDB para user_id: {user_id}")
        
        # Crear cuentas bancarias automáticamente
        create_sample_accounts(user_id, email)
        
    except Exception as e:
        error_message = f"Error creando perfil de usuario: {str(e)}"
        print(f"[ERROR] {error_message}")
        raise Exception(error_message)

    return event

def create_sample_accounts(user_id, email):
    """
    Crea cuentas bancarias de ejemplo para el usuario
    """
    try:
        print(f"[INFO] Creando cuentas bancarias para user_id: {user_id}")
        
        # Crear cuenta corriente
        checking_account = create_account(
            user_id, 
            email, 
            "CHECKING", 
            "Cuenta Corriente Principal",
            5000.00  # Saldo inicial de $5,000
        )
        
        # Crear cuenta de ahorros
        savings_account = create_account(
            user_id, 
            email, 
            "SAVINGS", 
            "Cuenta de Ahorros",
            2500.00  # Saldo inicial de $2,500
        )
        
        # Crear transacciones de ejemplo
        create_sample_transactions(user_id, checking_account, savings_account)
        
        print(f"[INFO] Cuentas bancarias creadas exitosamente para user_id: {user_id}")
        
    except Exception as e:
        print(f"[ERROR] Error creando cuentas bancarias: {str(e)}")
        # No lanzar excepción para no fallar el registro del usuario

def create_account(user_id, email, account_type, account_name, initial_balance):
    """
    Crea una cuenta bancaria individual
    """
    account_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    account_item = {
        "accountId": {"S": account_id},
        "customerId": {"S": user_id},
        "customerEmail": {"S": email},
        "accountName": {"S": account_name},
        "accountType": {"S": account_type},
        "balance": {"N": str(initial_balance)},
        "currency": {"S": "USD"},
        "dailyTransferUsed": {"N": "0"},
        "dailyTransferLimit": {"N": "500"},
        "status": {"S": "ACTIVE"},
        "createdAt": {"S": now},
        "updatedAt": {"S": now}
    }
    
    dynamodb.put_item(TableName=ACCOUNTS_TABLE, Item=account_item)
    print(f"[INFO] Cuenta {account_type} creada: {account_id}")
    
    return account_id

def create_sample_transactions(user_id, checking_account, savings_account):
    """
    Crea transacciones de ejemplo para las cuentas
    """
    now = datetime.utcnow()
    
    # Lista de transacciones de ejemplo
    sample_transactions = [
        {
            "account_id": checking_account,
            "type": "CREDIT",
            "amount": 5000.00,
            "counterparty": "Depósito Inicial",
            "note": "Depósito inicial de bienvenida",
            "days_ago": 30
        },
        {
            "account_id": checking_account,
            "type": "DEBIT",
            "amount": -150.00,
            "counterparty": "Supermercado",
            "note": "Compra de víveres",
            "days_ago": 25
        },
        {
            "account_id": checking_account,
            "type": "DEBIT",
            "amount": -75.50,
            "counterparty": "Gasolinera",
            "note": "Combustible",
            "days_ago": 20
        },
        {
            "account_id": savings_account,
            "type": "CREDIT",
            "amount": 2500.00,
            "counterparty": "Apertura de Cuenta",
            "note": "Apertura de cuenta de ahorros",
            "days_ago": 28
        },
        {
            "account_id": checking_account,
            "type": "DEBIT",
            "amount": -300.00,
            "counterparty": "Transferencia a Ahorros",
            "note": "Transferencia mensual a ahorros",
            "days_ago": 15
        },
        {
            "account_id": savings_account,
            "type": "CREDIT",
            "amount": 300.00,
            "counterparty": "Transferencia desde Corriente",
            "note": "Transferencia mensual desde corriente",
            "days_ago": 15
        },
        {
            "account_id": checking_account,
            "type": "CREDIT",
            "amount": 2500.00,
            "counterparty": "Nómina",
            "note": "Pago de nómina mensual",
            "days_ago": 10
        },
        {
            "account_id": checking_account,
            "type": "DEBIT",
            "amount": -45.00,
            "counterparty": "Netflix",
            "note": "Suscripción mensual",
            "days_ago": 5
        }
    ]
    
    for tx in sample_transactions:
        create_transaction(
            tx["account_id"],
            tx["type"],
            tx["amount"],
            tx["counterparty"],
            tx["note"],
            now - timedelta(days=tx["days_ago"])
        )

def create_transaction(account_id, transaction_type, amount, counterparty, note, timestamp):
    """
    Crea una transacción individual
    """
    transaction_id = str(uuid.uuid4())
    timestamp_str = timestamp.isoformat()
    
    transaction_item = {
        "accountId": {"S": account_id},
        "timestamp": {"S": timestamp_str},
        "transactionId": {"S": transaction_id},
        "type": {"S": transaction_type},
        "amount": {"N": str(amount)},
        "counterparty": {"S": counterparty},
        "note": {"S": note},
        "status": {"S": "COMPLETED"},
        "createdAt": {"S": timestamp_str}
    }
    
    # Usar timestamp como sort key para DynamoDB
    dynamodb.put_item(TableName=TRANSACTIONS_TABLE, Item=transaction_item)
    print(f"[INFO] Transacción creada: {transaction_type} ${amount} - {counterparty}")
