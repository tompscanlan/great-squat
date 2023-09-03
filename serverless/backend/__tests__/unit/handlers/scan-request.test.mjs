// Import putItemHandler function from put-item.mjs 
import { scanRequestHandler } from '../../../src/handlers/scan-request.mjs';
// Import dynamodb from aws-sdk 
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from "aws-sdk-client-mock";

describe('Test scanRequestHandler', function () {
    const ddbMock = mockClient(DynamoDBDocumentClient);

    beforeEach(() => {
        ddbMock.reset();
    });


    // it('should fail if no queue', async () => {
    //     const event = {
    //         httpMethod: 'POST',
    //         body: '{"domain": "testing.com"}'
    //     };
    //     const result = await scanRequestHandler(event);

    //     const expectedResult = {
    //         statusCode: 500,
    //         headers: {
    //             "Access-Control-Allow-Headers": "Content-Type",
    //             "Access-Control-Allow-Origin": "*",
    //             "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    //         },
    //     };

    //     // Compare the result with the expected result 
    //     expect(result).toEqual(expectedResult);
    // });

    // it('should progress if there is a queue', async () => {
    //     const event = {
    //         httpMethod: 'POST',
    //         body: '{"domain": "testing.com"}'
    //     };
    //     process.env.SQS_QUEUE_URL = "some_url";
    //     const result = await scanRequestHandler(event);

    //     const expectedResult = {
    //         statusCode: 500,
    //         headers: {
    //             "Access-Control-Allow-Headers": "Content-Type",
    //             "Access-Control-Allow-Origin": "*",
    //             "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    //         },
    //         body: expect.not.stringContaining("SQS_QUEUE_URL")
    //     };

    //     // Compare the result with the expected result 
    //     expect(result).toEqual(expectedResult);
    // });

    it('should work in general', async () => {
        process.env.SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/433321780850/great-squat-scan-requests";
        const event = {
            httpMethod: 'POST',
            body: {
                "domain": "testing.com"
            }

        };
        const result = await scanRequestHandler(event);

        const expectedResult = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: expect.stringContaining("testing.com")
        };

        // Compare the result with the expected result 
        expect(result).toEqual(expectedResult);

    }
    );

});
