import {Router, Request, Response} from "express";
import {Collection, ObjectId} from "mongodb";

const router = Router();

export const contactRoutes = (contactCollection: Collection) => {
  // GET all Contact Requests
  router.get("/", async (req: Request, res: Response) => {
    const emailQuery = req.query.email as string;
    if (emailQuery) {
      const decodedEmail = decodeURIComponent(emailQuery);
      const q = {requesterEmail: decodedEmail};
      const cursor = contactCollection.find(q);
      const result = await cursor.toArray();
      if (result) {
        res.send(result);
        return;
      } else {
        res.status(404).send({message: "No data found"});
        return;
      }
    }
    const cursor = contactCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  });

  // POST to add new Contact Request
  router.post("/", async (req: Request, res: Response) => {
    const newRequest = req.body;
    const result = await contactCollection.insertOne(newRequest);
    res.send(result);
  });

  // PATCH to approve a Contact Request
  router.patch("/approve/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)};
    const updatedDoc = {
      $set: {
        status: "approved",
      },
    };
    const result = await contactCollection.updateOne(filter, updatedDoc);
    res.send(result);
  });

  // DELETE to delete a Contact Request
  router.delete("/delete/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)};
    const result = await contactCollection.deleteOne(filter);
    res.send(result);
  });

  return router;
};
