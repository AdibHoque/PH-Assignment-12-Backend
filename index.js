require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.knvnnno.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get("/", (req, res) => {
  res.send("API server is running for TrueBond Matrimony!")
})

app.listen(port, () => {
  console.log("Listening to Port: ", port)
})

async function run() {
  try {
    // // Connect the client to the server(optional starting in v4.7)
    // await client.connect();
    const biodataCollection = client.db('TrueBond').collection('biodatas');
    const premiumCollection = client.db('TrueBond').collection('premiumrequests');
    const usersCollection = client.db('TrueBond').collection('users');

    app.get("/biodatas", async (req, res) => {
      const idQuery = req.query.id
      const premiumQuery = req.query.premium
      const emailQuery = req.query.email

      if (idQuery) {
        const q = { _id: new ObjectId(idQuery) }
        const result = await biodataCollection.findOne(q);
        return res.send(result);
      }

      if (premiumQuery) {
        const q = { premium: true }
        const cursor = biodataCollection.find(q);
        const result = await cursor.toArray();
        return res.send(result);
      }

      if (emailQuery) {
        const q = { contactEmail: emailQuery }
        const result = await biodataCollection.findOne(q);
        return res.send(result);
      }

      const cursor = biodataCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/biodatas', async (req, res) => {
      const cursor = biodataCollection.find();
      const biodatas = await cursor.toArray();
      const newBiodata = req.body;

      const biodataId = newBiodata.biodataId ? newBiodata.biodataId : biodatas.length + 1;

      const obj = {
        biodataId: biodataId,
        gender: newBiodata.gender,
        name: newBiodata.name,
        profileImage: newBiodata.profileImage,
        dob: newBiodata.dob,
        height: newBiodata.height,
        weight: newBiodata.weight,
        age: newBiodata.age,
        occupation: newBiodata.occupation,
        race: newBiodata.race,
        fathersName: newBiodata.fathersName,
        mothersName: newBiodata.mothersName,
        permanentDivision: newBiodata.permanentDivision,
        presentDivision: newBiodata.presentDivision,
        expectedPartnerAge: newBiodata.expectedPartnerAge,
        expectedPartnerHeight: newBiodata.expectedPartnerHeight,
        expectedPartnerWeight: newBiodata.expectedPartnerWeight,
        contactEmail: newBiodata.contactEmail,
        mobileNumber: newBiodata.mobileNumber,
        premium: newBiodata.premium,
      };

      const filter = { contactEmail: newBiodata.contactEmail };
      const update = { $set: obj };
      const options = { upsert: true };

      const result = await biodataCollection.updateOne(filter, update, options);
      res.send(result);
    })

    app.post('/requestpremium', async (req, res) => {
      const newRequest = req.body;
      const result = await premiumCollection.insertOne(newRequest);
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);