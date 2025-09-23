import json
import os
import boto3
from typing import Dict, Any
from botocore.exceptions import ClientError

# Cliente de DynamoDB
dynamodb = boto3.client('dynamodb')
USERS_TABLE = os.environ['USERS_TABLE_NAME']

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
    """Handler para obtener perfil de usuario"""
    
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

        # Buscar usuario en la tabla Users
        response = dynamodb.get_item(
            TableName=USERS_TABLE,
            Key={'id': {'S': customer_id}}
        )

        if 'Item' not in response:
            return make_response(404, {
                'error': 'Not Found',
                'message': 'User profile not found'
            })

        item = response['Item']
        
        # Extraer datos del usuario
        user_profile = {
            'id': item['id']['S'],
            'email': item['email']['S'],
            'name': item.get('name', {}).get('S', ''),
            'givenName': item.get('givenName', {}).get('S', ''),
            'familyName': item.get('familyName', {}).get('S', ''),
            'createdAt': item['createdAt']['S'],
            'updatedAt': item.get('updatedAt', {}).get('S', item['createdAt']['S']),
            'status': item.get('status', {'S': 'ACTIVE'})['S'],
            'customerType': item.get('customerType', {'S': 'INDIVIDUAL'})['S'],
            'riskProfile': item.get('riskProfile', {'S': 'CONSERVATIVE'})['S'],
            'preferences': {}
        }

        # Extraer preferencias si existen
        if 'preferences' in item:
            preferences = item['preferences']['M']
            user_profile['preferences'] = {
                'notifications': {
                    'email': preferences.get('notifications', {}).get('M', {}).get('email', {}).get('BOOL', True),
                    'sms': preferences.get('notifications', {}).get('M', {}).get('sms', {}).get('BOOL', False)
                },
                'language': preferences.get('language', {}).get('S', 'es'),
                'currency': preferences.get('currency', {}).get('S', 'USD')
            }

        return make_response(200, {
            'profile': user_profile,
            'correlationId': event.get('requestContext', {}).get('requestId', '')
        })

    except ClientError as e:
        print(f'DynamoDB error: {str(e)}')
        return make_response(500, {
            'error': 'Database error',
            'message': 'Error retrieving user profile'
        })
    except Exception as e:
        print(f'Unexpected error: {str(e)}')
        return make_response(500, {
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        })

