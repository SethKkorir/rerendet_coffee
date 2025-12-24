import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaCreditCard, FaMobileAlt, FaEdit } from 'react-icons/fa';

const WalletTab = () => {
    const { user, updateUserProfile, loading, showSuccess, showError } = useContext(AppContext);
    const [isEditing, setIsEditing] = useState(false);
    const [mpesaPhone, setMpesaPhone] = useState(user?.wallet?.mpesaPhone || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateUserProfile({
                wallet: { mpesaPhone }
            });
            showSuccess('Wallet updated successfully');
            setIsEditing(false);
        } catch (error) {
            showError(error.message || 'Failed to update wallet');
        }
    };

    return (
        <div className="modern-dashboard-tab">
            <div className="tab-header">
                <h2>Wallet & Payment Methods</h2>
            </div>

            <div className="content-card">
                <div className="payment-method-item">
                    <div className="pm-icon mpesa">
                        <FaMobileAlt />
                    </div>
                    <div className="pm-details">
                        <h3>M-Pesa</h3>
                        <p className="text-muted">
                            {user?.wallet?.mpesaPhone ? `Phone: ${user.wallet.mpesaPhone}` : 'No default M-Pesa number saved'}
                        </p>
                    </div>
                    <div className="pm-actions">
                        <button
                            className="btn-outline btn-sm"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? 'Cancel' : (user?.wallet?.mpesaPhone ? 'Edit' : 'Add')}
                        </button>
                    </div>
                </div>

                {isEditing && (
                    <form className="modern-form mt-4" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>M-Pesa Phone Number</label>
                            <input
                                type="tel"
                                value={mpesaPhone}
                                onChange={(e) => setMpesaPhone(e.target.value)}
                                placeholder="e.g., 0712345678"
                                required
                            />
                            <small className="form-text text-muted">This number will be used as the default for M-Pesa payments.</small>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Phone Number'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="info-box mt-4">
                <FaCreditCard className="info-icon" />
                <p>Currently we only support M-Pesa payments. More payment methods coming soon.</p>
            </div>
        </div>
    );
};

export default WalletTab;
