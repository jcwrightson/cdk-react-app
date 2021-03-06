import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3Deployment from "@aws-cdk/aws-s3-deployment";
import * as iam from "@aws-cdk/aws-iam";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
import * as waf from "@aws-cdk/aws-wafv2";

export class WafStack extends cdk.Stack {
  public readonly web_acl: waf.CfnWebACL;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpn_ip_set = new waf.CfnIPSet(this, "vpn-ip-set", {
      addresses: [process.env.VPN_IP_BLOCK ?? "0.0.0.0/0"],
      ipAddressVersion: "IPV4",
      name: "vpnIPSet",
      scope: "CLOUDFRONT",
    });

    this.web_acl = new waf.CfnWebACL(this, "vpn_only_acl", {
      defaultAction: { block: {} },
      scope: "CLOUDFRONT",
      rules: [
        {
          name: "allow_vpn",
          priority: 0,
          statement: {
            ipSetReferenceStatement: {
              arn: vpn_ip_set.attrArn,
            },
          },
          action: {
            allow: {},
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: "allow_vpn",
          },
        },
      ],
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: "vpn_only_acl",
      },
    });

    // Outputs
    new cdk.CfnOutput(this, "Web ACL Arn", {
      value: this.web_acl.attrArn,
    });
  }
}

interface ReactStackProps extends cdk.StackProps {
  readonly web_acl: waf.CfnWebACL;
}
export class ReactStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: ReactStackProps) {
    super(scope, id, props);

    // 1. Bucket to hold our static files
    const bucket = new s3.Bucket(this, "iw-react-app-hosting", {
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: "index.html",
    });

    // 2. Artifact bucket
    new s3Deployment.BucketDeployment(this, "iw-react-app-hosting-deployment", {
      sources: [s3Deployment.Source.asset("../build")], // Take these files
      destinationBucket: bucket, // Put them here
    });


    // 3. CloudFront Distribution
    const distrib = new cloudfront.Distribution(this, "reactAppDist", {
      defaultBehavior: { origin: new origins.S3Origin(bucket) }, // Point to bucket from step #1
      webAclId: `arn:aws:wafv2:us-east-1:${process.env.AWS_ACCOUNT}:global/webacl/vpnonlyacl-fS0ECetxZlIl/97931c9c-48c0-424e-92e9-5278b9f15dc8`,
    });

    // 4. Add permission boundary to all IAM assets
    const boundary = iam.ManagedPolicy.fromManagedPolicyArn(
      this,
      "Boundary",
      `arn:aws:iam::${process.env.AWS_ACCOUNT}:policy/ScopePermissions`
    );

    iam.PermissionsBoundary.of(this).apply(boundary);

    // Outputs
    new cdk.CfnOutput(this, "Cloudfront URL", {
      value: distrib.distributionDomainName,
    });
  }
}
