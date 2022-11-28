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
      const query = {
        category_id: id,
        isPayed: false,
        isAvailabe: true,
      };
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

    // Endpoint for delete a products from my products in dashboard
    app.delete("/dashboard/my-products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollections.deleteOne(query);
      res.send(result);
    });

    // Saved user email and name into database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollections.insertOne(user);
      res.send(result);
    });

    // Check user role user admin or seller
    app.get("/users/role/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await usersCollections.findOne(query);
      if (result?.role === "admin") {
        res.send({ isAdmin: result?.role === "admin" });
      }
      if (result?.role === "seller") {
        res.send({ isSeller: result?.role === "seller" });
      }
    });

    // Get all the seller details
    app.get("/users/seller", async (req, res) => {
      const query = { role: "seller" };
      const result = await usersCollections.find(query).toArray();
      res.send(result);
    });

    //get seller for verification
    app.get("/users/verify", async (req, res) => {
      const email = req.query.email;
      const query = { email: email, role: "seller" };
      const result = await usersCollections.findOne(query);
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

    // check user verify or not
    app.patch("/users/seller/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          isVerifyed: status.status,
        },
      };
      const result = await usersCollections.updateOne(query, updateDoc);
      res.send(result);
    });

    // add a products
    app.post("/add-products", async (req, res) => {
      const product = req.body;
      const result = await productsCollections.insertOne(product);
      res.send(result);
    });

    // create booked products API endpoint
    app.post("/booking-products", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollections.insertOne(booking);
      res.send(result);
    });

    // booked a products for sell
    app.get("/booking-products", async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const result = await bookingCollections.find(query).toArray();
      res.send(result);
    });

    // api endpoint for ad post
    app.get("/ad", async (req, res) => {
      const query = { showAd: true, isAvailabe: true, isPayed: false };
      const result = await productsCollections.find(query).toArray();
      res.send(result);
    });

    //  api endpoint for ad update
    app.patch("/ad/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          showAd: status.status,
        },
      };
      const result = await productsCollections.updateOne(query, updateDoc);
      res.send(result);
    });

    // Endpoint for check products availability
    app.patch("/stock/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          isAvailabe: status.status,
          showAd: status.ad,
        },
      };
      const result = await productsCollections.updateOne(query, updateDoc);
      res.send(result);
    });

    // Get report products
    app.get("/reported-items", async (req, res) => {
      const query = { isReported: true };
      const result = await productsCollections.find(query).toArray();
      res.send(result);
    });

    // Get report products
    app.patch("/reported-items/:id", async (req, res) => {
      const id = req.params.id;
      const report = req.body;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          isReported: report.report,
        },
      };
      const result = await productsCollections.updateOne(query, updateDoc);
      res.send(result);
    });

    app.delete("/reported-items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollections.deleteOne(query);
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
