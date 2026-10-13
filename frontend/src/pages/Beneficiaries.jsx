import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Trash2, UserPlus, Users } from 'lucide-react';
import api from '../api/axios';

const Beneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [formData, setFormData] = useState({ name: '', accountNumber: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  // add/delete এর পর এটা বাড়ালেই লিস্ট আবার fetch হবে
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        const res = await api.get('/beneficiaries');
        setBeneficiaries(res.data.beneficiaries);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load beneficiaries');
      }
    };
    fetchBeneficiaries();
  }, [reloadKey]);

  const fetchBeneficiaries = () => setReloadKey((k) => k + 1);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/beneficiaries', formData);
      setSuccess(res.data.message);
      setFormData({ name: '', accountNumber: '' });
      fetchBeneficiaries();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this beneficiary?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await api.delete(`/beneficiaries/${id}`);
      setSuccess(res.data.message);
      fetchBeneficiaries();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <h1 className="page-title">Beneficiaries</h1>
      <p className="page-subtitle">Save people you send money to often</p>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <label>Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Jane Doe" required />

        <label>Account Number</label>
        <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="e.g. ACC1234567890" required />

        <button type="submit" disabled={loading}>
          <UserPlus size={18} /> {loading ? 'Saving...' : 'Add Beneficiary'}
        </button>
      </form>

      <h3 className="section-title">Saved Beneficiaries</h3>
      {beneficiaries.length === 0 ? (
        <div className="panel empty-state">
          <Users size={36} />
          <p>No beneficiaries saved yet</p>
        </div>
      ) : (
        <div className="ben-list">
          {beneficiaries.map((b) => (
            <div className="panel ben-item" key={b.id}>
              <div className="ben-person">
                <div className="avatar">{b.name.charAt(0).toUpperCase()}</div>
                <div>
                  <strong>{b.name}</strong>
                  <div className="ben-acc mono">{b.account_number}</div>
                </div>
              </div>
              <div className="ben-actions">
                <Link to={`/transfer?to=${b.account_number}`} className="ben-send"><Send size={15} /> Send</Link>
                <button className="ben-delete" onClick={() => handleDelete(b.id)} aria-label="Delete beneficiary"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Beneficiaries;