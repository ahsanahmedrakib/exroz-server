const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xdeet.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("exroz");
    const servicesCollection = database.collection("services");
    const usersCollection = database.collection("users");
    const pricingCollection = database.collection("pricing");
    const ordersCollection = database.collection("orders");

    app.get("/services", async (req, res) => {
      const services = servicesCollection.find({});
      const result = await services.toArray();
      res.send(result);
    });

    app.post("/services", async (req, res) => {
      const services = req.body;
      const result = await servicesCollection.insertOne(services);
      res.json(result);
    });

    //pricing
    app.get("/pricing", async (req, res) => {
      const pricing = pricingCollection.find({});
      const result = await pricing.toArray();
      res.send(result);
    });

    app.post("/pricing", async (req, res) => {
      const pricing = req.body;
      const result = await pricingCollection.insertOne(pricing);
      console.log(result);
      res.json(result);
    });

    // get a single pricing to purchase
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const pricing = await pricingCollection.findOne(query);
      res.send(pricing);
    });

    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      console.log(result);
      res.json(result);
    });

     //orders
     app.get("/orders", async (req, res) => {
      const orders = ordersCollection.find({});
      const result = await orders.toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updatedoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updatedoc);
      res.json(result);
    });

    //check if a user is admin or not
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
  } finally {
    // await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Exroz");
});

app.listen(port, () => {
  console.log(`Exroz listening at http://localhost:${port}`);
});
