import {Router, Request, Response} from "express";
import {Collection} from "mongodb";

const router = Router();

export const marriedRoutes = (marriedCollection: Collection) => {
  // GET all Marriege Stories
  router.get("/", async (req: Request, res: Response) => {
    const cursor = marriedCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  });

  // POST new Marriege Story
  router.post("/", async (req: Request, res: Response) => {
    const newRequest = req.body;
    const result = await marriedCollection.insertOne(newRequest);
    res.send(result);
  });

  return router;
};
