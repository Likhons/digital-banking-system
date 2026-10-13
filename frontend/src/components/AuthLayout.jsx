import { Landmark, ShieldCheck, Zap, Lock } from 'lucide-react';

const features = [
  { icon: Zap, text: 'Instant transfers between accounts' },
  { icon: ShieldCheck, text: 'Every transaction is atomic and safe' },
  { icon: Lock, text: 'Encrypted passwords & secure sessions' },
];

const AuthLayout = ({ children }) => (
  <div className="auth-container">
    <div className="auth-brand">
      <div className="sidebar-logo">
        <span className="logo-mark"><Landmark size={20} /></span>
        DigiBank
      </div>

      <div className="auth-brand-body">
        <h1>Banking that moves at your speed.</h1>
        <p>Deposit, withdraw and send money in seconds — all from one simple dashboard.</p>
        <ul className="auth-features">
          {features.map(({ icon: Icon, text }) => (
            <li key={text}><span><Icon size={18} /></span>{text}</li>
          ))}
        </ul>
      </div>

      <small>© {new Date().getFullYear()} DigiBank</small>
    </div>

    <div className="auth-main">{children}</div>
  </div>
);

export default AuthLayout;
