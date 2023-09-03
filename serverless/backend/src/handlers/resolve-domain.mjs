import dns2 from 'dns2';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const RESOLVER_TABLE = process.env.RESOLVER_TABLE;


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
    removeUndefinedValues: false, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: true, // false, by default.
};

const unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false, // false, by default.
};
const translateConfig = { marshallOptions, unmarshallOptions };


const body = { 'message': 'normal' };
const response = {
    Records: [],
    statusCode: 200,
    body: body
};

export async function handler(event, context) {

    console.info("event: ", event);
    // console.info("context: ", context);


    // events coming from sqs are shaped like this.
    // if event records is an array, then we can process it.
    if (Array.isArray(event.Records)) {

        // DB prep
        const client = new DynamoDBClient(
            // { region: "us-east-1" }
        );
        const ddbDocClient = DynamoDBDocument.from(client, translateConfig);

        // dns look ups
        const dnsresolver = new dns2(dnsOptions);


        event.Records.forEach(async record => {
            // console.info("record: ", record);
            
            // for each record, resolve the domain
            const { domain: domain, body } = record;
            let db_record = {}

            // could be passed a bad record.
            // only process if there is a domain
            if (domain) {
                console.log("domain: ", domain);

                db_record = {
                    "Domain": domain,
                    "Request Date": Date.now().toString(),
                    resolves: await resolves(dnsresolver, domain)
                    // "resolves": { "msg": "test" }
                }

                //DB
                // let r = await dbSend(client,
                //     {
                //         TableName: RESOLVER_TABLE,
                //         Item: db_record,
                //     }
                // );
                // console.log("DB response: ", r);

            } else {
                console.log("NO domain in record.");
                db_record.message = "no domain in record";
            }

            response.Records.push(db_record);
        });

        return response;
    } else {
        throw new Error("event.Records is not an array");
    }
}

async function resolves(dns2, domain) {
    // await new Promise(resolve => {
    //     setTimeout(resolve({ "message": "timed out" }), 500)
    // })
    const result = await dns2.resolveA(domain);
    return result.answers;
}

const dbSend = async (client, data) => {
    const command = new PutCommand(data);

    const response = await client.send(command);
    console.log(response);
    return response;
};