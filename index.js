require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000
const stripe = require('stripe')(process.env.STRIPE_SK);

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
    const marriedCollection = client.db('TrueBond').collection('marriedstory');
    const contactCollection = client.db('TrueBond').collection('contactrequests');
    const revenueCollection = client.db('TrueBond').collection('revenue');

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

    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const query = { email: newUser.email }
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'User Already Exists' })
      }

      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    })

    app.get("/users", async (req, res) => {
      const emailQuery = req.query.email

      if (emailQuery) {
        const q = { email: emailQuery }
        const result = await usersCollection.findOne(q);
        return res.send(result);
      }

      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.patch('/users/admin/:email', async (req, res) => {
      const email = req.params.email
      const filter = { email: email }
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await usersCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })

    app.patch('/biodatas/premium/:email', async (req, res) => {
      const email = req.params.email
      const filter = { contactEmail: email }
      const updatedDoc = {
        $set: {
          premium: true
        }
      }
      const result = await biodataCollection.updateOne(filter, updatedDoc)
      res.send(result)

      const filter2 = { email: email }
      const result2 = await premiumCollection.deleteOne(filter2)
    })

    app.get("/marriedstory", async (req, res) => {
      const cursor = marriedCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.post('/marriedstory', async (req, res) => {
      const newRequest = req.body;
      const result = await marriedCollection.insertOne(newRequest);
      res.send(result);
    })

    app.get("/stats", async (req, res) => {
      const cursor = biodataCollection.find();
      const result = await cursor.toArray();
      const maleData = result.filter(d => d.gender == 'Male')
      const femaleData = result.filter(d => d.gender == 'Female')

      const cursor2 = marriedCollection.find();
      const result2 = await cursor2.toArray();

      const cursor3 = premiumCollection.find();
      const result3 = await cursor3.toArray();

      const filter1 = { name: 'revenue' };
      const result4 = await revenueCollection.findOne(filter1);


      const data = {
        totalBiodatas: result.length,
        maleBiodatas: maleData.length,
        femaleBiodatas: femaleData.length,
        marriages: result2.length,
        premiumUsers: result3.length,
        revenue: result4.money
      }
      res.send(data)
    })

    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });
      res.send({
        clientSecret: paymentIntent.client_secret
      })
    });

    app.get("/contactrequests", async (req, res) => {
      const emailQuery = req.query.email
      if (emailQuery) {
        const q = { requesterEmail: emailQuery }
        const cursor = contactCollection.find(q);
        const result = await cursor.toArray();
        return res.send(result);
      }
      const cursor = contactCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/contactrequests', async (req, res) => {
      const newRequest = req.body;
      const result = await contactCollection.insertOne(newRequest);
      res.send(result);
    })

    app.patch('/contactrequests/approve/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          status: 'approved'
        }
      }
      const result = await contactCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })

    app.delete('/contactrequests/delete/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const result = await contactCollection.deleteOne(filter)
      res.send(result)
    })

    app.get("/premiumrequests", async (req, res) => {
      const cursor = premiumCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/premiumrequests', async (req, res) => {
      const newRequest = req.body;
      const result = await premiumCollection.insertOne(newRequest);
      res.send(result);
    })

    app.patch('/revenue', async (req, res) => {
      const filter = { name: 'revenue' };
      const updateDoc = {

        $inc: {
          money: 5
        }
      };
      const result = await revenueCollection.updateOne(filter, updateDoc);
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