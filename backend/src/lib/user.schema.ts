import { z } from "zod";

export const UserSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
});

export type UserInput = z.infer<typeof UserSchema>;
