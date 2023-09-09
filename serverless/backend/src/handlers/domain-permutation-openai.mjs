
import { BackupTypeFilter } from "@aws-sdk/client-dynamodb";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import OpenAI from "openai";


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



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

        for (let i = 0; i < event.Records.length; i++) {
            let record = event.Records[i];

            // // get domain from record
            // const { domain } = record;
            // if (!domain) {
            //     throw new Error("No domain found");
            // }

            // get domain from messageAttributes
            const { messageAttributes } = record;
            if (!messageAttributes) {
                throw new Error("No messageAttributes found");
            }

            console.log("messageAttributes: ", messageAttributes);
            const domain = messageAttributes.domain.stringValue

            const permutations = await generatePermutations(domain);
            // permutations.push(domain);

            // permutations.forEach(async permutation => {
            for (let i = 0; i < permutations.length; i++) {
                let permutation = permutations[i];
                const params = {
                    QueueUrl: SQS_QUEUE_URL,
                    MessageBody: JSON.stringify(
                        {
                            "domain": permutation,
                            "related_to": domain
                        })
                };

                // send to the queue
                try {
                    console.log("sending to queue: ", params);
                    const resp = await sqsClient.send(new SendMessageCommand(params));
                    console.log("Sent to queue:", resp);
                } catch (err) {
                    console.error("Error sending to queue: ", err);
                    throw err;
                }
            }

        }

        return response;
    } else {
        throw new Error("event.Records is not an array");
    }
}

async function generatePermutations(domain) {
    console.log("permutations on domain: ", domain);
    let permutations = [];
    const domainParts = domain.split('.');

    permutations.push("a" + domain);
    permutations.push(domainParts[0] + "s." + domainParts[1]);

    let aiPermutations = await generatePermutationsOpenAI(domain);
    for (let p = 0; p < aiPermutations.length; p++) {
        permutations.push(aiPermutations[p]);
    }


    return permutations;
}

async function generatePermutationsOpenAI(domain) {
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
    const prompt =  `Provide some common types of typos or mistakes that might occur 
    in a domain name, for the domain name "${domain}".  only generate 20 responses,
    and don't say anything except the list, with no numbers.`

    console.log("prompt: ", prompt);

    return prompt;
  }