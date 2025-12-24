import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import ReauthModal from '../Auth/ReauthModal';

export default function Profile() {
  const { user, reauthenticate, submitNameChange, startEmailChange, confirmPendingEmail, performChangePassword } = useContext(AppContext);
  const [editingName, setEditingName] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  const [showReauth, setShowReauth] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const requireReauthThen = (action) => {
    setPendingAction(() => action);
    setShowReauth(true);
  };

  const handleReauthSuccess = async (password) => {
    await reauthenticate(password);
    if (typeof pendingAction === 'function') await pendingAction();
    setPendingAction(null);
  };

  const handleSaveName = () => {
    requireReauthThen(async () => {
      await submitNameChange({ firstName, lastName, reason: 'User requested update' });
      setEditingName(false);
    });
  };

  const handleStartEmailChange = () => {
    requireReauthThen(async () => {
      await startEmailChange({ newEmail });
    });
  };

  const handleChangePassword = () => {
    requireReauthThen(async () => {
      await performChangePassword({ currentPassword, newPassword });
    });
  };

  return (
    <div className="profile-page">
      <h2>Profile</h2>
      <div>
        <label>Email</label>
        <div>{user?.email}</div>
        <input placeholder="New email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        <button onClick={handleStartEmailChange}>Change email (verify)</button>
      </div>

      <div>
        <h4>Name</h4>
        {editingName ? (
          <>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <button onClick={handleSaveName}>Save</button>
            <button onClick={() => setEditingName(false)}>Cancel</button>
          </>
        ) : (
          <>
            <div>{user?.firstName} {user?.lastName}</div>
            <button onClick={() => setEditingName(true)}>Edit</button>
          </>
        )}
      </div>

      <div>
        <h4>Change password</h4>
        <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button onClick={handleChangePassword}>Change password</button>
      </div>

      {showReauth && (
        <ReauthModal onClose={() => setShowReauth(false)} onSuccess={handleReauthSuccess} />
      )}
    </div>
  );
}