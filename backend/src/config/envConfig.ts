import "dotenv/config";
import { createPrivateKey } from "node:crypto";
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

/** Rebuild PEM so Render one-line / space-mangled secrets still parse. */
function normalizePem(raw: string): string {
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").trim();

  const match = key.match(
    /-----BEGIN ([A-Z0-9 ]+)-----([\s\S]+?)-----END \1-----/,
  );
  if (!match) {
    throw new Error(
      "NOCTA_PRIVATE_KEY is not a PEM (missing BEGIN/END PRIVATE KEY headers)",
    );
  }

  const type = match[1]!;
  const body = match[2]!.replace(/\s+/g, "");
  if (!body) {
    throw new Error("NOCTA_PRIVATE_KEY PEM body is empty");
  }

  const lines = body.match(/.{1,64}/g) ?? [body];
  return `-----BEGIN ${type}-----\n${lines.join("\n")}\n-----END ${type}-----`;
}

function loadPrivateKey(): string {
  const raw = parsed.NOCTA_PRIVATE_KEY
    ? parsed.NOCTA_PRIVATE_KEY
    : readFileSync(parsed.NOCTA_PRIVATE_KEY_PATH!, "utf8");

  const pem = normalizePem(raw);
  try {
    createPrivateKey(pem);
  } catch {
    throw new Error(
      "NOCTA_PRIVATE_KEY is invalid — paste the full GitHub App .pem (or use literal \\n between lines on Render)",
    );
  }
  return pem;
}

export const envConfig = {
  ...parsed,
  NOCTA_PRIVATE_KEY: loadPrivateKey(),
};
