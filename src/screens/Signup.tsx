import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { signUpSchema } from '../context/authService';
import { NAME_MAX_LENGTH } from '../context/displayName';
import { AuthLayout } from './AuthLayout';
import styles from './AuthForm.module.css';

type Field = 'name' | 'email' | 'password' | 'repeatPassword';
type Errors = Partial<Record<Field, string>>;

export function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<Field, string>>({ name: '', email: '', password: '', repeatPassword: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const set = (field: Field) => (e: ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = signUpSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as Field] ??= issue.message;
      setErrors(next);
      return;
    }
    setBusy(true);
    await signUp(parsed.data);
    navigate('/home', { replace: true });
  }

  return (
    <AuthLayout
      variant="signup"
      title="Sign up"
      subtitle="Create an account to get started"
      footer={
        <p>
          have an account already? <Link to="/login">Log in</Link>
        </p>
      }
    >
      <form className={`${styles.form} ${styles.signup}`} onSubmit={onSubmit} noValidate>
        <TextField
          label="Name"
          autoComplete="name"
          maxLength={NAME_MAX_LENGTH}
          value={values.name}
          error={errors.name}
          onChange={set('name')}
        />
        <TextField
          label="email"
          type="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={set('email')}
        />
        <TextField
          label="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          error={errors.password}
          onChange={set('password')}
        />
        <TextField
          label="repeat password"
          type="password"
          autoComplete="new-password"
          value={values.repeatPassword}
          error={errors.repeatPassword}
          onChange={set('repeatPassword')}
        />
        <Button type="submit" className={styles.submit} disabled={busy}>
          Sign Up
        </Button>
      </form>
    </AuthLayout>
  );
}
