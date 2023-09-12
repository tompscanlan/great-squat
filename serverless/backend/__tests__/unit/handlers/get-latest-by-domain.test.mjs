import { getHandler } from '../../../src/handlers/get-latest-request-by-domain.mjs';
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';


describe('Test get latest by domain', function () {
    const ddbMock = mockClient(DynamoDBDocumentClient);

    it('should have a handler function', async () => {
        expect(getHandler).toBeDefined();
    });

    it('should fail with no domain given', async () => {
        var event = {
        };
        const result = await getHandler(event)

        expect(result).toBeDefined();
        expect(result.statusCode).toEqual(500);
        expect(result.body).toMatch(/domain/);
    });

    it('should pass a basic run with domain', async () => {
        var event = {
            pathParameters: {
                domain: "google.com"
            }
        };

        var item ={
            domain: "google.com",
            date: "1694444074",
            permutations_generated: 5
        };
        ddbMock.on(QueryCommand).resolves({
            Item: item,
        }); 

        const result = await getHandler(event)

        expect(result).toBeDefined();
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify({Item: item}));
    });

    it('should handle a db error', async () => {
        var event = {
            pathParameters: {
                domain: "google.com"
            }
        };

        var item ={
            domain: "google.com",
            date: "1694444074",
            permutations_generated: 5
        };
        ddbMock.on(QueryCommand).rejects({"error" : "db error!"})

        const result = await getHandler(event)

        expect(result).toBeDefined();
        expect(result.statusCode).toEqual(500);
        expect(result.body).toMatch(/db error/);
    });
});
