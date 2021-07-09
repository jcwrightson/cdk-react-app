import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3Deployment from "@aws-cdk/aws-s3-deployment";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "iw-react-app-hosting", {
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: "index.html",
    });

    new s3Deployment.BucketDeployment(
      this,
      "iw-react-app-hosting-deployment",
      {
        sources: [s3Deployment.Source.asset("../build")],
        destinationBucket: bucket,
      }
    );

    new cdk.CfnOutput(this, "Bucket URL", {
      value: bucket.bucketDomainName,
    });
  }
}
