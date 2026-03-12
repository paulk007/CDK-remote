import { Construct } from "constructs";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { RemovalPolicy } from "aws-cdk-lib";
import { Table, AttributeType } from "aws-cdk-lib/aws-dynamodb";

interface HitCounterProps {
    /** The function for which we want to count url hits **/
    downstream: lambda.IFunction;
}

export class HitCounter extends Construct {
    public readonly handler: lambda.Function;
    public readonly table: Table;
    constructor(scope: Construct, id: string, props: HitCounterProps) {
        super(scope, id);

        this.table = new Table(this, 'HitsTable', {
            partitionKey: { name: 'path', type: AttributeType.STRING },
        });

        this.handler = new lambda.Function(scope, `${id}Handler`, {
            runtime: lambda.Runtime.NODEJS_22_X,
            code: lambda.Code.fromAsset('lambda'),
            handler: 'hitcounter.handler',
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: this.table.tableName
            }
        });
        props.downstream.grantInvoke(this.handler);

        this.table.grantReadWriteData(this.handler);
    }
}