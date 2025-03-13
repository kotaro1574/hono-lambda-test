import * as cdk from "aws-cdk-lib";
import * as httpApi from "aws-cdk-lib/aws-apigatewayv2";
import * as httpIntegrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as dotenv from "dotenv";

// .envファイルを読み込む
dotenv.config();

export class HonoLambdaTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fn = new NodejsFunction(this, "lambda", {
      entry: "lambda/index.ts",
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || "",
        VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || "",
      },
    });

    fn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    const integration = new httpIntegrations.HttpLambdaIntegration(
      "LambdaIntegration",
      fn
    );

    const httpApiGateway = new httpApi.HttpApi(this, "HttpApi", {
      apiName: "hono-http-api",
      description: "HTTP API for Hono application",
    });

    httpApiGateway.addRoutes({
      path: "/{proxy+}",
      methods: [httpApi.HttpMethod.ANY],
      integration: integration,
    });

    new cdk.CfnOutput(this, "HttpApiUrl", {
      value: httpApiGateway.url || "",
      description: "HTTP API URL",
    });
  }
}
