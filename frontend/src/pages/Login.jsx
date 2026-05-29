import { LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, PasswordInput } from '../components/ui.jsx';
import { useAuthStore } from '../store/authStore.js';

const demoUsers = [
  { label: 'Super Admin', email: 'superadmin@pulsehr.test', password: 'password123' },
  { label: 'Admin', email: 'admin@acme.test', password: 'password123' },
  { label: 'Employee', email: 'yogesh@inventive.in', password: 'password123' }
];

const roleHome = {
  SUPER_ADMIN: '/super-admin-dashboard',
  COMPANY_ADMIN: '/',
  EMPLOYEE: '/'
};

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('admin@acme.test');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Signed in');
      navigate(roleHome[user?.role] || '/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">PH</div>
          <h1 className="text-2xl font-semibold text-slate-950">PulseHR</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage attendance, leave, and payroll.</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {demoUsers.map((user) => (
              <button
                key={user.label}
                type="button"
                className="rounded border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-slate-700 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                onClick={() => {
                  setEmail(user.email);
                  setPassword(user.password);
                }}
              >
                {user.label}
              </button>
            ))}
          </div>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <Input className="pl-9" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <div className="relative mt-1">
              <LockKeyhole className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <PasswordInput className="pl-9" value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
          </label>
          <Button className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</Button>
        </form>
      </Card>
    </div>
  );
}
