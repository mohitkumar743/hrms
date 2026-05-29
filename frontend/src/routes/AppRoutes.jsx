import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import Login from '../pages/Login.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Employees from '../pages/Employees.jsx';
import Attendance from '../pages/Attendance.jsx';
import Leaves from '../pages/Leaves.jsx';
import Notices from '../pages/Notices.jsx';
import Events from '../pages/Events.jsx';
import Payroll from '../pages/Payroll.jsx';
import ActivityReport from '../pages/ActivityReport.jsx';
import PageMaster from '../pages/PageMaster.jsx';
import PermissionMaster from '../pages/PermissionMaster.jsx';
import QrScanner from '../pages/QrScanner.jsx';
import Reports from '../pages/Reports.jsx';
import Settings from '../pages/Settings.jsx';
import CompanyMaster from '../pages/CompanyMaster.jsx';
import CompanyInfo from '../pages/CompanyInfo.jsx';
import SuperAdminDashboard from '../pages/SuperAdminDashboard.jsx';
import { useAuthStore } from '../store/authStore.js';

const roleHome = {
  SUPER_ADMIN: '/super-admin-dashboard',
  COMPANY_ADMIN: '/',
  EMPLOYEE: '/'
};

function Protected({ children }) {
  const token = useAuthStore((state) => state.accessToken);
  return token ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ roles, children }) {
  const user = useAuthStore((state) => state.user);
  if (!roles.includes(user?.role)) return <Navigate to={roleHome[user?.role] || '/login'} replace />;
  return children;
}

function HomeRoute() {
  const user = useAuthStore((state) => state.user);
  if (user?.role === 'SUPER_ADMIN') return <Navigate to="/super-admin-dashboard" replace />;
  return <RoleRoute roles={['COMPANY_ADMIN', 'EMPLOYEE']}><Dashboard /></RoleRoute>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Protected><AppLayout /></Protected>}>
          <Route index element={<HomeRoute />} />
          <Route path="super-admin-dashboard" element={<RoleRoute roles={['SUPER_ADMIN']}><SuperAdminDashboard /></RoleRoute>} />
          <Route path="companies" element={<Navigate to="/companies/view" replace />} />
          <Route path="companies/onboard" element={<RoleRoute roles={['SUPER_ADMIN']}><CompanyMaster /></RoleRoute>} />
          <Route path="companies/view" element={<RoleRoute roles={['SUPER_ADMIN']}><CompanyMaster /></RoleRoute>} />
          <Route path="company-info" element={<RoleRoute roles={['COMPANY_ADMIN']}><CompanyInfo /></RoleRoute>} />
          <Route path="page-master" element={<RoleRoute roles={['SUPER_ADMIN']}><PageMaster /></RoleRoute>} />
          <Route path="permission-master" element={<RoleRoute roles={['SUPER_ADMIN']}><PermissionMaster /></RoleRoute>} />
          <Route path="employees" element={<RoleRoute roles={['COMPANY_ADMIN']}><Employees /></RoleRoute>} />
          <Route path="employees/add" element={<RoleRoute roles={['COMPANY_ADMIN']}><Employees /></RoleRoute>} />
          <Route path="employees/view" element={<RoleRoute roles={['COMPANY_ADMIN']}><Employees /></RoleRoute>} />
          <Route path="attendance" element={<RoleRoute roles={['COMPANY_ADMIN', 'EMPLOYEE']}><Attendance /></RoleRoute>} />
          <Route path="leaves" element={<RoleRoute roles={['COMPANY_ADMIN', 'EMPLOYEE']}><Leaves /></RoleRoute>} />
          <Route path="notices" element={<RoleRoute roles={['COMPANY_ADMIN']}><Notices /></RoleRoute>} />
          <Route path="events" element={<RoleRoute roles={['COMPANY_ADMIN']}><Events /></RoleRoute>} />
          <Route path="payroll" element={<RoleRoute roles={['COMPANY_ADMIN', 'EMPLOYEE']}><Payroll /></RoleRoute>} />
          <Route path="qr-scanner" element={<RoleRoute roles={['COMPANY_ADMIN']}><QrScanner /></RoleRoute>} />
          <Route path="reports" element={<RoleRoute roles={['COMPANY_ADMIN']}><Reports /></RoleRoute>} />
          <Route path="activity-report" element={<RoleRoute roles={['COMPANY_ADMIN']}><ActivityReport /></RoleRoute>} />
          <Route path="settings" element={<RoleRoute roles={['COMPANY_ADMIN']}><Settings /></RoleRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
