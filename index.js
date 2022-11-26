const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@reusedproducts.qtwvoiy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    const categoryCollections = client
      .db("reusedProducts")
      .collection("productsCategories");

    const productsCollections = client
      .db("reusedProducts")
      .collection("allProducts");

    const usersCollections = client.db("reusedProducts").collection("users");
    const bookingCollections = client
      .db("reusedProducts")
      .collection("booking");

    // Get all the prodcuts category
    app.get("/category", async (req, res) => {
      const query = {};
      const result = await categoryCollections.find(query).toArray();
      res.send(result);
    });

    // Get specific prodcuts for specific id
    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { category_id: id };
      const result = await productsCollections.find(query).toArray();
      res.send(result);
    });

    // Get specific prodcuts for specific email
    app.get("/dashboard/my-products", async (req, res) => {
      const email = req.query.email;
      const query = { seller_email: email };
      const result = await productsCollections.find(query).toArray();
      res.send(result);
    });

    // Saved user email and name into database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollections.insertOne(user);
      res.send(result);
    });

    // Get all the seller details
    app.get("/users/seller", async (req, res) => {
      const query = { role: "seller" };
      const result = await usersCollections.find(query).toArray();
      res.send(result);
    });

    // Get all the buyer details
    app.get("/users/buyer", async (req, res) => {
      const query = { role: "buyer" };
      const result = await usersCollections.find(query).toArray();
      res.send(result);
    });

    // Create an API endpoint for delete a buyer
    app.delete("/users/buyer/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollections.deleteOne(query);
      res.send(result);
    });

    // Create an API endpoint for delete a seller
    app.delete("/users/seller/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollections.deleteOne(query);
      res.send(result);
    });

    app.post("/add-products", async (req, res) => {
      const product = req.body;
      const result = await productsCollections.insertOne(product);
      res.send(result);
    });

    app.post("/booking-products", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollections.insertOne(booking);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running and up");
});

app.listen(port, () => {
  console.log(`Server is ruuning on port: ${port}`);
});
