
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
            const { domain, body } = record;

            if (domain) {
                const permutations = generatePermutations(domain);
                permutations.forEach(async permutation => {
                    console.log("permutation: ", permutation);
                    const params = {
                        MessageBody: permutation,
                        QueueUrl: SQS_QUEUE_URL
                    };
                    const command = new SendMessageCommand(params);

                    const resp = await sqsClient.send(command);
                    console.log(resp);
                });
            }

        });

        return response;
    } else {
        throw new Error("event.Records is not an array");
    }
}

function generatePermutations(domain) {
    const permutations = [];
    const domainParts = domain.split('.');
    for (let i = 0; i < domainParts.length; i++) {
        const subdomain = domainParts.slice(i).join('.');
        permutations.push(subdomain);
    }
    return permutations;
}