// Create a DocumentClient that represents the query to add an item
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";


let ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Get the services names from environment variable
const tableName = process.env.REQUEST_TABLE;
const REQUEST_SQS_QUEUE_URL = process.env.REQUEST_SQS_QUEUE_URL;

if (!tableName) {
  bail(500, "No REQUEST_TABLE")
}
if (!REQUEST_SQS_QUEUE_URL) {
  bail(500, "No REQUEST_SQS_QUEUE_URL")
}



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

//   {
//     "IndexName": "index",
//     "KeyConditionExpression": "pk = :pk",
//     "ExpressionAttributeValues": {
//         ":pk": {
//             "S": "order_B"
//         }
//     },
//     "Limit": "1",
//     "ScanIndexForward": false,
//     "TableName": "Application"
// }
  // write the domain to the DB
  var params = {
    TableName: tableName,
    Item: {
      "domain": domain,
      "date": Date.now().toString(),
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



  //Write the domain to a queue
  const client = new SQSClient({});
  const command = new SendMessageCommand({
    QueueUrl: REQUEST_SQS_QUEUE_URL,
    MessageAttributes: {
      domain: {
        DataType: "String",
        StringValue: domain
      }
    },
    MessageBody: "information containing domains to scan for",
  });

  // send to the queue
  try {
    const resp = await client.send(command);
    console.log("Success - item sent to queue", resp);
  } catch (err) {
    return bail(500, err);

  }


  // then exit happy
  return bail(200, JSON.stringify(body))
};
