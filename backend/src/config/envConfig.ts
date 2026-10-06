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
    /** Inline PEM — use this on Render (secret env var) */
    NOCTA_PRIVATE_KEY: z.string().min(1).optional(),
    /** Path to `.pem` — local only; file is gitignored and not on Render */
    NOCTA_PRIVATE_KEY_PATH: z.string().min(1).optional(),
  })
  .refine((env) => Boolean(env.NOCTA_PRIVATE_KEY || env.NOCTA_PRIVATE_KEY_PATH), {
    message: "Set NOCTA_PRIVATE_KEY (Render) or NOCTA_PRIVATE_KEY_PATH (local)",
  })
  .parse(process.env);

function loadPrivateKey(): string {
  if (parsed.NOCTA_PRIVATE_KEY) {
    let key = parsed.NOCTA_PRIVATE_KEY.trim();
    // Render / dashboards often wrap secrets in quotes or use literal \n
    if (
      (key.startsWith('"') && key.endsWith('"')) ||
      (key.startsWith("'") && key.endsWith("'"))
    ) {
      key = key.slice(1, -1);
    }
    return key.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").trim();
  }
  return readFileSync(parsed.NOCTA_PRIVATE_KEY_PATH!, "utf8");
}

export const envConfig = {
  ...parsed,
  NOCTA_PRIVATE_KEY: loadPrivateKey(),
};
