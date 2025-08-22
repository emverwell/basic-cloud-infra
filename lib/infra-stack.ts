import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

export interface InfraStackProps extends cdk.StackProps {
  environmentType: string;  // 'Staging' or 'Production'
}

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: InfraStackProps) {
    super(scope, id, props);

    const environment = props.environmentType || 'Development';

    // VPC
    const vpc = new ec2.Vpc(this, `${environment}Vpc`, {
      maxAzs: 2,
      ipAddresses: ec2.IpAddresses.cidr(environment === 'Staging' ? '10.0.0.0/16' : '10.1.0.0/16'),
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, `${environment}Cluster`, {
      vpc,
    });

    // Security Group for ECS Tasks (allow from ALB)
    const ecsSg = new ec2.SecurityGroup(this, `${environment}EcsSg`, {
      vpc,
      allowAllOutbound: true,
    });

    // Public ALB
    const albSg = new ec2.SecurityGroup(this, `${environment}AlbSg`, {
      vpc,
      allowAllOutbound: true,
    });
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP from internet');

    const alb = new elbv2.ApplicationLoadBalancer(this, `${environment}ALB`, {
      vpc,
      internetFacing: true,
      securityGroup: albSg,
    });

    // Listener (HTTP:80)
    const listener = alb.addListener(`${environment}Listener`, {
      port: 80,
      open: true,
    });
    // Add a default fixed response action to satisfy ALB requirements
    listener.addAction('Default', {
      action: elbv2.ListenerAction.fixedResponse(200, {
        contentType: 'text/plain',
        messageBody: 'OK',
      }),
    });

    // Exports
    new cdk.CfnOutput(this, `${environment}ClusterArn`, { value: cluster.clusterArn, exportName: `${environment}-EcsClusterArn` });
    new cdk.CfnOutput(this, `${environment}VpcId`, { value: vpc.vpcId, exportName: `${environment}-VpcId` });
    new cdk.CfnOutput(this, `${environment}PrivateSubnetIds`, { value: vpc.privateSubnets.map(s => s.subnetId).join(','), exportName: `${environment}-PrivateSubnetIds` });
    new cdk.CfnOutput(this, `${environment}AlbArn`, { value: alb.loadBalancerArn, exportName: `${environment}-AlbArn` });
    new cdk.CfnOutput(this, `${environment}ListenerArn`, { value: listener.listenerArn, exportName: `${environment}-ListenerArn` });
    new cdk.CfnOutput(this, `${environment}EcsSgId`, { value: ecsSg.securityGroupId, exportName: `${environment}-EcsSgId` });
    new cdk.CfnOutput(this, `${environment}AlbDnsName`, { value: alb.loadBalancerDnsName, exportName: `${environment}-AlbDnsName` });

    // Tagging
    cdk.Tags.of(this).add('Environment', environment);
  }
}