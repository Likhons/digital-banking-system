import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [profileMsg, setProfileMsg] = useState({ error: '', success: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState({ error: '', success: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        setProfile({
          name: res.data.user.name,
          email: res.data.user.email,
          phone: res.data.user.phone || '',
        });
      } catch (err) {
        setProfileMsg({ error: err.response?.data?.message || 'Failed to load profile', success: '' });
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ error: '', success: '' });
    setProfileLoading(true);

    try {
      const res = await api.put('/profile', { name: profile.name, phone: profile.phone });
      updateUser({ name: res.data.user.name, phone: res.data.user.phone });
      setProfileMsg({ error: '', success: res.data.message });
    } catch (err) {
      setProfileMsg({ error: err.response?.data?.message || 'Something went wrong', success: '' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ error: '', success: '' });
    setPasswordLoading(true);

    try {
      const res = await api.put('/profile/password', passwords);
      setPasswordMsg({ error: '', success: res.data.message });
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPasswordMsg({ error: err.response?.data?.message || 'Something went wrong', success: '' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">My Profile</h1>
      <p className="page-subtitle">Manage your personal details and password</p>

      <form className="panel form-panel" onSubmit={handleProfileSubmit}>
        <h3>Personal Details</h3>
        {profileMsg.error && <div className="error-box">{profileMsg.error}</div>}
        {profileMsg.success && <div className="success-box">{profileMsg.success}</div>}

        <label>Full Name</label>
        <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />

        <label>Email (cannot be changed)</label>
        <input type="email" value={profile.email} disabled />

        <label>Phone</label>
        <input type="text" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />

        <button type="submit" disabled={profileLoading}>
          {profileLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <form className="panel form-panel profile-second" onSubmit={handlePasswordSubmit}>
        <h3>Change Password</h3>
        {passwordMsg.error && <div className="error-box">{passwordMsg.error}</div>}
        {passwordMsg.success && <div className="success-box">{passwordMsg.success}</div>}

        <label>Current Password</label>
        <input
          type="password"
          value={passwords.currentPassword}
          onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
          required
        />

        <label>New Password (min 6 characters)</label>
        <input
          type="password"
          value={passwords.newPassword}
          onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          required
        />

        <button type="submit" disabled={passwordLoading}>
          {passwordLoading ? 'Updating...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default Profile;