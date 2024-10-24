"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactRoutes = void 0;
const express_1 = require("express");
const mongodb_1 = require("mongodb");
const router = (0, express_1.Router)();
const contactRoutes = (contactCollection) => {
    // GET all Contact Requests
    router.get("/", async (req, res) => {
        const emailQuery = req.query.email;
        if (emailQuery) {
            const decodedEmail = decodeURIComponent(emailQuery);
            const q = { requesterEmail: decodedEmail };
            const cursor = contactCollection.find(q);
            const result = await cursor.toArray();
            if (result) {
                res.send(result);
                return;
            }
            else {
                res.status(404).send({ message: "No data found" });
                return;
            }
        }
        const cursor = contactCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    });
    // POST to add new Contact Request
    router.post("/", async (req, res) => {
        const newRequest = req.body;
        const result = await contactCollection.insertOne(newRequest);
        res.send(result);
    });
    // PATCH to approve a Contact Request
    router.patch("/approve/:id", async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new mongodb_1.ObjectId(id) };
        const updatedDoc = {
            $set: {
                status: "approved",
            },
        };
        const result = await contactCollection.updateOne(filter, updatedDoc);
        res.send(result);
    });
    // DELETE to delete a Contact Request
    router.delete("/delete/:id", async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new mongodb_1.ObjectId(id) };
        const result = await contactCollection.deleteOne(filter);
        res.send(result);
    });
    return router;
};
exports.contactRoutes = contactRoutes;
