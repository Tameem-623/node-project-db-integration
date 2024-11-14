// server.js
const express = require("express");
const AWS = require("aws-sdk");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// AWS Configuration
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Initialize AWS services
// const dynamodb = new AWS.DynamoDB.DocumentClient();
// const aurora = new AWS.RDSDataService();

// MySQL (RDS) Connection
const rdsConnection = mysql.createPool({
  host: process.env.RDS_ENDPOINT,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DATABASE,
});

// DynamoDB CRUD Operations
// const dynamoDbRoutes = {
//   create: async (req, res) => {
//     const params = {
//       TableName: "YourTableName",
//       Item: {
//         id: Date.now().toString(),
//         ...req.body,
//       },
//     };

//     try {
//       await dynamodb.put(params).promise();
//       res.json({ message: "Item created successfully" });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   read: async (req, res) => {
//     const params = {
//       TableName: "YourTableName",
//     };

//     try {
//       const data = await dynamodb.scan(params).promise();
//       res.json(data.Items);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   update: async (req, res) => {
//     const params = {
//       TableName: "YourTableName",
//       Key: { id: req.params.id },
//       UpdateExpression: "set #name = :name, #description = :description",
//       ExpressionAttributeNames: {
//         "#name": "name",
//         "#description": "description",
//       },
//       ExpressionAttributeValues: {
//         ":name": req.body.name,
//         ":description": req.body.description,
//       },
//     };

//     try {
//       await dynamodb.update(params).promise();
//       res.json({ message: "Item updated successfully" });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   delete: async (req, res) => {
//     const params = {
//       TableName: "YourTableName",
//       Key: { id: req.params.id },
//     };

//     try {
//       await dynamodb.delete(params).promise();
//       res.json({ message: "Item deleted successfully" });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },
// };

// // Aurora CRUD Operations
// const auroraRoutes = {
//   create: async (req, res) => {
//     const params = {
//       database: process.env.AURORA_DATABASE,
//       resourceArn: process.env.AURORA_CLUSTER_ARN,
//       secretArn: process.env.AURORA_SECRET_ARN,
//       sql: "INSERT INTO data_tablex2 (name, description) VALUES (:name, :description)",
//       parameters: [
//         { name: "name", value: { stringValue: req.body.name } },
//         { name: "description", value: { stringValue: req.body.description } },
//       ],
//     };

//     try {
//       await aurora.executeStatement(params).promise();
//       res.json({ message: "Item created successfully" });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   read: async (req, res) => {
//     const params = {
//       database: process.env.AURORA_DATABASE,
//       resourceArn: process.env.AURORA_CLUSTER_ARN,
//       secretArn: process.env.AURORA_SECRET_ARN,
//       sql: "SELECT * FROM data_tablex2",
//     };

//     try {
//       const result = await aurora.executeStatement(params).promise();
//       res.json(result.records);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },
//   // Add update and delete operations similarly
// };

// RDS (MySQL) CRUD Operations
const rdsRoutes = {
  create: (req, res) => {
    const query = "INSERT INTO data_tablex2 SET ?";
    rdsConnection.query(query, req.body, (error, results) => {
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ message: "Item created successfully", id: results.insertId });
    });
  },

  read: (req, res) => {
    const query = "SELECT * FROM data_tablex2";
    rdsConnection.query(query, (error, results) => {
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.json(results);
    });
  },

  update: (req, res) => {
    const query = "UPDATE data_tablex2 SET ? WHERE id = ?";
    rdsConnection.query(query, [req.body, req.params.id], (error) => {
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ message: "Item updated successfully" });
    });
  },

  delete: (req, res) => {
    const query = "DELETE FROM data_tablex2 WHERE id = ?";
    rdsConnection.query(query, [req.params.id], (error) => {
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ message: "Item deleted successfully" });
    });
  },
};

// Routes
// app.post("/dynamodb", dynamoDbRoutes.create);
// app.get("/dynamodb", dynamoDbRoutes.read);
// app.put("/dynamodb/:id", dynamoDbRoutes.update);
// app.delete("/dynamodb/:id", dynamoDbRoutes.delete);

// app.post("/aurora", auroraRoutes.create);
// app.get("/aurora", auroraRoutes.read);

app.post("/create", rdsRoutes.create);
app.get("/read", rdsRoutes.read);
app.put("/update/:id", rdsRoutes.update);
app.delete("/delete/:id", rdsRoutes.delete);

app.get("/", (req, res) => {
  res.status(200).send({ name: "Tameem", status: "OK" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
