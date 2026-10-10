import { z } from "zod";

/** Time buckets the check-in UI allows. */
const minutesSchema = z.union([z.literal(20), z.literal(45), z.literal(90)]);

/** Energy levels from the check-in (steady, not medium). */
const energySchema = z.enum(["low", "steady", "high"]);

/** Body for POST /check-in. */
export const checkInSchema = z.object({
  userId: z.string().min(1), // whose goals to rank
  minutes: minutesSchema, // time available tonight
  energy: energySchema, // how much energy is left
});

export type CheckInInput = z.infer<typeof checkInSchema>;
