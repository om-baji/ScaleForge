import express from "express"
import { asyncHandler } from "../handlers/async.js";
import { UserController } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/create", asyncHandler(UserController.create))

export default userRouter