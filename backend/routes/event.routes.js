import express from "express"
import { asyncHandler } from "../handlers/async.js";
import { EventController } from "../controllers/event.controller.js";

const eventRouter = express.Router();

eventRouter.get("/bulk", asyncHandler())

eventRouter.get("/:id", asyncHandler(EventController.getById))

eventRouter.post("/create", asyncHandler(EventController.create))

eventRouter.put("/:id", asyncHandler(EventController.update))

eventRouter.delete("/:id", asyncHandler(EventController.delete))

export default eventRouter