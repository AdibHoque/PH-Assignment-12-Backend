"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marriedRoutes = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
const marriedRoutes = (marriedCollection) => {
    // GET all Marriege Stories
    router.get("/", async (req, res) => {
        const cursor = marriedCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    });
    // POST new Marriege Story
    router.post("/", async (req, res) => {
        const newRequest = req.body;
        const result = await marriedCollection.insertOne(newRequest);
        res.send(result);
    });
    return router;
};
exports.marriedRoutes = marriedRoutes;
