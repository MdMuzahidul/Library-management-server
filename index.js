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

// const uri = "mongodb+srv://muzahid:9YvK4ZQnMHQTJJ5A@cluster0.q9owr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const uri = "mongodb://localhost:27017";

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

    const borrowedBooksCollection = client
      .db("Books_Recommendation")
      .collection("borrowList");
    const blogCollection = client
      .db("Books_Recommendation")
      .collection("Blogs");

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
      const query = { role: "student" };
      const cursor = usserCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });
    //get single user by email
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usserCollection.findOne(query);
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      res.send(user);
    });

    // get all books with pagination
    app.get("/books", async (req, res) => {
      console.log(req.body);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const query = {};
      const cursor = booksCollection.find(query).skip(skip).limit(limit);
      const books = await cursor.toArray();
      const total = await booksCollection.countDocuments(query);
      res.send({
        books,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      });
    });

    // Helper function to parse genres string
    function parseGenresString(genreStr) {
      return genreStr
        .replace(/^\[|\]$/g, "") // Remove outer [ and ]
        .split(",") // Split by comma
        .map((item) => item.trim()) // Trim whitespace
        .map((item) => item.replace(/^'+|'+$/g, "")); // Remove surrounding single quotes
    }

    // get single book by id
    app.get("/books/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new mongoose.Types.ObjectId(id) };
      const book = await booksCollection.findOne(query);
      if (!book) {
        return res.status(404).send({ message: "Book not found" });
      } else {
        // Use parseGenresString to process genres if it's a string
        if (book.genres && typeof book.genres === "string") {
          book.genres = parseGenresString(book.genres);
        } else if (!book.genres) {
          book.genres = [];
        }
        res.send(book);
      }
    });

    // create borrowed book
    app.post("/borrowed", async (req, res) => {
      const { email, bookId } = req.body;
      if (!email || !bookId) {
        return res
          .status(400)
          .send({ message: "Email and bookId are required" });
      }
      // Check if the combination of email and bookId already exists
      const existingBorrow = await borrowedBooksCollection.findOne({
        email,
        bookId,
      });
      if (existingBorrow) {
        return res.status(409).send({
          message: "This user has already borrowed this book",
        });
      }
      const result = await borrowedBooksCollection.insertOne(req.body);
      res.send(result);
    });

    // get all borrowed books
    app.get("/borrowed", async (req, res) => {
      const query = {};
      const cursor = borrowedBooksCollection.find(query);
      const borrowedBooks = await cursor.toArray();
      res.send(borrowedBooks);
    });

    app.get("/borrowed/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const cursor = borrowedBooksCollection.find(query);
      const borrowedBooks = await cursor.toArray();
      res.send(borrowedBooks);
    });

    // get borrowed books with status 'pending' for a specific email
    app.get("/borrowed/pending/:email", async (req, res) => {
      const email = req.params.email;
      console.log("Fetching pending borrowed books for email:", email);
      const query = { email, status: "pending" };
      const cursor = borrowedBooksCollection.find(query);
      const borrowedBooks = await cursor.toArray();
      res.send(borrowedBooks);
    });
    // get borrowed books with status 'approved' for a specific email
    app.get("/user/approvedbooks/:email", async (req, res) => {
      const email = req.params.email;
      console.log("Fetching approved borrowed books for email:", email);
      const query = { email, status: "approved" };
      const cursor = borrowedBooksCollection.find(query);
      const borrowedBookslist = await cursor.toArray();
      res.send(borrowedBookslist);
    });

    // admin
    // get all users

    app.get("/admin/users", async (req, res) => {
      const query = {};
      const cursor = usserCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });
    // all pending requests for admin
    app.get("/admin/borrowed/pending", async (req, res) => {
      const query = { status: "pending" };
      const cursor = borrowedBooksCollection.find(query);
      const borrowedBooks = await cursor.toArray();
      res.send(borrowedBooks);
    });

    // approve a borrowed book request
    app.patch("/admin/borrowed/approve/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new mongoose.Types.ObjectId(id) };
      const now = new Date();
      const returnDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      const updateDoc = {
        $set: {
          status: "approved",
          approvedDate: now.toISOString(),
          returnDate: returnDate.toISOString(),
        },
      };
      const result = await borrowedBooksCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // get all approved borrowed books
    app.get("/admin/borrowed/approved", async (req, res) => {
      const query = { status: "approved" };
      const cursor = borrowedBooksCollection.find(query);
      const borrowedBooks = await cursor.toArray();
      res.send(borrowedBooks);
    });

    // post a blog
    app.post("/blogs", async (req, res) => {
      const blog = req.body;
      const result = await blogCollection.insertOne(blog);
      res.send(result);
    });

    // get all blogs
    app.get("/blogs", async (req, res) => {
      const query = {};
      const cursor = blogCollection.find(query);
      const blogs = await cursor.toArray();
      res.send(blogs);
    });
    // get a single blog by id
    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new mongoose.Types.ObjectId(id) };
      const blog = await blogCollection.findOne(query);
      res.send(blog);
    });

    // most popular books sorted by rating, likedPercent, and numRatings
    app.get("/books/popular", async (req, res) => {
      const query = {};
      const cursor = booksCollection.find(query).sort({ rating: -1, likedPercent: -1, numRatings: -1 }).limit(10);
      const popularBooks = await cursor.toArray();
      res.send(popularBooks);
    });

    // app.put("/books/edit/bulk", async (req, res) => {
    //   const cursor = booksCollection.find({
    //     awards: { $regex: /^\[.*\]$/ },
    //   });

    //   let updatedCount = 0;

    //   while (await cursor.hasNext()) {
    //     const doc = await cursor.next();
    //     const { _id, awards } = doc;

    //     try {
    //        const matches = [...awards.matchAll(/['"]([^'"]+)['"]/g)];
    //        const _list = matches.map((match) => match[1]);

    //        if (_list.length > 0) {
    //          await booksCollection.updateOne(
    //            { _id },
    //            { $set: { awards: _list } }
    //          );
    //          updatedCount++;
    //        }
    //     } catch (err) {
    //       console.error(
    //         `❌ Failed to parse awards for _id ${_id}:`,
    //         err.message
    //       );
    //     }
    //   }
    //   res.json({ updatedCount });
    // });

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
