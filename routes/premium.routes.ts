import {Router, Request, Response} from "express";
import {Collection} from "mongodb";

const router = Router();

export const premiumRoutes = (premiumCollection: Collection) => {
  // GET all Premium Requests
  router.get("/", async (req: Request, res: Response) => {
    const cursor = premiumCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  });

  // POST new Premium Request
  router.post("/", async (req: Request, res: Response) => {
    const newRequest = req.body;
    const result = await premiumCollection.insertOne(newRequest);
    res.send(result);
  });

  return router;
};
