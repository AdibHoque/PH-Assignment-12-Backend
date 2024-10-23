"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRoutes = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
const usersRoutes = (usersCollection) => {
    // GET all users
    router.get("/", async (req, res) => {
        const emailQuery = req.query.email;
        if (emailQuery) {
            const q = { email: emailQuery };
            const result = await usersCollection.findOne(q);
            res.send(result);
        }
        const cursor = usersCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    });
    // POST a new User
    router.post("/", async (req, res) => {
        const newUser = req.body;
        const query = { email: newUser.email };
        const existingUser = await usersCollection.findOne(query);
        if (existingUser) {
            res.send({ message: "User Already Exists" });
        }
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
    });
    // PATCH to make an user Admin
    router.patch("/admin/:email", async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const updatedDoc = {
            $set: {
                role: "admin",
            },
        };
        const result = await usersCollection.updateOne(filter, updatedDoc);
        res.send(result);
    });
    return router;
};
exports.usersRoutes = usersRoutes;
