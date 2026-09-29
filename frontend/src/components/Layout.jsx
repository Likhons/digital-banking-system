import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/account', label: 'Account', icon: '🏦' }, // <--- Added
  { to: '/deposit', label: 'Deposit', icon: '💵' },
  { to: '/transactions', label: 'Transactions', icon: '📜' },
  { to: '/transfer', label: 'Transfer', icon: '🔄' },
  { to: '/beneficiaries', label: 'Beneficiaries', icon: '👥' },
  { to: '/withdraw', label: 'Withdraw', icon: '💸' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
  if (!window.confirm('Are you sure you want to logout?')) return;
  logoutUser();
  navigate('/login');
};

  return (
    <div className="app-layout">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">🏦 DigiBank</div>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMenuOpen(false)}
            >
              <span>{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)}></div>}

      <div className="main-area">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMenuOpen(true)}>☰</button>
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