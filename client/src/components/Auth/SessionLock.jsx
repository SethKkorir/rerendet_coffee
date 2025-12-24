import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './SessionLock.css'; // We'll create this CSS next
import { FaLock, FaUser, FaGoogle } from 'react-icons/fa';

const SessionLock = () => {
    const {
        isLocked,
        user,
        unlockSession,
        logout,
        login,
        loginWithGoogle,
        showError
    } = useContext(AppContext);

    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second for the clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // If not locked, don't render anything
    if (!isLocked) return null;

    const handleUnlock = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Re-authenticate user
            // We reuse the login function but we need to pass true to indicate it's a re-auth
            // Actually, the login function in AppContext might not support re-auth without full login flow. 
            // Better approach: verify credentials against API.
            // Since we don't have a specific "verify-password" endpoint exposed in AppContext typically,
            // we can just use the login endpoint. If successful, we unlock.

            await login({ email: user.email, password });

            // If login throws, we won't get here.
            unlockSession();
            setPassword('');
        } catch (error) {
            console.error('Unlock failed', error);
            // Error is shown by login function context
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleUnlock = async () => {
        try {
            // For Google, we can trigger the Google Auth flow again.
            // We might need to render the Google Button or use the client directly.
            // Since the Google Button is usually a specific component, 
            // we can instruct the user to sign in again.

            /* GLOBAL GOOGLE */
            /* global google */
            if (window.google) {
                google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        console.log("Google prompt skipped");
                        showError("Please sign in with Google to unlock");
                    }
                });
            } else {
                showError("Google Sign-In not loaded");
            }

        } catch (error) {
            showError("Google Unlock failed");
        }
    };

    // Google Sign-In Callback Wrapper
    // We need to mount the Google button or handle the credential response
    useEffect(() => {
        if (isLocked && user?.googleId && window.google) {
            // Initialize Google Auth if needed or render button
            try {
                window.google.accounts.id.initialize({
                    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID", // It should use env
                    callback: async (response) => {
                        try {
                            await loginWithGoogle(response);
                            unlockSession();
                        } catch (err) {
                            console.error("Google Re-auth failed", err);
                        }
                    }
                });

                window.google.accounts.id.renderButton(
                    document.getElementById("googleLockBtn"),
                    { theme: "outline", size: "large", text: "signin_with" }
                );
            } catch (err) {
                console.error("Google script error", err);
            }
        }
    }, [isLocked, user, loginWithGoogle, unlockSession]);

    const handleLogout = () => {
        logout();
        unlockSession(); // Reset lock state as we are logging out
    };

    return (
        <div className="session-lock-overlay">
            <div className="session-lock-container">
                <div className="lock-header">
                    <FaLock className="lock-icon" />
                    <h2>Session Locked</h2>
                    <p className="lock-time">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                <div className="user-profile-preview">
                    {user?.profilePicture ? (
                        <img src={user.profilePicture} alt={user.firstName} className="lock-avatar" />
                    ) : (
                        <div className="lock-avatar-placeholder">
                            <FaUser />
                        </div>
                    )}
                    <h3>{user?.firstName} {user?.lastName}</h3>
                    <p>{user?.email}</p>
                </div>

                <div className="unlock-form-container">
                    {user?.googleId ? (
                        <div className="google-unlock">
                            <p>Sign in with Google to unlock</p>
                            <div id="googleLockBtn"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleUnlock} className="unlock-form">
                            <div className="input-group">
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                            <button type="submit" className="unlock-btn" disabled={loading}>
                                {loading ? 'Unlocking...' : 'Unlock'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="lock-footer">
                    <button onClick={handleLogout} className="text-btn">
                        Not you? Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionLock;
