import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="notfound">
    <div className="auth-card">
      <h1 className="notfound-code">404</h1>
      <p className="auth-subtitle">This page does not exist</p>
      <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
    </div>
  </div>
);

export default NotFound;
