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

    const usserCollection = client
      .db("Books_Recommendation")
      .collection("Users");

    const booksCollection = client
      .db("Books_Recommendation")
      .collection("Books");

    app.get("/", (req, res) => {
      res.send("hello world");
    });
    // create users
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usserCollection.insertOne(user);
      res.send(result);
    });

    // get all users
    app.get("/users", async (req, res) => {
      const query = {};
      const cursor = usserCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });

    // get all books
    app.get("/books", async (req, res) => {
      const query = {};
      const cursor = booksCollection.find(query);
      const books = await cursor.toArray();
      res.send(books);
    });

    app.listen(port, () => {
      console.log(`server is running on port ${port}`);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
