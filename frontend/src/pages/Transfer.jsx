import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const Transfer = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    receiverAccountNumber: searchParams.get('to') || '',
    amount: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/transactions/transfer', formData);
      setSuccess(res.data.message || 'Transfer successful');
      setFormData({ receiverAccountNumber: '', amount: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Transfer Money</h1>
      <p className="page-subtitle">Send funds to another account</p>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <label>Receiver Account Number</label>
        <input
          type="text"
          name="receiverAccountNumber"
          value={formData.receiverAccountNumber}
          onChange={handleChange}
          placeholder="e.g. ACC1234567890"
          required
        />

        <label>Amount (৳)</label>
        <input
          type="number"
          step="0.01"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Transfer'}
        </button>
      </form>
    </div>
  );
};

export default Transfer;