import {Router, Request, Response} from "express";
import {Collection} from "mongodb";

const router = Router();

export const usersRoutes = (usersCollection: Collection) => {
  // GET all users
  router.get("/", async (req: Request, res: Response) => {
    const emailQuery = req.query.email as string | undefined;

    if (emailQuery) {
      const q = {email: emailQuery};
      const result = await usersCollection.findOne(q);
      res.send(result);
    }

    const cursor = usersCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  });

  // POST a new User
  router.post("/", async (req: Request, res: Response) => {
    const newUser = req.body;
    const query = {email: newUser.email};
    const existingUser = await usersCollection.findOne(query);
    if (existingUser) {
      res.send({message: "User Already Exists"});
    }

    const result = await usersCollection.insertOne(newUser);
    res.send(result);
  });

  // PATCH to make an user Admin
  router.patch("/admin/:email", async (req: Request, res: Response) => {
    const email = req.params.email;
    const filter = {email: email};
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
