import json
import os
import boto3
import uuid
from datetime import datetime
from typing import Dict, Any
from botocore.exceptions import ClientError

# Clientes de AWS
dynamodb = boto3.client('dynamodb')
ACCOUNTS_TABLE = os.environ['ACCOUNTS_TABLE_NAME']
TRANSACTIONS_TABLE = os.environ['TRANSACTIONS_TABLE_NAME']
IDEMPOTENCY_TABLE = os.environ['IDEMPOTENCY_TABLE_NAME']

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

def check_idempotency(operation_id: str) -> bool:
    """Verificar si la operación ya fue procesada"""
    try:
        response = dynamodb.get_item(
            TableName=IDEMPOTENCY_TABLE,
            Key={'operationId': {'S': operation_id}}
        )
        return 'Item' in response
    except Exception as e:
        print(f'Error checking idempotency: {str(e)}')
        return False

def save_idempotency(operation_id: str, result: Dict[str, Any]) -> None:
    """Guardar resultado de operación para idempotencia"""
    try:
        # TTL de 48 horas
        ttl = int(datetime.now().timestamp()) + (48 * 60 * 60)
        
        dynamodb.put_item(
            TableName=IDEMPOTENCY_TABLE,
            Item={
                'operationId': {'S': operation_id},
                'result': {'S': json.dumps(result)},
                'timestamp': {'S': datetime.now().isoformat()},
                'ttl': {'N': str(ttl)}
            }
        )
    except Exception as e:
        print(f'Error saving idempotency: {str(e)}')

def get_account(account_id: str) -> Dict[str, Any]:
    """Obtener cuenta por ID"""
    try:
        # Usar scan para buscar por accountId ya que la tabla tiene sort key
        response = dynamodb.scan(
            TableName=ACCOUNTS_TABLE,
            FilterExpression='accountId = :accountId',
            ExpressionAttributeValues={
                ':accountId': {'S': account_id}
            }
        )
        
        if not response.get('Items'):
            return None
            
        item = response['Items'][0]  # Tomar el primer (y único) resultado
        return {
            'accountId': item['accountId']['S'],
            'customerId': item['customerId']['S'],
            'balance': float(item['balance']['N']),
            'dailyTransferUsed': float(item.get('dailyTransferUsed', {'N': '0'})['N']),
            'dailyTransferLimit': float(item.get('dailyTransferLimit', {'N': '500'})['N'])
        }
    except Exception as e:
        print(f'Error getting account: {str(e)}')
        return None

def update_account_balance(account_id: str, new_balance: float, daily_used: float) -> bool:
    """Actualizar saldo y límite diario de cuenta"""
    try:
        # Primero obtener la cuenta completa para tener ambas keys
        account = get_account(account_id)
        if not account:
            print(f'Account {account_id} not found for update')
            return False
        
        # Usar put_item para actualizar (más simple que update_item con keys compuestas)
        response = dynamodb.scan(
            TableName=ACCOUNTS_TABLE,
            FilterExpression='accountId = :accountId',
            ExpressionAttributeValues={
                ':accountId': {'S': account_id}
            }
        )
        
        if not response.get('Items'):
            print(f'Account {account_id} not found for update')
            return False
        
        # Obtener el item completo
        item = response['Items'][0]
        
        # Actualizar los campos necesarios
        item['balance'] = {'N': str(new_balance)}
        item['dailyTransferUsed'] = {'N': str(daily_used)}
        item['updatedAt'] = {'S': datetime.now().isoformat()}
        
        # Usar put_item para actualizar
        dynamodb.put_item(
            TableName=ACCOUNTS_TABLE,
            Item=item
        )
        return True
    except Exception as e:
        print(f'Error updating account balance: {str(e)}')
        return False

