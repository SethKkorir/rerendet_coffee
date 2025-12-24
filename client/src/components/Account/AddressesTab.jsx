import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaMapMarkerAlt, FaPlus, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const AddressesTab = () => {
    const { user, updateUserProfile, loading, showSuccess, showError } = useContext(AppContext);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.shippingInfo?.firstName || user?.firstName || '',
        lastName: user?.shippingInfo?.lastName || user?.lastName || '',
        phone: user?.shippingInfo?.phone || user?.phone || '',
        address: user?.shippingInfo?.address || '',
        city: user?.shippingInfo?.city || '',
        country: user?.shippingInfo?.country || 'Kenya',
        zip: user?.shippingInfo?.zip || ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateUserProfile({
                shippingInfo: formData
            });
            showSuccess('Address updated successfully');
            setIsEditing(false);
        } catch (error) {
            showError(error.message || 'Failed to update address');
        }
    };

    return (
        <div className="modern-dashboard-tab">
            <div className="tab-header">
                <h2>Address Book</h2>
                {!isEditing && (
                    <button
                        className="btn-primary btn-sm"
                        onClick={() => setIsEditing(true)}
                    >
                        <FaEdit /> Edit Address
                    </button>
                )}
            </div>

            <div className="content-card">
                {!isEditing ? (
                    user?.shippingInfo?.address ? (
                        <div className="address-item">
                            <div className="address-details">
                                <h4>Default Shipping Address</h4>
                                <p>{user.shippingInfo.firstName} {user.shippingInfo.lastName}</p>
                                <p>{user.shippingInfo.address}</p>
                                <p>{user.shippingInfo.city}, {user.shippingInfo.country} {user.shippingInfo.zip}</p>
                                <p>Tel: {user.shippingInfo.phone}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state-small">
                            <FaMapMarkerAlt className="empty-icon-small" />
                            <p>No default address saved yet.</p>
                            <button
                                className="btn-outline btn-sm"
                                onClick={() => setIsEditing(true)}
                            >
                                Add Address
                            </button>
                        </div>
                    )
                ) : (
                    <form className="modern-form" onSubmit={handleSubmit}>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Street, Apartment, Plot No."
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>City / Town</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-outline"
                                onClick={() => setIsEditing(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Address'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddressesTab;
