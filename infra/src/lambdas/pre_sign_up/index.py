def lambda_handler(event, context):
    """
    Lambda trigger de Cognito para pre-signup
    Auto-confirma usuarios y verifica email automáticamente
    """
    print(f"[INFO] Pre-signup trigger ejecutado: {event}")
    
    # Auto-confirmar el usuario
    event["response"]["autoConfirmUser"] = True
    
    # Auto-verificar el email
    event["response"]["autoVerifyEmail"] = True

    print("[INFO] Usuario auto-confirmado y email auto-verificado")

    return event
