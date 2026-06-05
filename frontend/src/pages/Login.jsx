import { LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, PasswordInput } from '../components/ui.jsx';
import { useAuthStore } from '../store/authStore.js';
import attendoHorizontalLogo from '../Assets/horizoanllogoandnaem.png';

const demoUsers = [
  { label: 'Admin', email: 'admin@acme.test', password: 'password123' },
  { label: 'Employee', email: 'employee@acme.test', password: 'password123' }
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

  console.info('Super Admin demo credentials', {
    email: 'superadmin@attendo.in',
    password: 'password123'
  });

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
          <img src={attendoHorizontalLogo} alt="Attendo" className="mx-auto mb-5 h-16 w-auto max-w-[240px] object-contain  saturate-125 contrast-125" />
          <h1 className="sr-only">Attendo</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage attendance, leave, and payroll.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {demoUsers.map((user) => (
              <button
                key={user.label}
                type="button"
                className={`rounded border px-2 py-2 text-xs font-bold transition ${email === user.email ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-primary hover:bg-primary/5 hover:text-primary'}`}
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
