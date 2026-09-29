import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="auth-container">
    <div className="auth-card" style={{ textAlign: 'center' }}>
      <h2>404</h2>
      <p className="auth-subtitle">This page does not exist</p>
      <Link to="/dashboard" className="ben-send" style={{ marginTop: '1rem' }}>Back to Dashboard</Link>
    </div>
  </div>
);

export default NotFound;