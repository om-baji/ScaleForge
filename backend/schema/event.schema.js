import z from "zod";

import z from "zod";

export const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  max: z.number().int().positive("Max must be a positive integer"),
  date: z.coerce.date(),
  isActive: z.boolean().optional(),
  organizerId: z.string().min(1, "Organizer ID is required"),
});
