"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.premiumRoutes = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
const premiumRoutes = (premiumCollection) => {
    // GET all Premium Requests
    router.get("/", async (req, res) => {
        const cursor = premiumCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    });
    // POST new Premium Request
    router.post("/", async (req, res) => {
        const newRequest = req.body;
        const result = await premiumCollection.insertOne(newRequest);
        res.send(result);
    });
    return router;
};
exports.premiumRoutes = premiumRoutes;
