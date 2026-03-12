import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { PipelineType } from "aws-cdk-lib/aws-codepipeline";
import { CodeBuildStep, CodePipeline, CodePipelineSource } from "aws-cdk-lib/pipelines";
import { WorkshopPipelineStage } from "./pipeline-stage";

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const pipeline = new CodePipeline(this, "Pipeline", {
            pipelineName: "WorkshopPipeline",
            pipelineType: PipelineType.V2,
            synth: new CodeBuildStep("SynthStep", {
                input: CodePipelineSource.gitHub("paulk007/CDK-remote", "main", {
                    authentication: cdk.SecretValue.secretsManager("mytoken"), // see note below
                }),
                commands: [
                    "npm ci",
                    "npm run build",
                    "npx cdk synth"
                ],
            }),
        });

        const deploy = new WorkshopPipelineStage(this, "Deploy");
        //adding comment to create git commit
        const deployStage = pipeline.addStage(deploy);

    }
}