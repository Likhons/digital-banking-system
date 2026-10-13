import { ArrowDownLeft, ArrowUpRight, Inbox } from 'lucide-react';

const labels = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  transfer_in: 'Transfer In',
  transfer_out: 'Transfer Out',
};

const isCredit = (type) => type === 'deposit' || type === 'transfer_in';

const formatDate = (value) =>
  new Date(value).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });

const TransactionList = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="panel empty-state">
        <Inbox size={36} />
        <p>No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="panel tx-list">
      {transactions.map((tx) => {
        const credit = isCredit(tx.type);
        const Icon = credit ? ArrowDownLeft : ArrowUpRight;

        return (
          <div className="tx-row" key={tx.id}>
            <div className={`tx-icon ${credit ? 'credit' : 'debit'}`}>
              <Icon size={18} />
            </div>
            <div className="tx-info">
              <div className="tx-title">{labels[tx.type]}</div>
              <div className="tx-ref">{tx.reference}</div>
            </div>
            <div className="tx-meta">
              <div className={`amount ${credit ? 'credit-text' : 'debit-text'}`}>
                {credit ? '+' : '-'}৳ {Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="tx-date">{formatDate(tx.created_at)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;
