#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BancaInternetStack } from '../lib/stacks/banca-internet-stack';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = new cdk.App();

// Obtener variables de entorno
const account = process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID;
const region = process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1';
const environment = process.env.ENVIRONMENT || 'dev';

if (!account) {
  throw new Error('CDK_DEFAULT_ACCOUNT o AWS_ACCOUNT_ID no está configurado');
}

// Crear el stack principal
new BancaInternetStack(app, `BancaInternet-${environment}`, {
  env: {
    account,
    region,
  },
  description: `Banca por Internet - ${environment.toUpperCase()}`,
  environment,
});

app.synth();
