import { Router, type IRouter } from "express";
import healthRouter from "./health";
import honeyRouter from "./honey";

const router: IRouter = Router();

router.use(healthRouter);
router.use(honeyRouter);

export default router;
