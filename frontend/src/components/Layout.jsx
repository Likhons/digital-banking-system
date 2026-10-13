import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  House, Landmark, History, ArrowDownToLine, ArrowUpFromLine,
  ArrowLeftRight, Users, User, LogOut, Menu, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navGroups = [
  {
    title: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: House },
      { to: '/account', label: 'Account', icon: Landmark },
      { to: '/transactions', label: 'Transactions', icon: History },
    ],
  },
  {
    title: 'Money',
    items: [
      { to: '/deposit', label: 'Deposit', icon: ArrowDownToLine },
      { to: '/withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
      { to: '/transfer', label: 'Transfer', icon: ArrowLeftRight },
      { to: '/beneficiaries', label: 'Beneficiaries', icon: Users },
    ],
  },
  {
    title: 'Settings',
    items: [{ to: '/profile', label: 'Profile', icon: User }],
  },
];

const allItems = navGroups.flatMap((group) => group.items);

const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = allItems.find((item) => location.pathname.startsWith(item.to))?.label || 'DigiBank';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to logout?')) return;
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-mark"><Landmark size={20} /></span>
            DigiBank
          </div>
          <button className="sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav>
          {navGroups.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-group-title">{group.title}</div>
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={18} /> {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="sidebar-user-info">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)}></div>}

      <div className="main-area">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <div className="topbar-title">
            <strong>{currentPage}</strong>
            <span>{today}</span>
          </div>
          <div className="topbar-user">
            <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <span>{user?.name}</span>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
