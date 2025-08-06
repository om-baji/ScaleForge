import { ApiError } from "../handlers/global.error.js";
import { prisma } from "../utils/db.js";

export class Event {
  static instance;

  constructor() {}

  static getInstance() {
    if (!this.instance) this.instance = new Event();
    return this.instance;
  }

  static getAll = async (_req, res) => {
    const events = await prisma.event.findMany();

    res.status(200).json({
      success: true,
      events,
    });
  };

  static getById = async (req, res) => {
    const { id } = req.params;

    if (!id) throw new ApiError("ID NOT GIVEN", 409);

    const event = await prisma.event.findUnique({
      where: {
        id,
      },
    });

    if (!event) throw new ApiError("Event Not found!", 404);

    res.status(200).json({
      success: true,
      event,
    });
  };

  static create = async (req, res) => {
    const parsed = eventSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(
        parsed.error.errors.map((e) => e.message).join(", "),
        400
      );
    }

    const { name, max, date } = parsed.data;

    const event = await prisma.event.create({
      data: {
        name,
        max,
        date,
      },
    });

    res.status(201).json({
      success: true,
      event,
    });
  };

  static update = async (req, res) => {
    const { id } = req.params;

    if (!id) throw new ApiError("ID NOT GIVEN", 409);

    const parsed = eventSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(
        parsed.error.errors.map((e) => e.message).join(", "),
        400
      );
    }

    const event = await prisma.event.update({
      where: { id },
      data: parsed.data,
    });

    res.status(200).json({
      success: true,
      event,
    });
  };

  static delete = async (req,res) => {
    const { id } = req.params;

    if (!id) throw new ApiError("ID NOT GIVEN", 409);

    await prisma.event.delete({
        where : {
            id,
        }
    })

    res.status(200).json({
        success : true,
        message : "Deleted!"
    })
  }
}

export const EventController = Event.getInstance();
