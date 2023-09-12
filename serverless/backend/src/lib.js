
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';


const bail = (statusCode, message) => {
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

  // Get the latest record for this domain
async function getLatestScanRequest(ddbDocClient, tableName, domain) {

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

    console.log("getLatestScanRequest params: ", params);
    let latest_scan
    try {
        latest_scan = await ddbDocClient.send(new QueryCommand(params));
    } catch (err) {
        throw err;
    }
    console.log("getLatestScanRequest data: ", latest_scan);

    return latest_scan
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

  
  export { bail, getLatestScanRequest, isValidDomain, parseDomainsFromText}