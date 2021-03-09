import CustomerStatementsReport from "../model/customerStatementsReport";
import {DynamoDB} from 'aws-sdk';
const dynamo = new DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

export default class CustomerStatementDynamoClient {
    table: string;

    constructor(table = (process.env.CUSTOMER_STATEMENT_TABLE as string),
                region = (process.env.CUSTOMER_STATEMENT_APP_REGION as string)) {
        this.table = table;
    }

    async readAll(): Promise<any> {
        return await dynamo.scan({ TableName: this.table })
            .promise()
            .then(result => result.Items);
    }

    async read(id: any): Promise<any> {
        const params = {
            TableName: this.table,
            Key: {
                KEY_NAME: { S: id },
            }
        };
        return await dynamo.get(params)
            .promise()
            .then(result => result.Item);
    }

    async write(item: CustomerStatementsReport) {
        const params = {
            TableName: this.table,
            Item: item
        };
        return await dynamo.put(params).promise();
    }
}
