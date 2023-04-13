import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { Stage } from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import { pipelines } from 'aws-cdk-lib';
import { Environment } from 'aws-cdk-lib';

import { ResourceStack } from './resource_stack/resource_stack';


// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class DeployStage extends Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props),
      new ResourceStack(this, 'ResourceStack', { stackName: 'awsResourceStack' });
  }

}

export class TypeScriptStack extends Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  }
  // The code that defines your stack goes here
  git_source = pipelines.CodePipelineSource.connection(
    'hris699/AWS_CDK_mini_project',
    'main', {
    connectionArn: 'arn:aws:codestar-connections:ap-south-1:916041404420:connection/3d7eb5e6-f1dc-407c-814b-c51e6568a462'
  })

  

  synth_step = new pipelines.ShellStep("Synth", {
    commands: [
      'npm ci',
      'npm build',
      'npx cdk synth'
    ],
    input: this.git_source
  }
  )

  pipeline = new pipelines.CodePipeline(
    this, 'CodePipeline',{
    selfMutation: true,
    synth:this.synth_step,
    pipelineName: 'cdk_pipeline'
    },
    
)

deployment_wave = this.pipeline.addWave("DeploymentWave")

stage = this.deployment_wave.addStage(new DeployStage(
  this, 'DeployStage',{env: {account:'916041404420', region:'us-east-1'}})

)
}
