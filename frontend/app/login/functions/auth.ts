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

/** Sign in with email/password via Supabase. */
export async function loginWithEmail(input: LoginInput): Promise<void> {
  const email = input.email;
  const password = input.password;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/** Create an account with email/password via Supabase. */
export async function signupWithEmail(input: SignupInput): Promise<void> {
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
