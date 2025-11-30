import React, { useState } from 'react';

export default function ReauthModal({ onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSuccess(password); // parent should call reauthenticate API
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Re-auth failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reauth-modal">
      <form onSubmit={handleSubmit}>
        <h4>Confirm your password</h4>
        <input type="password" placeholder="Current password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <div>
          <button type="submit" disabled={loading}>{loading ? 'Checking...' : 'Confirm'}</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}