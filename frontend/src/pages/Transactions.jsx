import { useEffect, useState } from 'react';
import api from '../api/axios';
import TransactionList from '../components/TransactionList';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/transactions?page=${page}&limit=10`);
        setTransactions(res.data.transactions);
        setPagination(res.data.pagination);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [page]);

  return (
    <div>
      <h1 className="page-title">Transaction History</h1>
      <p className="page-subtitle">All deposits, withdrawals and transfers</p>

      {error && <div className="error-box">{error}</div>}
      {loading ? <div className="panel empty-state">Loading...</div> : <TransactionList transactions={transactions} />}

      <div className="pagination">
        <button onClick={() => setPage(page - 1)} disabled={page <= 1}>← Previous</button>
        <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
        <button onClick={() => setPage(page + 1)} disabled={page >= pagination.totalPages}>Next →</button>
      </div>
    </div>
  );
};

export default Transactions;