import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TransactionList from '../components/TransactionList';

const Dashboard = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');

      // 1. Fetch Account Info
      try {
        const res = await api.get('/accounts/me');
        setAccount(res.data.account);
      } catch (err) {
        console.error('Account fetch error:', err);
        setError(err.response?.data?.message || 'Failed to fetch account info');
      }

      // 2. Fetch Recent Transactions
      try {
        const txRes = await api.get('/transactions?limit=5');
        setRecent(txRes.data.transactions || []);
      } catch (err) {
        console.error('Recent transactions error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="panel empty-state">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="error-box">{error}</div>;
  }

  return (
    <div>
      <h1 className="page-title">Welcome back, {user?.name}</h1>
      <p className="page-subtitle">Here is a summary of your account</p>

      <div className="balance-card">
        <p>Current Balance</p>
        <h2>৳ {Number(account?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
        <small>Account: <strong>{account?.account_number}</strong> · Status: <strong>{account?.status}</strong></small>
      </div>

      <div className="quick-actions">
        <Link to="/deposit" className="action-card">💵<span>Deposit</span></Link>
        <Link to="/withdraw" className="action-card">💸<span>Withdraw</span></Link>
        <Link to="/transfer" className="action-card">🔁<span>Transfer</span></Link>
        <Link to="/transactions" className="action-card">📜<span>History</span></Link>
      </div>

      <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', color: '#1e293b' }}>
        Recent Transactions
      </h2>
      <TransactionList transactions={recent} />
    </div>
  );
};

export default Dashboard;