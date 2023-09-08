import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const tableName = process.env.REQUEST_TABLE;


export const getAllResultsHandler = async (event) => {
    var domain = event.pathParameters.domain

    if (!domain) {
        const errResponse = {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: "error: no domain passed in"
        };
        console.error("error: no domain passed in");

        return errResponse;
    }


    var result = undefined;
    let ddbClient = new DynamoDBClient({});    // Use default values for DynamoDB endpoint
    const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

    try {
        var params = {
            IndexName: 'gsiAll',
            KeyConditionExpression: 'related_to = :dom',
            ExpressionAttributeValues: {
                ':dom': domain,
            },
            TableName: tableName
        };
        result = await ddbDocClient.send(new QueryCommand( params));
    } catch (error) {
        const errResponse = {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: error
        };
        console.error("Error in query:", error);
        
        return errResponse;
    }

    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify(result.Items)
    };
    return response;
}