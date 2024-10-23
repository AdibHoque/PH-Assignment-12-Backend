require("dotenv").config();
import express, {Request, Response, NextFunction, Application} from "express";
import cors from "cors";
import {MongoClient, ServerApiVersion, Collection} from "mongodb";
const app: Application = express();
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_SK);
import jwt, {JwtPayload, VerifyErrors} from "jsonwebtoken";
import {Biodata} from "./interfaces/biodata.interface";
import {biodatasRoutes} from "./routes/biodatas.routes";
import {usersRoutes} from "./routes/users.routes";
import {marriedRoutes} from "./routes/married.routes";
import {contactRoutes} from "./routes/contact.routes";
import {premiumRoutes} from "./routes/premium.routes";

interface CustomRequest extends Request {
  user?: string | JwtPayload;
}

const cookieParser = require("cookie-parser");
const cookieOptions: {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
} = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://truebond-matrimony.web.app",
      "https://truebond-matrimony.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req?.cookies?.token;
  if (!token) {
    console.log("no token");
    return res.status(401).send({message: "Unauthorized Access"});
  }
  jwt.verify(
    token,
    process.env.SECRET || "",
    (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
      if (err) {
        console.log("invalid token");
        return res.status(401).send({message: "Unauthorized Access"});
      }
      req.user = decoded as JwtPayload;
      next();
    }
  );
};

const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log("logging info", req.method, req.url);
  next();
};

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.knvnnno.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req: Request, res: Response) => {
  res.send("API server is running for TrueBond Matrimony!");
});

app.listen(port, () => {
  console.log("Listening to Port: ", port);
});

async function run() {
  try {
    const biodataCollection: Collection<Biodata> = client
      .db("TrueBond")
      .collection("biodatas");
    const premiumCollection = client
      .db("TrueBond")
      .collection("premiumrequests");
    const usersCollection = client.db("TrueBond").collection("users");
    const marriedCollection = client.db("TrueBond").collection("marriedstory");
    const contactCollection = client
      .db("TrueBond")
      .collection("contactrequests");
    const revenueCollection = client.db("TrueBond").collection("revenue");

    // GET - Fetch all Biodatas, POST - add new Biodata & PATCH - add premium to Biodatas
    app.use("/biodatas", biodatasRoutes(biodataCollection, premiumCollection));

    // GET - Fetch all Users, POST - add new User & PATCH - make an User Admin
    app.use("/users", usersRoutes(usersCollection));

    // GET - Fetch all Marriege Stories, POST - Add new Marrige Story
    app.use("/marriedstory", marriedRoutes(marriedCollection));

    // GET - Fetch all Contact Requests, POST - Add new Contact Reuest, PATCH - Approve a Contact Request, DELETE - Delete a Contact Request
    app.use("/contactrequests", contactRoutes(contactCollection));

    // GET - Fetch all Premium Requests, POST - Add new Premium Request
    app.use("/premiumrequests", premiumRoutes(premiumCollection));

    // JSON Web Token Through Cookies
    app.post("/jwt", logger, async (req: Request, res: Response) => {
      const user = req.body;

      const token = jwt.sign(user, process.env.SECRET || "", {expiresIn: "1h"});

      res.cookie("token", token, cookieOptions).send({success: true});
    });

    // Clear Cookie during Logout
    app.post("/logout", async (req: Request, res: Response) => {
      console.log("Logout");
      res.clearCookie("token", {maxAge: 0}).send({success: true});
    });

    // Payment Intent for Stripe
    app.post("/create-payment-intent", async (req: Request, res: Response) => {
      const {price} = req.body;
      const amount = parseInt(price) * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // Stats
    app.get("/stats", async (req: Request, res: Response) => {
      const totalBiodatas = await biodataCollection.countDocuments();
      const maleBiodatas = await biodataCollection.countDocuments({
        gender: "Male",
      });
      const femaleBiodatas = await biodataCollection.countDocuments({
        gender: "Female",
      });
      const premiumUsers = await biodataCollection.countDocuments({
        premium: true,
      });
      const marriages = await marriedCollection.countDocuments();
      const revenue = await revenueCollection.findOne({name: "revenue"});

      const data = {
        totalBiodatas: totalBiodatas,
        maleBiodatas: maleBiodatas,
        femaleBiodatas: femaleBiodatas,
        marriages: marriages,
        premiumUsers: premiumUsers,
        revenue: revenue?.money,
      };
      res.send(data);
    });

    // Revenue
    app.patch("/revenue", async (req: Request, res: Response) => {
      const filter = {name: "revenue"};
      const updateDoc = {
        $inc: {
          money: 5,
        },
      };
      const result = await revenueCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
