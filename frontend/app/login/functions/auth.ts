import { supabase } from "@/lib/supabase";

export type AuthMode = "login" | "signup";

export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const AFTER_AUTH_PATH = "/dashboard";
export const BEFORE_AUTH_PATH = "/login";

/** Sign in with email/password via Supabase. Returns a short display name. */
export async function loginWithEmail(input: LoginInput): Promise<string> {
  const email = input.email;
  const password = input.password;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return resolveDisplayName();
}

/** Create an account with email/password via Supabase. Returns the given name. */
export async function signupWithEmail(input: SignupInput): Promise<string> {
  const name = input.name;
  const email = input.email;
  const password = input.password;
  const confirmPassword = input.confirmPassword;

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match . Try again.");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  const first = name.trim().split(/\s+/)[0];
  return first || resolveDisplayName();
}

async function resolveDisplayName(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  let user = sessionData.session?.user ?? null;

  if (!user) {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }
  if (!user) return "there";

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  for (const key of ["name", "full_name", "display_name"] as const) {
    const value = meta[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim().split(/\s+/)[0] || "there";
    }
  }

  const email = user.email?.trim();
  return email?.split("@")[0] || "there";
}

/** Sign in with Google OAuth via Supabase. */
export async function loginWithGoogle(): Promise<void> {}

/** Sign out the current Supabase session. Caller navigates after success. */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}
