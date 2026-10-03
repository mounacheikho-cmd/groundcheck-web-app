import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { credentialsSchema } from '../context/authService';
import { AuthLayout } from './AuthLayout';
import styles from './AuthForm.module.css';

type Errors = Partial<Record<'email' | 'password', string>>;

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const from = (location.state as { from?: string } | null)?.from ?? '/home';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = credentialsSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof Errors] ??= issue.message;
      setErrors(next);
      return;
    }
    setBusy(true);
    await signIn(parsed.data);
    navigate(from, { replace: true });
  }

  return (
    <AuthLayout
      variant="login"
      title="Log in"
      subtitle="Hey there, welcome back!"
      footer={
        <>
          <p>
            don’t have an account yet? <Link to="/signup">Sign up</Link>
          </p>
          <p>demo: any email + 8-character password</p>
        </>
      }
    >
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <TextField
          label="email"
          type="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
        <TextField
          label="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          error={errors.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
        />
        <Button type="submit" className={styles.submit} disabled={busy}>
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
