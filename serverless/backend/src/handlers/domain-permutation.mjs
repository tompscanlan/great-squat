
import { BackupTypeFilter } from "@aws-sdk/client-dynamodb";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const body = { 'message': 'normal' };
const response = {
    Records: [],
    statusCode: 200,
    body: body
};

export async function handler(event, context) {

    console.info("event: ", event);
    console.info("context: ", context);
    if (Array.isArray(event.Records)) {

        const sqsClient = new SQSClient({});
        const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
        if (!SQS_QUEUE_URL) {
            throw new Error("No value for SQS_QUEUE_URL provided");
        } else {
            console.log("SQS_QUEUE_URL:", SQS_QUEUE_URL);
        }

        event.Records.forEach(record => {
            const { messageAttributes } = record;

            if (!messageAttributes) {
                throw new Error("No messageAttributes found");
            }

            console.log("messageAttributes: ", messageAttributes);
            const domain = messageAttributes.domain.stringValue


            const permutations = generatePermutations(domain);
            permutations.forEach(async permutation => {
                console.log("permutation: ", permutation);
                const params = {
                    QueueUrl: SQS_QUEUE_URL,
                    MessageAttributes: {
                        domain: {
                            DataType: "String",
                            StringValue: permutation
                        }
                    },
                    MessageBody: "domain permutations"
                };
                const command = new SendMessageCommand(params);

                const resp = await sqsClient.send(command);
                console.log(resp);
            });

        });

        return response;
    } else {
        throw new Error("event.Records is not an array");
    }
}

function generatePermutations(domain) {
    console.log("permutations on domain: ", domain);
    let permutations = [];
    const domainParts = domain.split('.');

    permutations.push("a"+domain);
    permutations.push(domainParts[0] + "s." + domainParts[1]);
    
    return permutations;
}