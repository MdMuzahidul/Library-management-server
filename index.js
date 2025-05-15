const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoose = require("mongoose");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// muzahid
// 9YvK4ZQnMHQTJJ5A

const uri =
  "mongodb+srv://muzahid:9YvK4ZQnMHQTJJ5A@cluster0.q9owr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const usserCollection = client
      .db("Books_Recommendation")
      .collection("Users");

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usserCollection.insertOne(user);
      res.send(result);
    });

    app.get("/", (req, res) => {
      res.send("hello world");
    });

    app.listen(port, () => {
      console.log(`server is running on port ${port}`);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
