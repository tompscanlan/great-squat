
// Create a DocumentClient that represents the query to add an item
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";


let ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Get the DynamoDB table name from environment variable
const tableName = process.env.SAMPLE_TABLE;

function bail(statusCode, message) {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    },
    body: JSON.stringify(message)
  };
}

export const scanRequestHandler = async (event) => {

  console.info("event: ", event);
  console.info(" table:", tableName);

  let body = undefined
  let domain = undefined
  console.log("event:", event)
  try {
  
    // body = event.body
    if (event.domain) {
      domain = event.domain
    } else if (event.body) {
      body = JSON.parse(event.body)
      domain = body.domain
    } else {
      return bail(500, "no domain passed in")
    }
  } catch (err) {
    bail(500, err)
  }

  console.log("domain: ", domain);
if (domain == undefined) { 
  return bail(500, "no domain found")

}

  // write the domain to the DB
  var params = {
    TableName: tableName,
    Item: {
      "Domain": domain,
      "Request Date": Date.now().toString(),
      "extra": "extra"
    }
  };

  console.log("params: ", params);
  let data
  try {
    data = await ddbDocClient.send(new PutCommand(params));
  } catch (err) {
    return bail(500, "db send error " + err);
  }
  console.log("data: ", data);

  // Get the SQS queue name from environment variable
  const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
  if (!SQS_QUEUE_URL) {
    return bail(500, "No SQS_QUEUE_URL")
  }
  console.log("SQS_QUEUE_URL:", SQS_QUEUE_URL);


  //Write the domain to a queue
  const client = new SQSClient({});
  const command = new SendMessageCommand({
    QueueUrl: SQS_QUEUE_URL,
    DelaySeconds: 10,
    MessageAttributes: {
      domain: {
        DataType: "String",
        StringValue: domain
      },
      date: {
        DataType: "String",
        StringValue: Date.now().toString()
      }
    },
    MessageBody: "information containing domains to scan for",
  });

  try {
    const resp = await client.send(command);
    console.log("Success - item sent to queue", resp);
  } catch (err) {
    return bail(500, err);

  }


  // then exit happy
  return bail(200, JSON.stringify(body))
};
