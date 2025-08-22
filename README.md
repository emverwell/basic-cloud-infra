# basic-cloud-infra
Basic Cloud Infrastructure for deploying Apps using an ALB

Using CDK in TypeScript to test Apps that use ECS

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
* `cdk destroy`     destroy the stack from your default AWS account/region

## Prerequisites

1. Node.js and npm installed
2. AWS CLI installed and configured
3. AWS CDK CLI installed (`npm install -g aws-cdk`)

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Build the project:
   ```
   npm run build
   ```

3. Deploy the stack:
   ```
   cdk deploy
   ```

## Project Structure

- `bin/` - Contains the entry point for the CDK app
- `lib/` - Contains the stack definitions
- `test/` - Contains test files
