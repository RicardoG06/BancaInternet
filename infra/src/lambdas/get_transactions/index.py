import json
import os
import boto3
from typing import Dict, Any
from botocore.exceptions import ClientError

# Cliente de DynamoDB
dynamodb = boto3.client('dynamodb')
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

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Handler para obtener transacciones de una cuenta"""
    
    # Manejar preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        return make_response(200, {'message': 'CORS preflight successful'})

    try:
        # Obtener parámetros de la URL
        account_id = event.get('pathParameters', {}).get('accountId')
        
        if not account_id:
            return make_response(400, {
                'error': 'Bad Request',
                'message': 'Account ID is required'
            })

        # Obtener query parameters
        query_params = event.get('queryStringParameters') or {}
        limit = int(query_params.get('limit', 50))
        from_date = query_params.get('from')
        to_date = query_params.get('to')

        # Construir KeyConditionExpression
        key_condition = 'accountId = :accountId'
        expression_values = {
            ':accountId': {'S': account_id}
        }

        if from_date and to_date:
            key_condition += ' AND #timestamp BETWEEN :fromDate AND :toDate'
            expression_values[':fromDate'] = {'S': from_date}
            expression_values[':toDate'] = {'S': to_date}
            expression_names = {'#timestamp': 'timestamp'}
        else:
            expression_names = None

        # Buscar transacciones
        scan_kwargs = {
            'TableName': TRANSACTIONS_TABLE,
            'KeyConditionExpression': key_condition,
            'ExpressionAttributeValues': expression_values,
            'Limit': limit,
            'ScanIndexForward': False  # Orden descendente (más recientes primero)
        }
        
        if expression_names:
            scan_kwargs['ExpressionAttributeNames'] = expression_names

        response = dynamodb.query(**scan_kwargs)

        transactions = []
        total_debits = 0
        total_credits = 0
        completed_count = 0
        failed_count = 0

        for item in response.get('Items', []):
            amount = float(item['amount']['N'])
            
            transaction = {
                'accountId': item['accountId']['S'],
                'timestamp': item['timestamp']['S'],
                'createdAt': item.get('createdAt', {}).get('S', item['timestamp']['S']),
                'type': item['type']['S'],
                'amount': amount,
                'counterparty': item['counterparty']['S'],
                'transferId': item.get('transferId', {}).get('S', ''),
                'status': item.get('status', {'S': 'COMPLETED'})['S'],
                'note': item.get('note', {}).get('S', '')
            }
            
            transactions.append(transaction)
            
            # Calcular estadísticas
            if transaction['type'] == 'DEBIT':
                total_debits += amount
            elif transaction['type'] == 'CREDIT':
                total_credits += amount
                
            if transaction['status'] == 'COMPLETED':
                completed_count += 1
            elif transaction['status'] == 'FAILED':
                failed_count += 1

        summary = {
            'totalTransactions': len(transactions),
            'totalDebits': total_debits,
            'totalCredits': total_credits,
            'completedTransactions': completed_count,
            'failedTransactions': failed_count,
            'netAmount': total_credits - abs(total_debits)
        }

        pagination = {
            'limit': limit,
            'hasMore': 'LastEvaluatedKey' in response
        }

        return make_response(200, {
            'accountId': account_id,
            'transactions': transactions,
            'summary': summary,
            'pagination': pagination,
            'correlationId': event.get('requestContext', {}).get('requestId', '')
        })

    except ClientError as e:
        print(f'DynamoDB error: {str(e)}')
        return make_response(500, {
            'error': 'Database error',
            'message': 'Error retrieving transactions'
        })
    except Exception as e:
        print(f'Unexpected error: {str(e)}')
        return make_response(500, {
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        })
