#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ReactStack } from '../lib/stack';

const app = new cdk.App();
new ReactStack(app, 'StaticReactApp');
