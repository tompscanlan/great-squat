
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import OpenAI from "openai";

const body = { 'message': 'normal' };
const response = {
    Records: [],
    statusCode: 200,
    body: body
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


let ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, translateConfig);


const tableName = process.env.REQUEST_TABLE;
if (!tableName) {
  throw new Error ("No REQUEST_TABLE")
}
const PERMUTATIONS_SQS_QUEUE_URL = process.env.PERMUTATIONS_SQS_QUEUE_URL;
if (!PERMUTATIONS_SQS_QUEUE_URL) {
    throw new Error("No value for PERMUTATIONS_SQS_QUEUE_URL provided");
}


const sqsClient = new SQSClient({});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function handler(event, context) {

    console.info("event: ", event);
    console.info("context: ", context);
    if (Array.isArray(event.Records)) {


        for (let i = 0; i < event.Records.length; i++) {
            let record = event.Records[i];
            const { messageAttributes } = record;
            if (!messageAttributes) {
                throw new Error("No messageAttributes found");
            }

            console.log("messageAttributes: ", messageAttributes);
            const domain = messageAttributes.domain.stringValue

            const permutations = await generatePermutationsOpenAI(openai,domain);
            await updateDbWithPermutations(domain, permutations);
            // send each permutation to the queue
            for (let i = 0; i < permutations.length; i++) {
                let permutation = permutations[i];
                const params = {
                    QueueUrl: PERMUTATIONS_SQS_QUEUE_URL,
                    MessageBody: JSON.stringify(
                        {
                            "domain": permutation,
                            "related_to": domain
                        })
                };

                console.log("sending to queue: ", params);
                try {
                    const resp = await sqsClient.send(new SendMessageCommand(params));
                } catch (err) {
                    throw err;
                }
            }

        }

        return response;
    } else {
        throw new Error("event.Records is not an array");
    }
}

async function updateDbWithPermutations(domain, permutations) {

    let latest = await getLatestScan(domain);
    console.log("updateDbWithPermutations latest: ", latest);
    const command = new UpdateCommand({
        TableName: tableName,
        Key: {
            domain: domain,
            date: latest.Items[0].date,
        },
        UpdateExpression: "set permutations_generated = :permutations",
        ExpressionAttributeValues: {
            ":permutations": permutations.length,
        },
        ReturnValues: "ALL_NEW",
    });

    console.log("updateDbWithPermutations command: ", command);
    const response = await ddbDocClient.send(command);
    console.log(response);
    return response;
}

// Get the latest record for this domain
async function getLatestScan(domain) {

    var params = {
        TableName: tableName,
        KeyConditionExpression: '#domain = :domain',
        ExpressionAttributeNames: {
            '#domain': 'domain',
        },
        ExpressionAttributeValues: {
            ':domain': domain
        },
        ScanIndexForward: false,
        Limit: 1
    };

    console.log("getLatestScan params: ", params);
    let latest_scan
    try {
        latest_scan = await ddbDocClient.send(new QueryCommand(params));
    } catch (err) {
        throw err;
    }
    console.log("getLatestScan data: ", latest_scan);

    return latest_scan
}

// async function generatePermutations(domain) {
//     console.log("permutations on domain: ", domain);
//     let permutations = [];

//     let aiPermutations = await generatePermutationsOpenAI(domain);
//     for (let p = 0; p < aiPermutations.length; p++) {
//         permutations.push(aiPermutations[p]);
//     }
//     return permutations;
// }

async function generatePermutationsOpenAI(openai, domain) {
    console.log("open ai permutations on domain: ", domain);

    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: 'user', content: generatePrompt(domain) }],
        // temperature: 0.6
    });

    console.log("chatCompletion.choices: ", chatCompletion.choices);

    let domainList = parseDomainsFromText(chatCompletion.choices[0].message.content);
    console.log("domainList: ", domainList);
    return domainList;

}

function isValidDomain(domain) {
    // Regular expression pattern for a valid domain name
    const domainPattern = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return domainPattern.test(domain);
}


function parseDomainsFromText(text) {
    if (!text) {
        return [];
    }
    const domainList = text.split(/\s+/).filter((str) => isValidDomain(str));
    return domainList;
}


function generatePrompt(domain) {
    const prompt = `You are a tool to help prevent typo-squatting. When given a domain name,
    respond with a permutation of the domain that a typo-squatter might use. Include alternate top level domains like .net, .org, .co, etc.
    Make sure to only use valid tlds.
    Include common typos like transposed letters, missing letters, extra letters, etc. Include homoglyphs like 0 for o, 1 for l, etc. Include subdomains
    such as wal.mart.com for the domain walmart.com.
  
    Generate 25 or fewer responses, with no duplicates.
    
    When responding, don't say anything except the list, and don't use a list number.
    
    What would you respond with for the domain name "${domain}". `

    console.log("prompt: ", prompt);

    return prompt;
}

function generatePromptA(domain) {
    const prompt = `Provide some common types of typos or mistakes that might occur 
    in a domain name, for the domain name "${domain}".  only generate 20 responses,
    and don't say anything except the list, with no numbers.`

    console.log("prompt: ", prompt);

    return prompt;
}