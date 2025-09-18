import json
import os
import boto3
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any
from botocore.exceptions import ClientError

# Clientes de AWS
dynamodb = boto3.client('dynamodb')
ACCOUNTS_TABLE = os.environ['ACCOUNTS_TABLE_NAME']
TRANSACTIONS_TABLE = os.environ['TRANSACTIONS_TABLE_NAME']

def make_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """Crear respuesta HTTP con headers CORS"""
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Requested-With,X-Environment',
            'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
            'Access-Control-Max-Age': '86400',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body, ensure_ascii=False)
    }

def create_sample_account(customer_id: str, customer_email: str, account_type: str, 
                         account_name: str, initial_balance: float) -> str:
    """Crear una cuenta de ejemplo"""
    account_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    account_item = {
        'accountId': {'S': account_id},
        'customerId': {'S': customer_id},
        'customerEmail': {'S': customer_email},
        'accountName': {'S': account_name},
        'accountType': {'S': account_type},
        'balance': {'N': str(initial_balance)},
        'currency': {'S': 'USD'},
        'dailyTransferUsed': {'N': '0'},
        'dailyTransferLimit': {'N': '500'},
        'status': {'S': 'ACTIVE'},
        'createdAt': {'S': now},
        'updatedAt': {'S': now}
    }
    
    dynamodb.put_item(TableName=ACCOUNTS_TABLE, Item=account_item)
    return account_id

def create_sample_transaction(account_id: str, transaction_type: str, amount: float,
                             counterparty: str, note: str, days_ago: int) -> None:
    """Crear una transacción de ejemplo"""
    timestamp = datetime.now() - timedelta(days=days_ago)
    timestamp_str = timestamp.isoformat()
    
    transaction_item = {
        'accountId': {'S': account_id},
        'timestamp': {'S': timestamp_str},
        'transactionId': {'S': str(uuid.uuid4())},
        'type': {'S': transaction_type},
        'amount': {'N': str(amount)},
        'counterparty': {'S': counterparty},
        'transferId': {'S': str(uuid.uuid4())},
        'status': {'S': 'COMPLETED'},
        'note': {'S': note},
        'createdAt': {'S': timestamp_str}
    }
    
    dynamodb.put_item(TableName=TRANSACTIONS_TABLE, Item=transaction_item)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Handler para poblar datos de ejemplo"""
    
    # Manejar preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        return make_response(200, {'message': 'CORS preflight successful'})

    try:
        # Obtener customerId del token JWT (sub claim)
        authorizer_context = event.get('requestContext', {}).get('authorizer', {})
        customer_id = authorizer_context.get('claims', {}).get('sub')
        
        if not customer_id:
            return make_response(401, {
                'error': 'Unauthorized',
                'message': 'Customer ID not found in token'
            })

        # Parsear body para obtener email del cliente
        body = json.loads(event.get('body', '{}'))
        customer_email = body.get('email', f'user_{customer_id}@example.com')

        # Verificar si ya tiene cuentas
        existing_accounts = dynamodb.query(
            TableName=ACCOUNTS_TABLE,
            IndexName='CustomerIdIndex',
            KeyConditionExpression='customerId = :customerId',
            ExpressionAttributeValues={
                ':customerId': {'S': customer_id}
            }
        )

        if existing_accounts.get('Items'):
            return make_response(400, {
                'error': 'Bad Request',
                'message': 'User already has accounts. Use existing data.'
            })

        # Crear cuentas de ejemplo
        checking_account_id = create_sample_account(
            customer_id, customer_email, 'CHECKING', 
            'Cuenta Corriente Principal', 5000.00
        )
        
        savings_account_id = create_sample_account(
            customer_id, customer_email, 'SAVINGS', 
            'Cuenta de Ahorros', 2500.00
        )

        # Crear transacciones de ejemplo
        sample_transactions = [
            # Transacciones para cuenta corriente
            {
                'account_id': checking_account_id,
                'type': 'CREDIT',
                'amount': 5000.00,
                'counterparty': 'Depósito Inicial',
                'note': 'Depósito inicial de bienvenida',
                'days_ago': 30
            },
            {
                'account_id': checking_account_id,
                'type': 'DEBIT',
                'amount': -150.00,
                'counterparty': 'Supermercado',
                'note': 'Compra de víveres',
                'days_ago': 25
            },
            {
                'account_id': checking_account_id,
                'type': 'DEBIT',
                'amount': -75.50,
                'counterparty': 'Gasolinera',
                'note': 'Combustible',
                'days_ago': 20
            },
            {
                'account_id': checking_account_id,
                'type': 'CREDIT',
                'amount': 2500.00,
                'counterparty': 'Nómina',
                'note': 'Pago de nómina mensual',
                'days_ago': 10
            },
            {
                'account_id': checking_account_id,
                'type': 'DEBIT',
                'amount': -45.00,
                'counterparty': 'Netflix',
                'note': 'Suscripción mensual',
                'days_ago': 5
            },
            # Transacciones para cuenta de ahorros
            {
                'account_id': savings_account_id,
                'type': 'CREDIT',
                'amount': 2500.00,
                'counterparty': 'Apertura de Cuenta',
                'note': 'Apertura de cuenta de ahorros',
                'days_ago': 28
            },
            {
                'account_id': savings_account_id,
                'type': 'CREDIT',
                'amount': 300.00,
                'counterparty': 'Transferencia desde Corriente',
                'note': 'Transferencia mensual desde corriente',
                'days_ago': 15
            },
            {
                'account_id': savings_account_id,
                'type': 'CREDIT',
                'amount': 200.00,
                'counterparty': 'Intereses',
                'note': 'Intereses ganados',
                'days_ago': 7
            }
        ]

        # Crear todas las transacciones
        for tx in sample_transactions:
            create_sample_transaction(
                tx['account_id'], tx['type'], tx['amount'],
                tx['counterparty'], tx['note'], tx['days_ago']
            )

        return make_response(200, {
            'message': 'Sample data created successfully',
            'accountsCreated': 2,
            'transactionsCreated': len(sample_transactions),
            'checkingAccountId': checking_account_id,
            'savingsAccountId': savings_account_id
        })

    except json.JSONDecodeError:
        return make_response(400, {
            'error': 'Bad Request',
            'message': 'Invalid JSON in request body'
        })
    except ClientError as e:
        print(f'DynamoDB error: {str(e)}')
        return make_response(500, {
            'error': 'Database error',
            'message': 'Error creating sample data'
        })
    except Exception as e:
        print(f'Unexpected error: {str(e)}')
        return make_response(500, {
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        })
