import { useEffect, useState } from 'react';
import api from '../api/axios';

const Account = () => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await api.get('/accounts/me');
        setAccount(res.data.account);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load account');
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, []);

  if (loading) return <div className="panel empty-state">Loading...</div>;
  if (error) return <div className="error-box">{error}</div>;

  const rows = [
    ['Account Number', account.account_number],
    ['Account Type', account.account_type.toUpperCase()],
    ['Status', account.status.toUpperCase()],
    ['Opened On', new Date(account.created_at).toLocaleDateString()],
  ];

  return (
    <div>
      <h1 className="page-title">My Account</h1>
      <p className="page-subtitle">Your account details</p>

      <div className="balance-card">
        <p>Current Balance</p>
        <h2>৳ {Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
      </div>

      <div className="panel detail-list">
        {rows.map(([label, value]) => (
          <div className="detail-row" key={label}>
            <span className="detail-label">{label}</span>
            <span className="detail-value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Account;