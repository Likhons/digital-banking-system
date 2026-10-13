import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Users } from 'lucide-react';
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
      <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
      <p className="page-subtitle">Here is a summary of your account</p>

      <div className="balance-card">
        <div className="balance-card-top">
          <span>Total Balance</span>
          <span className="status-pill">{account?.status}</span>
        </div>
        <h2>৳ {Number(account?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
        <div className="balance-card-bottom">
          <div>
            <small>Account Number</small>
            <strong className="mono">{account?.account_number}</strong>
          </div>
          <div>
            <small>Type</small>
            <strong>{account?.account_type}</strong>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/deposit" className="action-card">
          <span className="action-icon green"><ArrowDownToLine size={20} /></span>
          <span>Deposit</span>
        </Link>
        <Link to="/withdraw" className="action-card">
          <span className="action-icon red"><ArrowUpFromLine size={20} /></span>
          <span>Withdraw</span>
        </Link>
        <Link to="/transfer" className="action-card">
          <span className="action-icon blue"><ArrowLeftRight size={20} /></span>
          <span>Transfer</span>
        </Link>
        <Link to="/beneficiaries" className="action-card">
          <span className="action-icon purple"><Users size={20} /></span>
          <span>Beneficiaries</span>
        </Link>
      </div>

      <div className="section-header">
        <h3 className="section-title">Recent Transactions</h3>
        <Link to="/transactions" className="link-btn">View all</Link>
      </div>
      <TransactionList transactions={recent} />
    </div>
  );
};

export default Dashboard;
