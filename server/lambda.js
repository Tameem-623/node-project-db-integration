// index.mjs
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDB({});
const dynamoDB = DynamoDBDocument.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE;

// Helper function to generate response
const createResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // Configure this according to your needs
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
  },
  body: JSON.stringify(body),
});

// CRUD Operations
const operations = {
  // Create operation
  async create(event) {
    const item = JSON.parse(event.body);
    const params = {
      TableName: TABLE_NAME,
      Item: {
        id: Date.now().toString(), // Generate a unique ID
        ...item,
        createdAt: new Date().toISOString(),
      },
    };

    try {
      await dynamoDB.put(params);
      return createResponse(200, {
        message: "Item created successfully",
        id: params.Item.id,
      });
    } catch (error) {
      return createResponse(500, { error: error.message });
    }
  },

  // Read operation
  async read() {
    const params = {
      TableName: TABLE_NAME,
    };

    try {
      const data = await dynamoDB.scan(params);
      return createResponse(200, data.Items);
    } catch (error) {
      return createResponse(500, { error: error.message });
    }
  },

  // Update operation
  async update(event) {
    const id = event.pathParameters.id;
    const updates = JSON.parse(event.body);

    // Create update expression and attribute values
    const updateExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    Object.keys(updates).forEach((key, index) => {
      updateExpression.push(`#field${index} = :value${index}`);
      expressionAttributeValues[`:value${index}`] = updates[key];
      expressionAttributeNames[`#field${index}`] = key;
    });

    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: "ALL_NEW",
    };

    try {
      const data = await dynamoDB.update(params);
      return createResponse(200, {
        message: "Item updated successfully",
        item: data.Attributes,
      });
    } catch (error) {
      return createResponse(500, { error: error.message });
    }
  },

  // Delete operation
  async delete(event) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        id: event.pathParameters.id,
      },
    };

    try {
      await dynamoDB.delete(params);
      return createResponse(200, {
        message: "Item deleted successfully",
      });
    } catch (error) {
      return createResponse(500, { error: error.message });
    }
  },
};

// Lambda handler
export const handler = async (event) => {
  try {
    // Handle CORS preflight requests
    if (event.httpMethod === "OPTIONS") {
      return createResponse(200, {});
    }

    // Route the request to the appropriate operation
    switch (event.path) {
      case "/create":
        if (event.httpMethod === "POST") {
          return await operations.create(event);
        }
        break;
      case "/read":
        if (event.httpMethod === "GET") {
          return await operations.read();
        }
        break;
      case "/update":
        if (event.httpMethod === "PUT") {
          return await operations.update(event);
        }
        break;
      case "/delete":
        if (event.httpMethod === "DELETE") {
          return await operations.delete(event);
        }
        break;
      case "/":
        return createResponse(200, { name: "Tameem", status: "OK" });
    }

    return createResponse(404, { error: "Not Found" });
  } catch (error) {
    return createResponse(500, { error: error.message });
  }
};
