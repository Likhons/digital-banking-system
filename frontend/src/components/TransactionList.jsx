const labels = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  transfer_in: 'Transfer In',
  transfer_out: 'Transfer Out',
};

const isCredit = (type) => type === 'deposit' || type === 'transfer_in';

const TransactionList = ({ transactions }) => {
  if (transactions.length === 0) {
    return <div className="panel empty-state">No transactions yet</div>;
  }

  return (
    <div className="panel table-wrap">
      <table className="tx-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Reference</th>
            <th className="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{new Date(tx.created_at).toLocaleString()}</td>
              <td><span className={`badge ${isCredit(tx.type) ? 'credit' : 'debit'}`}>{labels[tx.type]}</span></td>
              <td>{tx.reference}</td>
              <td className={`right amount ${isCredit(tx.type) ? 'credit-text' : 'debit-text'}`}>
                {isCredit(tx.type) ? '+' : '-'}৳ {Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;