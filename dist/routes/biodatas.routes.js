"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.biodatasRoutes = void 0;
const express_1 = require("express");
const mongodb_1 = require("mongodb");
const router = (0, express_1.Router)();
const biodatasRoutes = (biodataCollection, premiumCollection) => {
    // GET for fetching all biodatas
    router.get("/", async (req, res) => {
        const idQuery = req.query.id;
        const premiumQuery = req.query.premium;
        const emailQuery = req.query.email;
        if (idQuery) {
            const q = { _id: new mongodb_1.ObjectId(idQuery) };
            const result = await biodataCollection.findOne(q);
            res.send(result);
        }
        if (premiumQuery) {
            const q = { premium: true };
            const cursor = biodataCollection.find(q);
            const result = await cursor.toArray();
            res.send(result);
        }
        if (emailQuery) {
            const q = { contactEmail: emailQuery };
            const result = await biodataCollection.findOne(q);
            res.send(result);
        }
        let filter = {};
        const age = req.query.age;
        const gender = req.query.gender;
        const division = req.query.division;
        const search = req.query.search;
        const isPremium = req.query.isPremium;
        if (search && search.trim() !== "") {
            filter.name = { $regex: search, $options: "i" };
        }
        if (age) {
            const [minAge, maxAge] = age.split("-").map(Number);
            filter.age = { $gte: minAge, $lte: maxAge };
        }
        if (gender) {
            filter.gender = gender;
        }
        if (division) {
            filter.permanentDivision = division;
        }
        if (isPremium === "true") {
            filter.premium = true;
        }
        else if (isPremium === "false") {
            filter.premium = { $ne: true };
        }
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const skip = (page - 1) * limit;
        const total = await biodataCollection.countDocuments(filter);
        const cursor = biodataCollection.find(filter).skip(skip).limit(limit);
        const result = await cursor.toArray();
        const data = {
            totalBiodatas: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            biodatas: result,
        };
        res.send(data);
    });
    // POST for creating/updating biodatas
    router.post("/", async (req, res) => {
        const biodatas = await biodataCollection.countDocuments();
        const newBiodata = req.body;
        const biodataId = newBiodata.biodataId
            ? newBiodata.biodataId
            : biodatas + 1;
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
    });
    // PATCH for add premium to biodatas
    router.patch("/premium/:email", async (req, res) => {
        const email = req.params.email;
        const filter = { contactEmail: email };
        const updatedDoc = {
            $set: {
                premium: true,
            },
        };
        const result = await biodataCollection.updateOne(filter, updatedDoc);
        res.send(result);
        const filter2 = { email: email };
        await premiumCollection.deleteOne(filter2);
    });
    return router;
};
exports.biodatasRoutes = biodatasRoutes;
