import { z } from 'zod';
import { NAME_MAX_LENGTH } from './displayName';
import { readStored, writeStored } from './storage';

export const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export type User = z.infer<typeof userSchema>;

export const credentialsSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters'),
});

export const signUpSchema = credentialsSchema
  .extend({
    name: z
      .string()
      .trim()
      .min(1, 'Enter your name')
      .max(NAME_MAX_LENGTH, `Use ${NAME_MAX_LENGTH} characters or fewer`),
    repeatPassword: z.string(),
  })
  .refine((v) => v.password === v.repeatPassword, {
    message: 'Passwords do not match',
    path: ['repeatPassword'],
  });

export type Credentials = z.infer<typeof credentialsSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;

/**
 * The contract a real backend would implement later (for example with Supabase).
 * Screens only depend on this interface, never on the mock.
 */
export interface AuthService {
  signIn(credentials: Credentials): Promise<User>;
  signUp(data: SignUpData): Promise<User>;
  demo(): Promise<User>;
}

function nameFromEmail(email: string): string {
  const local = email.split('@')[0].split(/[._-]/)[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}

/** Names of accounts signed up in this browser, by email, so Log in can greet them by name. */
const ACCOUNTS_KEY = 'gc.accounts';
const accountsSchema = z.record(z.string(), z.string());
const emailKey = (email: string) => email.trim().toLowerCase();

/**
 * Front-end only: accepts any valid email and password and never stores the password.
 * Sign-up remembers the name for the email in this browser; otherwise the name comes from the email.
 */
export const mockAuthService: AuthService = {
  async signIn({ email }) {
    const accounts = readStored(ACCOUNTS_KEY, accountsSchema, {});
    return { name: accounts[emailKey(email)] ?? nameFromEmail(email), email };
  },
  async signUp({ name, email }) {
    const accounts = readStored(ACCOUNTS_KEY, accountsSchema, {});
    writeStored(ACCOUNTS_KEY, { ...accounts, [emailKey(email)]: name.trim() });
    return { name: name.trim(), email };
  },
  async demo() {
    return { name: 'Markus', email: 'markus@example.com' };
  },
};
