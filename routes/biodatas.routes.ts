import {Router, Request, Response} from "express";
import {Collection, ObjectId} from "mongodb";
import {Biodata, BiodataInput} from "../interfaces/biodata.interface";

const router = Router();

export const biodatasRoutes = (
  biodataCollection: Collection<Biodata>,
  premiumCollection: Collection
) => {
  // GET for fetching all biodatas
  router.get("/", async (req: Request, res: Response) => {
    const idQuery = req.query.id as string | undefined;
    const premiumQuery = req.query.premium as string | undefined;
    const emailQuery = req.query.email as string | undefined;

    if (idQuery) {
      const q = {_id: new ObjectId(idQuery)};
      const result = await biodataCollection.findOne(q);
      res.send(result);
    }

    if (premiumQuery) {
      const q = {premium: true};
      const cursor = biodataCollection.find(q);
      const result = await cursor.toArray();
      res.send(result);
    }

    if (emailQuery) {
      const q = {contactEmail: emailQuery};
      const result = await biodataCollection.findOne(q);
      res.send(result);
    }

    let filter: any = {};
    const age = req.query.age as string | undefined;
    const gender = req.query.gender as string | undefined;
    const division = req.query.division as string | undefined;
    const search = req.query.search as string | undefined;
    const isPremium = req.query.isPremium as string | undefined;

    if (search && search.trim() !== "") {
      filter.name = {$regex: search, $options: "i"};
    }

    if (age) {
      const [minAge, maxAge] = age.split("-").map(Number);
      filter.age = {$gte: minAge, $lte: maxAge};
    }

    if (gender) {
      filter.gender = gender;
    }
    if (division) {
      filter.permanentDivision = division;
    }

    if (isPremium === "true") {
      filter.premium = true;
    } else if (isPremium === "false") {
      filter.premium = {$ne: true};
    }

    const page = parseInt(req.query.page as string) || 1;
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
  router.post("/", async (req: Request, res: Response) => {
    const biodatas = await biodataCollection.countDocuments();
    const newBiodata = req.body;

    const biodataId = newBiodata.biodataId
      ? newBiodata.biodataId
      : biodatas + 1;

    const obj: BiodataInput = {
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

    const filter = {contactEmail: newBiodata.contactEmail};
    const update = {$set: obj};
    const options = {upsert: true};

    const result = await biodataCollection.updateOne(filter, update, options);
    res.send(result);
  });

  // PATCH for add premium to biodatas
  router.patch("/premium/:email", async (req: Request, res: Response) => {
    const email = req.params.email;
    const filter = {contactEmail: email};
    const updatedDoc = {
      $set: {
        premium: true,
      },
    };
    const result = await biodataCollection.updateOne(filter, updatedDoc);
    res.send(result);

    const filter2 = {email: email};
    await premiumCollection.deleteOne(filter2);
  });

  return router;
};
