import json
import os
import boto3
from typing import Dict, Any
from botocore.exceptions import ClientError

# Cliente de DynamoDB
dynamodb = boto3.client('dynamodb')
ACCOUNTS_TABLE = os.environ['ACCOUNTS_TABLE_NAME']

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

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Handler para obtener cuentas de un usuario"""
    
    # Manejar preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        return make_response(200, {'message': 'CORS preflight successful'})

    try:
        # Obtener customerId del token JWT (sub claim)
        authorizer_context = event.get('requestContext', {}).get('authorizer', {})
        customer_id = authorizer_context.get('claims', {}).get('sub')
        
        if not customer_id:
            # Debug: imprimir el contexto completo para ver qué está disponible
            print(f"Authorizer context: {authorizer_context}")
            return make_response(401, {
                'error': 'Unauthorized',
                'message': 'Customer ID not found in token'
            })

        # Buscar cuentas del usuario
        response = dynamodb.query(
            TableName=ACCOUNTS_TABLE,
            IndexName='CustomerIdIndex',
            KeyConditionExpression='customerId = :customerId',
            ExpressionAttributeValues={
                ':customerId': {'S': customer_id}
            }
        )

        accounts = []
        total_balance = 0
        daily_transfer_used = 0
        daily_transfer_limit = 0

        for item in response.get('Items', []):
            account = {
                'accountId': item['accountId']['S'],
                'customerId': item['customerId']['S'],
                'balance': float(item['balance']['N']),
                'currency': item['currency']['S'],
                'accountType': item['accountType']['S'],
                'accountName': item.get('accountName', {}).get('S', ''),
                'dailyTransferUsed': float(item.get('dailyTransferUsed', {'N': '0'})['N']),
                'dailyTransferLimit': float(item.get('dailyTransferLimit', {'N': '500'})['N']),
                'status': item.get('status', {'S': 'ACTIVE'})['S'],
                'createdAt': item['createdAt']['S'],
                'updatedAt': item['updatedAt']['S']
            }
            
            accounts.append(account)
            total_balance += account['balance']
            daily_transfer_used += account['dailyTransferUsed']
            daily_transfer_limit += account['dailyTransferLimit']

        summary = {
            'totalBalance': total_balance,
            'totalAccounts': len(accounts),
            'dailyTransferUsed': daily_transfer_used,
            'dailyTransferLimit': daily_transfer_limit,
            'remainingDailyLimit': daily_transfer_limit - daily_transfer_used
        }

        return make_response(200, {
            'accounts': accounts,
            'summary': summary,
            'correlationId': event.get('requestContext', {}).get('requestId', '')
        })

    except ClientError as e:
        print(f'DynamoDB error: {str(e)}')
        return make_response(500, {
            'error': 'Database error',
            'message': 'Error retrieving accounts'
        })
    except Exception as e:
        print(f'Unexpected error: {str(e)}')
        return make_response(500, {
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        })
