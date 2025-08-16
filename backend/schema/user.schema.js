import z from "zod";

export const userSchema = z.object({
  username: z.string().min(1, "User name is required"),
  role: z.string().min(1, "User role is required")  
});
