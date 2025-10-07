import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

function Account() {
  const { user } = useContext(AppContext);

  if (!user) return <div>Please log in to view your account.</div>;

  return (
    <div>
      <h2>Account Details</h2>
      <img src={user.profilePicture} alt={user.firstName} style={{ borderRadius: '50%', width: 96 }} />
      <p>Name: {user.firstName} {user.lastName}</p>
      <p>Email: {user.email}</p>
      {/* Add more account info or edit form here */}
    </div>
  );
}

export default Account;