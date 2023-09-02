
// Create a DocumentClient that represents the query to add an item
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

//DynamoDB Endpoint
const ENDPOINT_OVERRIDE = process.env.ENDPOINT_OVERRIDE;
let ddbClient = undefined;

if (ENDPOINT_OVERRIDE) {
  ddbClient = new DynamoDBClient({ endpoint: ENDPOINT_OVERRIDE });
}
else {

  ddbClient = new DynamoDBClient({});    // Use default values for DynamoDB endpoint
  console.warn("No value for ENDPOINT_OVERRIDE provided for DynamoDB, using default");
}

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
let body = {
  "message": "hello world!"
}
export const putItemHandler = async (event) => {

  // handle cors request for everything but POST
  if (event.httpMethod !== 'POST') {
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,HEAD"
      },
      body: JSON.stringify(body)
    };
    return response;
  }

  // All log statements are written to CloudWatch
  console.info('received event ', event, " for table:", tableName);

  const body = JSON.parse(event.body)
  const domain = body.domain

  // write the domain to the DB
  var params = {
    TableName: tableName,
    Item: { "Domain": domain, "Request Date": Date.now().toString() }
  };

  try {
    const data = await ddbDocClient.send(new PutCommand(params));
    console.log("Success - item added or updated", data);
  } catch (err) {
    console.error("Error adding or updating item:", err.message);
    console.error("Error code:", err.code);
    console.error("Error name:", err.name);
    console.error("Error stack:", err.stack);

    throw err;
  }


  //Write the domain to a queue
const client = new SQSClient({});
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
if (!SQS_QUEUE_URL) {
  throw new Error("No value for SQS_QUEUE_URL provided");
} else {
  console.log("SQS_QUEUE_URL:", SQS_QUEUE_URL);
}

  const command = new SendMessageCommand({
    QueueUrl: SQS_QUEUE_URL,
    DelaySeconds: 10,
    MessageAttributes: {
      Title: {
        DataType: "String",
        StringValue: "The Whistler",
      },
      Author: {
        DataType: "String",
        StringValue: "John Grisham",
      },
      WeeksOn: {
        DataType: "Number",
        StringValue: "6",
      },
    },
    MessageBody:
      "Information about current NY Times fiction bestseller for week of 12/11/2016.",
  });

  const resp = await client.send(command);
  console.log(resp);

  // then exit happy
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    },
    body: JSON.stringify(body)
  };

  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
};
