import { Router } from "express";
import routerAuth from "./auth.route";

const router = Router();

router.use("/auth", routerAuth);
router.use("/", (req, res) => {
  res.json("hihi");
});

export default router;
