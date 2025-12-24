import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, verifyEmail as apiVerifyEmail } from '../../api/api';
import { AppContext } from '../../context/AppContext';

function Register() {
  const { verifyEmailAndSetUser, notify } = useContext(AppContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('customer');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ email, firstName, password, userType });
      notify('Verification code sent to email', 'info');
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Register failed';
      alert(msg);
      notify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) { alert('Enter 6-digit code'); return; }
    setLoading(true);
    try {
      const res = await apiVerifyEmail({ email, code });
      // rely on verifyEmailAndSetUser (or set directly)
      const response = await verifyEmailAndSetUser({ email, code });
      const verifiedUser = response?.data?.user;
      notify('Welcome! Account verified.', 'success');
      
      // Redirect based on user type
      if (verifiedUser?.userType === 'admin' || userType === 'admin') {
        navigate('/admin');
      } else {
        setStep(3);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Verification failed';
      alert(msg);
      notify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <form onSubmit={handleVerify}>
        <input placeholder="Enter verification code" value={code} onChange={(e) => setCode(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</button>
      </form>
    );
  }

  return (
    <form onSubmit={handleRegister}>
      <select value={userType} onChange={(e) => setUserType(e.target.value)}>
        <option value="customer">Customer</option>
        <option value="admin">Admin</option>
      </select>
      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" required />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
      <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Register'}</button>
    </form>
  );
}

export default Register;