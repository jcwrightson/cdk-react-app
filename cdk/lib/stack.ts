import * as cdk from '@aws-cdk/core';
import * as s3 from "@aws-cdk/aws-s3";
import * as s3Deployment from "@aws-cdk/aws-s3-deployment";
import * as iam from "@aws-cdk/aws-iam";
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
export class ReactStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "iw-react-app-hosting", {
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: "index.html",
    });

    const distrib = new cloudfront.Distribution(this, 'reactAppDist', {
      defaultBehavior: { origin: new origins.S3Origin(bucket) },
    });

    new s3Deployment.BucketDeployment(this, "iw-react-app-hosting-deployment", {
      sources: [s3Deployment.Source.asset("../build")],
      destinationBucket: bucket,
    });

    const boundary = iam.ManagedPolicy.fromManagedPolicyArn(
      this,
      "Boundary",
      `arn:aws:iam::${process.env.AWS_ACCOUNT}:policy/ScopePermissions`
    );

    iam.PermissionsBoundary.of(this).apply(boundary);

    new cdk.CfnOutput(this, "Bucket URL", {
      value: bucket.bucketDomainName,
    });

    new cdk.CfnOutput(this, "Cloudfront URL", {
      value: distrib.distributionDomainName,
    });
  }
}
