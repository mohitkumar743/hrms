import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Activity, BarChart3, Bell, BriefcaseBusiness, Building2, CalendarCheck, ChevronDown, ChevronLeft, ChevronRight, FileCog, FileText, LayoutDashboard, List, LogOut, Menu, Moon, QrCode, Search, Settings, ShieldCheck, Sun, UserPlus, UserRound, UsersRound, WalletCards, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../components/ui.jsx';
import { useAuthStore } from '../store/authStore.js';
import { cn } from '../lib/utils.js';
import { useApiQuery } from '../hooks/useApiQuery.js';

const iconMap = {
  Activity,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  FileCog,
  FileText,
  LayoutDashboard,
  List,
  QrCode,
  Settings,
  ShieldCheck,
  UserPlus,
  UsersRound,
  WalletCards
};

function formatHeaderDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatHeaderClock(value) {
  if (!value) return '';
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const displayHours = hours % 12 || 12;
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

function buildHeaderNotifications(notices = [], events = [], leaves = [], user) {
  const dashboardPath = user?.role === 'SUPER_ADMIN' ? '/super-admin-dashboard' : '/';
  const noticePath = user?.role === 'COMPANY_ADMIN' ? '/notices' : dashboardPath;
  const eventPath = user?.role === 'COMPANY_ADMIN' ? '/events' : dashboardPath;
  const leavePath = '/leaves';
  const eventTimestamp = (event) => {
    if (event.eventDate) return new Date(`${event.eventDate}T${event.startTime || '00:00'}`).getTime();
    return new Date(event.createdAt || 0).getTime();
  };
  const noticeItems = notices.map((notice) => ({
    id: `notice-${notice.id}`,
    type: 'Notice',
    title: notice.title || 'Notice',
    description: notice.message || '',
    date: notice.createdAt,
    href: noticePath,
    timestamp: new Date(notice.createdAt || 0).getTime()
  }));
  const eventItems = events.map((event) => ({
    id: `event-${event.id}`,
    type: 'Event',
    title: event.title || 'Event',
    description: [formatHeaderDate(event.eventDate), event.startTime ? formatHeaderClock(event.startTime) : ''].filter(Boolean).join(' at '),
    date: event.eventDate || event.createdAt,
    href: eventPath,
    timestamp: eventTimestamp(event)
  }));
  const leaveItems = leaves
    .filter((leave) => user?.role === 'COMPANY_ADMIN' ? leave.status === 'PENDING' : ['APPROVED', 'REJECTED'].includes(leave.status))
    .map((leave) => {
      const isAdmin = user?.role === 'COMPANY_ADMIN';
      const decisionText = leave.status === 'APPROVED' ? 'approved' : 'rejected';
      const dateLabel = `${formatHeaderDate(leave.startDate)}${leave.endDate && leave.endDate !== leave.startDate ? ` - ${formatHeaderDate(leave.endDate)}` : ''}`;
      return {
        id: isAdmin ? `leave-request-${leave.id}` : `leave-decision-${leave.id}-${leave.status}-${leave.decidedAt || ''}`,
        type: 'Leave',
        title: isAdmin ? `${leave.employeeName || 'Employee'} applied for leave` : `Leave ${decisionText}`,
        description: isAdmin ? `${leave.leaveType || 'Leave'} for ${dateLabel}` : `${leave.leaveType || 'Leave'} for ${dateLabel}${leave.remark ? `: ${leave.remark}` : ''}`,
        date: isAdmin ? leave.createdAt : leave.decidedAt,
        href: leavePath,
        timestamp: new Date((isAdmin ? leave.createdAt : leave.decidedAt) || 0).getTime()
      };
    });

  return [...noticeItems, ...eventItems, ...leaveItems]
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 10);
}

function openNotificationDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('hrms-notifications', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('readNotifications');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getReadNotifications(key) {
  const db = await openNotificationDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('readNotifications', 'readonly');
    const request = transaction.objectStore('readNotifications').get(key);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

async function saveReadNotifications(key, ids) {
  const db = await openNotificationDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('readNotifications', 'readwrite');
    const request = transaction.objectStore('readNotifications').put(ids, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

function SidebarLink({ item, nested = false, collapsed = false, openParentId, setOpenParentId, onNavigate }) {
  const location = useLocation();
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [flyoutTop, setFlyoutTop] = useState(0);
  const triggerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const Icon = iconMap[item.icon] || FileText;
  const children = item.children || [];
  const isExpanded = openParentId === item.id;

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  const openFlyout = () => {
    window.clearTimeout(closeTimerRef.current);
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setFlyoutTop(Math.max(8, Math.min(rect.top, window.innerHeight - 220)));
    }
    setFlyoutOpen(true);
  };

  const closeFlyout = () => {
    closeTimerRef.current = window.setTimeout(() => setFlyoutOpen(false), 120);
  };

  if (children.length > 0 && !nested) {
    return (
      <div ref={triggerRef} onMouseEnter={collapsed ? openFlyout : undefined} onMouseLeave={collapsed ? closeFlyout : undefined} onFocus={collapsed ? openFlyout : undefined} onBlur={collapsed ? closeFlyout : undefined}>
        <button type="button" title={item.label} onClick={() => setOpenParentId(isExpanded ? null : item.id)} className={cn('group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[13px] font-semibold text-slate-600 hover:bg-red-50 hover:text-[#e52529]', collapsed && 'justify-center px-0', isExpanded && '!bg-[#e52529] !text-white hover:!bg-[#c91f23] hover:!text-white')}>
          <Icon size={18} />
          {!collapsed && <span className="flex-1">{item.label}</span>}
          {!collapsed && <ChevronDown className={cn('transition', isExpanded && 'rotate-180', isExpanded && 'text-white')} size={15} />}
        </button>
        {collapsed && flyoutOpen && createPortal(
          <div
            className="fixed left-[72px] z-50 min-w-[190px] rounded-md border border-slate-200 bg-white p-2 shadow-lg"
            style={{ top: flyoutTop }}
            onMouseEnter={openFlyout}
            onMouseLeave={closeFlyout}
          >
            <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase text-slate-400">{item.label}</p>
            <div className="space-y-1">
              {children.map((child) => {
                const ChildIcon = iconMap[child.icon] || FileText;
                const active = child.path === location.pathname;
                return (
                  <NavLink
                    key={child.id}
                    to={child.path}
                    title={child.label}
                    onClick={() => {
                      setOpenParentId(item.id);
                      setFlyoutOpen(false);
                      onNavigate?.();
                    }}
                    className={cn('flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-[#e52529]', active && '!bg-red-50 !text-[#e52529]')}
                  >
                    <ChildIcon size={15} />
                    <span>{child.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>,
          document.body
        )}
        {isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {children.map((child) => <SidebarLink key={child.id} item={child} nested collapsed={collapsed} openParentId={openParentId} setOpenParentId={setOpenParentId} onNavigate={onNavigate} />)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <NavLink
        to={item.path}
        title={item.label}
        onClick={() => {
          if (!nested) {
            setOpenParentId(null);
          }
          onNavigate?.();
        }}
        className={({ isActive }) => cn('group flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-red-50 hover:text-[#e52529]', nested && 'py-2 pl-8 text-xs', collapsed && 'justify-center px-0', isActive && !nested && '!bg-[#e52529] !text-white hover:!bg-[#c91f23] hover:!text-white', isActive && nested && '!bg-red-50 !text-[#e52529] hover:!bg-red-100 hover:!text-[#c91f23]')}
      >
        {({ isActive }) => (
          <>
            <Icon size={nested ? 15 : 18} />
            {!collapsed && <span className="flex-1">{item.label}</span>}
            {!collapsed && <ChevronRight className={cn('opacity-80', isActive && !nested && 'text-white')} size={15} />}
          </>
        )}
      </NavLink>
    </div>
  );
}

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState([]);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  const [theme, setTheme] = useState(() => localStorage.getItem('hrms-theme') || 'light');
  const [collapsed, setCollapsed] = useState(false);
  const [openParentId, setOpenParentId] = useState(null);
  const notificationsRef = useRef(null);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navQuery = useApiQuery(['page-navigation', user?.role, user?.companyId], '/pages/navigation', { enabled: Boolean(user) });
  const canLoadNotifications = ['COMPANY_ADMIN', 'EMPLOYEE'].includes(user?.role);
  const noticesQuery = useApiQuery(['header-notices', user?.role, user?.companyId], user?.role === 'EMPLOYEE' ? '/notices' : '/notices?all=true', { enabled: canLoadNotifications });
  const eventsQuery = useApiQuery(['header-events', user?.role, user?.companyId], user?.role === 'EMPLOYEE' ? '/events' : '/events?all=true', { enabled: canLoadNotifications });
  const leavesQuery = useApiQuery(['header-leaves', user?.role, user?.employeeId, user?.companyId], '/leave', { enabled: canLoadNotifications, refetchInterval: 30000 });
  const visibleNav = useMemo(() => navQuery.data || [], [navQuery.data]);
  const notificationItems = useMemo(() => buildHeaderNotifications(noticesQuery.data || [], eventsQuery.data || [], leavesQuery.data || [], user), [eventsQuery.data, leavesQuery.data, noticesQuery.data, user]);
  const notificationsLoading = canLoadNotifications && (noticesQuery.isLoading || eventsQuery.isLoading || leavesQuery.isLoading);
  const readStorageKey = user?.id ? `user-${user.id}` : 'anonymous';
  const unreadCount = notificationItems.filter((item) => !readNotifications.includes(item.id)).length;

  const markNotificationRead = (id) => {
    setReadNotifications((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id].slice(-80);
      saveReadNotifications(readStorageKey, next).catch(() => {});
      return next;
    });
  };

  useEffect(() => {
    const activeParent = visibleNav.find((item) => item.children?.some((child) => child.path === location.pathname));
    setOpenParentId(activeParent?.id || null);
    setNotificationsOpen(false);
  }, [location.pathname, visibleNav]);

  useEffect(() => {
    if (!notificationsOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!notificationsRef.current?.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setNotificationsOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [notificationsOpen]);

  useEffect(() => {
    let active = true;
    getReadNotifications(readStorageKey)
      .then((ids) => {
        if (active) setReadNotifications(ids);
      })
      .catch(() => {
        if (active) setReadNotifications([]);
      });
    return () => {
      active = false;
    };
  }, [readStorageKey]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const syncDesktopState = () => {
      setIsDesktop(media.matches);
      if (media.matches) setOpen(false);
    };

    syncDesktopState();
    media.addEventListener('change', syncDesktopState);
    return () => media.removeEventListener('change', syncDesktopState);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    localStorage.setItem('hrms-theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-app-bg">
      {open && !isDesktop && <button aria-label="Close sidebar overlay" className="fixed inset-0 z-20 bg-slate-950/20" onClick={() => setOpen(false)} />}
      <aside className={cn('sidebar-scrollbar fixed inset-y-0 left-0 z-30 overflow-y-auto border-r border-slate-200 bg-white transition-all duration-200 lg:translate-x-0', collapsed ? 'w-[72px]' : 'w-[233px]', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className={cn('flex h-[52px] items-center justify-between border-b border-slate-200 px-4', collapsed && 'justify-center px-2')}>
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center">
              <span className="absolute h-8 w-8 rounded-full border-[5px] border-[#2563eb] border-b-[#28a99a] border-l-[#28a99a]" />
              <BriefcaseBusiness className="relative text-[#2563eb]" size={17} />
            </div>
            {!collapsed && <p className="text-[22px] font-extrabold leading-none text-slate-900">HRMS</p>}
          </div>
          <button className={cn('hidden text-slate-500 lg:block', collapsed && 'absolute -right-3 top-4 rounded-full border border-slate-200 bg-white p-1 shadow-sm')} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed((current) => !current)}>
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={18} />}
          </button>
          <button className="text-slate-500 lg:hidden" aria-label="Close sidebar" onClick={() => setOpen(false)}><X size={18} /></button>
        </div>
        <div className={cn('m-3 flex items-center gap-3 rounded-lg bg-[#f1f5f9] p-3', collapsed && 'justify-center p-2')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffe2bd] text-[#ff7629]"><UserRound size={18} /></div>
          {!collapsed && <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-4 text-slate-900">{user?.role === 'EMPLOYEE' ? user?.name : 'Jone Copper'}</p>
            <p className="text-xs leading-4 text-slate-500">{user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role === 'EMPLOYEE' ? 'Employee' : 'Admin'}</p>
          </div>}
          {!collapsed && <ChevronRight className="ml-auto text-slate-500" size={16} />}
        </div>
        <nav className={cn('space-y-1 pb-4 pt-1', collapsed ? 'px-2' : 'px-3')}>
          {visibleNav.map((item) => <SidebarLink key={item.id} item={item} collapsed={collapsed} openParentId={openParentId} setOpenParentId={setOpenParentId} onNavigate={() => setOpen(false)} />)}
          {!navQuery.isLoading && visibleNav.length === 0 && !collapsed && <p className="px-3 py-2 text-xs font-semibold text-slate-400">No pages assigned</p>}
        </nav>
      </aside>
      <div className={cn('transition-all duration-200', collapsed ? 'lg:pl-[72px]' : 'lg:pl-[233px]')}>
        <header className="sticky top-0 z-20 flex h-[52px] items-center gap-3 border-b border-slate-200 bg-white px-[18px]">
          <button
            type="button"
            className="relative z-40 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
            aria-label="Open sidebar"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-6 w-6" strokeWidth={2.5} />
          </button>
          <div className="relative min-w-0 flex-1 sm:max-w-[291px]">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={15} />
            <input className="h-[30px] w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-slate-500 focus:border-[#e52529] focus:ring-2 focus:ring-red-100" placeholder="Search" />
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div ref={notificationsRef} className="relative">
              <button
                type="button"
                className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((current) => !current)}
              >
                <Bell size={16} />
                {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-10 z-50 w-[min(340px,calc(100vw-36px))] overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
                    <p className="text-sm font-extrabold text-slate-950">Notifications</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">{unreadCount} New</span>
                  </div>
                  <div className="app-scrollbar max-h-[430px] overflow-y-auto">
                    {notificationsLoading ? (
                      <p className="px-4 py-8 text-center text-sm font-medium text-slate-500">Loading notifications...</p>
                    ) : notificationItems.length ? (
                      notificationItems.map((item) => {
                        const isRead = readNotifications.includes(item.id);
                        return (
                          <Link
                            key={item.id}
                            to={item.href}
                            className={cn('block border-b border-slate-100 px-3 py-2 transition last:border-b-0 hover:bg-slate-50', !isRead && 'bg-red-50/40')}
                            onClick={() => {
                              markNotificationRead(item.id);
                              setNotificationsOpen(false);
                            }}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', isRead ? 'bg-slate-300' : item.type === 'Notice' ? 'bg-indigo-500' : item.type === 'Leave' ? 'bg-orange-500' : 'bg-emerald-500')} />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <p className={cn('truncate text-[12px] font-bold', isRead ? 'text-slate-600' : 'text-slate-950')}>{item.title}</p>
                                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">{item.type}</span>
                                  {!isRead && <span className="ml-auto shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-[#e52529]">New</span>}
                                </div>
                                {item.description && <p className="mt-0.5 line-clamp-1 text-[11px] leading-4 text-slate-500">{item.description}</p>}
                                {item.date && <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{formatHeaderDate(item.date)}</p>}
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <p className="px-4 py-8 text-center text-sm font-medium text-slate-500">No notifications available.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button className="flex h-8 items-center gap-2 rounded-full bg-red-50 px-3 text-xs font-bold text-[#e52529] transition hover:bg-[#e52529] hover:text-white" aria-label="Logout" onClick={logout}>
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        <main className="app-scrollbar p-[18px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