def create_transaction(account_id: str, transaction_type: str, amount: float, 
                      counterparty: str, note: str, transfer_id: str) -> bool:
    """Crear transacción en DynamoDB"""
    try:
        timestamp = datetime.now().isoformat()
        
        dynamodb.put_item(
            TableName=TRANSACTIONS_TABLE,
            Item={
                'accountId': {'S': account_id},
                'timestamp': {'S': timestamp},
                'transactionId': {'S': str(uuid.uuid4())},
                'type': {'S': transaction_type},
                'amount': {'N': str(amount)},
                'counterparty': {'S': counterparty},
                'transferId': {'S': transfer_id},
                'status': {'S': 'COMPLETED'},
                'note': {'S': note or ''},
                'createdAt': {'S': timestamp}
            }
        )
        return True
    except Exception as e:
        print(f'Error creating transaction: {str(e)}')
        return False

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Handler para procesar transferencias"""
    
    # Manejar preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        return make_response(200, {'message': 'CORS preflight successful'})

    try:
        # Parsear body
        body = json.loads(event.get('body', '{}'))
        
        source_account_id = body.get('sourceAccountId')
        target_account_id = body.get('targetAccountId')
        amount = body.get('amount')
        note = body.get('note', '')
        idempotency_key = body.get('idempotencyKey')

        # Validaciones básicas
        if not all([source_account_id, target_account_id, amount]):
            return make_response(400, {
                'error': 'Bad Request',
                'message': 'Missing required fields: sourceAccountId, targetAccountId, amount'
            })

        if source_account_id == target_account_id:
            return make_response(400, {
                'error': 'Bad Request',
                'message': 'Source and target accounts cannot be the same'
            })

        if amount <= 0:
            return make_response(400, {
                'error': 'Bad Request',
                'message': 'Amount must be greater than 0'
            })

        # Verificar idempotencia
        if idempotency_key:
            if check_idempotency(idempotency_key):
                return make_response(200, {
                    'status': 'COMPLETED',
                    'message': 'Transfer already processed',
                    'transferId': idempotency_key
                })

        # Obtener customerId del token JWT (sub claim)
        authorizer_context = event.get('requestContext', {}).get('authorizer', {})
        customer_id = authorizer_context.get('claims', {}).get('sub')
        
        if not customer_id:
            return make_response(401, {
                'error': 'Unauthorized',
                'message': 'Customer ID not found in token'
            })

        # Obtener cuentas
        source_account = get_account(source_account_id)
        target_account = get_account(target_account_id)

        if not source_account:
            return make_response(404, {
                'error': 'Not Found',
                'message': 'Source account not found'
            })

        if not target_account:
            return make_response(404, {
                'error': 'Not Found',
                'message': 'Target account not found'
            })

        # Validar que las cuentas pertenezcan al usuario actual
        if source_account['customerId'] != customer_id:
            return make_response(403, {
                'error': 'Forbidden',
                'message': 'Source account does not belong to current user'
            })

        if target_account['customerId'] != customer_id:
            return make_response(403, {
                'error': 'Forbidden',
                'message': 'Target account does not belong to current user'
            })

        # Verificar saldo suficiente
        if source_account['balance'] < amount:
            return make_response(400, {
                'error': 'Insufficient Funds',
                'message': 'Insufficient balance in source account'
            })

        # Verificar límite diario
        remaining_daily_limit = source_account['dailyTransferLimit'] - source_account['dailyTransferUsed']
        if remaining_daily_limit < amount:
            return make_response(400, {
                'error': 'Daily Limit Exceeded',
                'message': 'Transfer amount exceeds remaining daily limit'
            })

        # Generar ID de transferencia
        transfer_id = idempotency_key or str(uuid.uuid4())

        # Procesar transferencia
        new_source_balance = source_account['balance'] - amount
        new_target_balance = target_account['balance'] + amount
        new_daily_used = source_account['dailyTransferUsed'] + amount

        # Actualizar cuentas
        if not update_account_balance(source_account_id, new_source_balance, new_daily_used):
            return make_response(500, {
                'error': 'Transfer Failed',
                'message': 'Error updating source account'
            })

        if not update_account_balance(target_account_id, new_target_balance, target_account['dailyTransferUsed']):
            return make_response(500, {
                'error': 'Transfer Failed',
                'message': 'Error updating target account'
            })

        # Crear transacciones
        counterparty_name = f"Transfer to {target_account_id[-4:]}"
        
        if not create_transaction(source_account_id, 'DEBIT', -amount, counterparty_name, note, transfer_id):
            return make_response(500, {
                'error': 'Transfer Failed',
                'message': 'Error creating debit transaction'
            })

        if not create_transaction(target_account_id, 'CREDIT', amount, f"Transfer from {source_account_id[-4:]}", note, transfer_id):
            return make_response(500, {
                'error': 'Transfer Failed',
                'message': 'Error creating credit transaction'
            })

        # Guardar idempotencia
        result = {
            'status': 'COMPLETED',
            'transferId': transfer_id,
            'amount': amount,
            'sourceAccountId': source_account_id,
            'targetAccountId': target_account_id
        }

        if idempotency_key:
            save_idempotency(idempotency_key, result)

        return make_response(200, result)

    except json.JSONDecodeError:
        return make_response(400, {
            'error': 'Bad Request',
            'message': 'Invalid JSON in request body'
        })
    except Exception as e:
        print(f'Unexpected error: {str(e)}')
        return make_response(500, {
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        })
