import { useState } from 'react';
import api from '../api/axios';

const Withdraw = () => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/transactions/withdraw', { amount });
      setSuccess(`${res.data.message}. New balance: ৳ ${Number(res.data.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Withdraw Money</h1>
      <p className="page-subtitle">Take funds out of your account</p>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <label>Amount (৳)</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Withdraw'}
        </button>
      </form>
    </div>
  );
};

export default Withdraw;