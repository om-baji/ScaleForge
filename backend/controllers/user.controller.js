import { ApiError } from "../handlers/global.error.js";
import { userSchema } from "../schema/user.schema.js";
import { prisma } from "../utils/db.js";

export class User {
  static instance;

  constructor() {}

  static getInstance() {
    if (!this.instance) this.instance = new User();
    return this.instance;
  }


  static create = async (req, res) => {
    const parsed = userSchema.safeParse(req.body);

    console.log(parsed)

    if (!parsed.success) {
      throw new ApiError(
        parsed.error.issues.map((e) => e.message).join(", "),
        400
      );
    }

    const { username, role } = parsed.data;

    const user = await prisma.user.create({
      data: {
        username,
        role,
      },
    });

    res.status(201).json({
      success: true,
      user,
    });
  };

}

export const UserController = User;
