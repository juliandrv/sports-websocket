import { Router } from "express";

const matchRouter: Router = Router();

matchRouter.get("/", (req, res) => {
  res.status(200).json({ message: "Matches List" });
});

export default matchRouter;
