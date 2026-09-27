import "dotenv/config";
import { readFileSync } from "node:fs";
import { z } from "zod";

const parsed = z
  .object({
    NOCTA_GITHUB_OWNER: z.string().min(1),
    NOCTA_GITHUB_REPO: z.string().min(1),
    NOCTA_GITHUB_URL: z.string().min(1),
    NOCTA_APP_ID: z.string().min(1),
    NOCTA_CLIENT_ID: z.string().min(1),
    NOCTA_INSTALLATION_ID: z.coerce
      .number()
      .int()
      .positive() /**Env will recieved strong this will convert it o number format**/,
    /** Path to the GitHub App `.pem` private key file */
    NOCTA_PRIVATE_KEY_PATH: z.string().min(1),
  })
  .parse(process.env);

export const envConfig = {
  ...parsed,
  /** PEM contents loaded from `NOCTA_PRIVATE_KEY_PATH` */
  NOCTA_PRIVATE_KEY: readFileSync(parsed.NOCTA_PRIVATE_KEY_PATH, "utf8"),
};
