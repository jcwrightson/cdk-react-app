#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { WafStack, ReactStack } from "../lib/stack";

const app = new cdk.App();
new WafStack(app, "WafStack", {
  env: {
    region: "us-east-1",
  },
});
new ReactStack(app, "StaticReactApp");
