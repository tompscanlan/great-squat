import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { bail, getLatestScanRequest } from '../lib.js';

const tableName = process.env.REQUEST_TABLE;

export const getHandler = async (event) => {

    var domain = event && event.pathParameters && event.pathParameters.domain
    if (!domain) {
        return bail(500, "no domain passed in")
    }

    var result = undefined;
    let ddbClient = new DynamoDBClient({});
    const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
    try {
        result = await getLatestScanRequest(ddbDocClient, tableName, domain);
    } catch (error) {
        return bail(500, error)
    }

    return  bail(200, result)
}
