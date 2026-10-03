import { describe, expect, it } from 'vitest';
import { mockAuthService, signUpSchema } from './authService';
import { greetingName, NAME_MAX_LENGTH } from './displayName';

describe('greetingName', () => {
  it('shows the first name only', () => {
    expect(greetingName('Markus Weber')).toBe('Markus');
    expect(greetingName('  Anna   Lena Schmidt ')).toBe('Anna');
  });

  it('keeps names of up to 12 characters', () => {
    expect(greetingName('Bartholomäus')).toBe('Bartholomäus');
  });

  it('cuts longer names to 12 characters ending in "…"', () => {
    expect(greetingName('Konstantinopel')).toBe('Konstantino…');
  });

  it('returns an empty string when there is no name', () => {
    expect(greetingName('   ')).toBe('');
  });
});

describe('sign-up name', () => {
  const base = { email: 'a@example.com', password: 'password1', repeatPassword: 'password1' };

  it(`accepts up to ${NAME_MAX_LENGTH} characters`, () => {
    expect(signUpSchema.safeParse({ ...base, name: 'a'.repeat(NAME_MAX_LENGTH) }).success).toBe(true);
  });

  it(`rejects more than ${NAME_MAX_LENGTH} characters`, () => {
    const result = signUpSchema.safeParse({ ...base, name: 'a'.repeat(NAME_MAX_LENGTH + 1) });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Use 30 characters or fewer');
  });
});

describe('mock log in', () => {
  it('greets a returning user by the name they signed up with', async () => {
    await mockAuthService.signUp({
      name: 'Lena Fischer',
      email: 'Lena@Example.com',
      password: 'password1',
      repeatPassword: 'password1',
    });
    const user = await mockAuthService.signIn({ email: 'lena@example.com', password: 'password1' });
    expect(user.name).toBe('Lena Fischer');
  });

  it('falls back to a name from the email for unknown accounts', async () => {
    const user = await mockAuthService.signIn({ email: 'jana.koch@example.com', password: 'password1' });
    expect(user.name).toBe('Jana');
  });
});
