"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongodb_1 = require("mongodb");
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_SK);
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const biodatas_routes_1 = require("./routes/biodatas.routes");
const users_routes_1 = require("./routes/users.routes");
const married_routes_1 = require("./routes/married.routes");
const contact_routes_1 = require("./routes/contact.routes");
const premium_routes_1 = require("./routes/premium.routes");
const cookieParser = require("cookie-parser");
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        "https://truebond-matrimony.web.app",
        "https://truebond-matrimony.firebaseapp.com",
    ],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(cookieParser());
const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    if (!token) {
        console.log("no token");
        return res.status(401).send({ message: "Unauthorized Access" });
    }
    jsonwebtoken_1.default.verify(token, process.env.SECRET || "", (err, decoded) => {
        if (err) {
            console.log("invalid token");
            return res.status(401).send({ message: "Unauthorized Access" });
        }
        req.user = decoded;
        next();
    });
};
const logger = (req, res, next) => {
    console.log("logging info", req.method, req.url);
    next();
};
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.knvnnno.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new mongodb_1.MongoClient(uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
app.get("/", (req, res) => {
    res.send("API server is running for TrueBond Matrimony!");
});
app.listen(port, () => {
    console.log("Listening to Port: ", port);
});
async function run() {
    try {
        const biodataCollection = client
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
        app.use("/biodatas", (0, biodatas_routes_1.biodatasRoutes)(biodataCollection, premiumCollection));
        // GET - Fetch all Users, POST - add new User & PATCH - make an User Admin
        app.use("/users", (0, users_routes_1.usersRoutes)(usersCollection));
        // GET - Fetch all Marriege Stories, POST - Add new Marrige Story
        app.use("/marriedstory", (0, married_routes_1.marriedRoutes)(marriedCollection));
        // GET - Fetch all Contact Requests, POST - Add new Contact Reuest, PATCH - Approve a Contact Request, DELETE - Delete a Contact Request
        app.use("/contactrequests", (0, contact_routes_1.contactRoutes)(contactCollection));
        // GET - Fetch all Premium Requests, POST - Add new Premium Request
        app.use("/premiumrequests", (0, premium_routes_1.premiumRoutes)(premiumCollection));
        // JSON Web Token Through Cookies
        app.post("/jwt", logger, async (req, res) => {
            const user = req.body;
            const token = jsonwebtoken_1.default.sign(user, process.env.SECRET || "", { expiresIn: "1h" });
            res.cookie("token", token, cookieOptions).send({ success: true });
        });
        // Clear Cookie during Logout
        app.post("/logout", async (req, res) => {
            console.log("Logout");
            res.clearCookie("token", { maxAge: 0 }).send({ success: true });
        });
        // Payment Intent for Stripe
        app.post("/create-payment-intent", async (req, res) => {
            const { price } = req.body;
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
        app.get("/stats", async (req, res) => {
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
            const revenue = await revenueCollection.findOne({ name: "revenue" });
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
        app.patch("/revenue", async (req, res) => {
            const filter = { name: "revenue" };
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
    }
    finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);
