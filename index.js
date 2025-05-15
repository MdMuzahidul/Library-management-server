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

// Connect to MongoDB using Mongoose
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Mongoose connected to MongoDB"))
  .catch((err) => console.error("Mongoose connection error:", err));

// Define the User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  studentId: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create the User model
const User = mongoose.model("User", userSchema);

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db("Books_Recommendation");
    const users = db.collection("Users");
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      department: { type: String, required: true },
      studentId: { type: String, required: true },
      email: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    });

    const result = await users.insertOne(userSchema);
    console.log("✅ User inserted with ID:", result.insertedId);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
  }
}

run();

// API to register a new user
app.post("/api/register", async (req, res) => {
  try {
    const Users = new Users(req.body);
    await Users.save();
    res.status(201).send(Users);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
