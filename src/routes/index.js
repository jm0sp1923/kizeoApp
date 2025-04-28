import express from "express";
import kizeoRoutes from "./kizeo.routes.js";
import share_pointRoutes from "./sharePoint.routes.js";

const router = express.Router();

router.use("/kizeo", kizeoRoutes);
router.use("/share_point", share_pointRoutes); 

export default router;
