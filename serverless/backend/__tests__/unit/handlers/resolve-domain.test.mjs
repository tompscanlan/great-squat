import { handler } from "../../../src/handlers/resolve-domain.mjs";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';



describe('Test resolve-domain', function () {
    const ddbMock = mockClient(DynamoDBDocumentClient);

    beforeEach(() => {
        ddbMock.reset();
    });

    it('should have a record structure output', async () => {
        // Return the specified value whenever the spied get function is called 
        ddbMock.on(PutCommand).resolves({});

        const event = {
            Records: [
                {
                    domain: "wontresolve-prettysure.com",
                },
                {
                    domain: "google.com",
                }
            ]
        }
        const result = await handler(event, {});

        expect(result).toBeDefined();
        expect(result.Records).toBeDefined();
        expect(result.Records.length).toEqual(2);


        let answers = result.Records[0].resolves;

        expect(answers).toBeUndefined();
        expect(result.Records[0].resolver_error).toBeDefined();

        expect(result.Records[1].resolves).toBeDefined();
        expect(result.Records[1].resolver_error).toBeUndefined();
    });
});
