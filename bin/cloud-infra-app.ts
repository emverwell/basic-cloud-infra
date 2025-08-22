#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack';
import * as yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const app = new cdk.App();

interface EnvironmentConfig {
  name: string;
  stackId: string;
  account: string;
  region: string;
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('env', {
    alias: 'e',
    describe: 'Environment name (e.g., Staging, Production)',
    type: 'string',
    demandOption: true,
  })
  .option('account', {
    alias: 'a',
    describe: 'AWS account ID',
    type: 'string',
    demandOption: true,
  })
  .option('region', {
    alias: 'r',
    describe: 'AWS region',
    type: 'string',
    default: 'us-east-1',
  })
  .help()
  .parseSync();

const envConfig: EnvironmentConfig = {
  name: argv.env,
  stackId: `Infra${argv.env}Stack`,
  account: argv.account,
  region: argv.region,
};

new InfraStack(app, envConfig.stackId, {
  environmentType: envConfig.name,
  env: { account: envConfig.account, region: envConfig.region },
});

app.synth();