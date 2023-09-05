import dns from "dns/promises";

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const RESOLVER_TABLE = process.env.RESOLVER_TABLE;
const dns_resolver = new dns.Resolver();
dns_resolver.setServers(['8.8.8.8']);

const dnsOptions = {
    // available options
    // dns: dns server ip address or hostname (string),
    // port: dns server port (number),
    // recursive: Recursion Desired flag (boolean, default true, since > v1.4.2)
};

const marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false, // false, by default.
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: true, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: true, // false, by default.
};

const unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false, // false, by default.
};
const translateConfig = { marshallOptions, unmarshallOptions };


const body = { 'message': 'normal' };
let response = {
    Records: [],
    statusCode: 200,
    body: body
};

export async function handler(event, context) {
    console.info("event: ", event);
    // console.info("context: ", context);

    // events coming from sqs are shaped like this.
    // if event records is not array, then we can't process it.
    if (!Array.isArray(event.Records)) {
        throw new Error("event.Records is not an array");
    }

    
    let ddbClient = new DynamoDBClient({});
    const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, translateConfig);

    for (let i = 0; i < event.Records.length; i++) {
        let record = event.Records[i];
        let response_record = record;

        console.log("response record: ", response_record);
        const { domain, body } = record;
        if (!domain) {
            response_record.error = "No domain found in record";
        }
        response_record.date = Date.now().toString();

        try {
            response_record.resolves = await dns_resolver.resolve4(domain);
        } catch (err) {
            response_record.resolver_error = err;
        }

        // DB update with results
        try {
            response_record.db_response = await ddbDocClient.send(new PutCommand(
                {
                    TableName: RESOLVER_TABLE,
                    Item: {
                        "domain": domain,
                        date: response_record.date,
                        resolves: response_record.resolves,
                        resolver_error: response_record.resolver_error,
                        error: response_record.error,
                    },
                }
            ));
            console.log("db_response: ", response_record.db_response);
        } catch (err) {
            response_record.db_error = err;
        }

        // record.db_record = db_record;;
        response.Records.push(response_record);
    }
console.log("response: ", response);
    return response;
}

async function resolve_it(dns2, domain) {
    // await new Promise(resolve => {
    //     setTimeout(resolve({ "message": "timed out" }), 500)
    // })
    const result = await dns2.resolveA(domain);
    return result.answers;
}