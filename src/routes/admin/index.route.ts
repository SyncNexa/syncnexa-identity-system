import { Router } from "express";
import usersRoute from "./users.route.js";
import appsRoute from "./apps.route.js";

const router = Router();

// Mount admin sub-routes
router.use("/", usersRoute);
router.use("/", appsRoute);

export default router;
