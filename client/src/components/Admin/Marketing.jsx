// src/components/Admin/Marketing.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaPaperPlane, FaUsers, FaHistory } from 'react-icons/fa';
import './Admin.css'; // Reusing general admin styles

const Marketing = () => {
    const { token, showNotification } = useContext(AppContext);
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        content: ''
    });

    useEffect(() => {
        fetchSubscribers();
    }, [token]);

    const fetchSubscribers = async () => {
        try {
            const response = await fetch('/api/newsletter', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setSubscribers(data.data);
            }
        } catch (error) {
            console.error('Error fetching subscribers:', error);
            showNotification('Failed to load subscribers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!formData.subject || !formData.content) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (!window.confirm(`Are you sure you want to send this newsletter to ${subscribers.length} subscribers?`)) {
            return;
        }

        setSending(true);

        try {
            const response = await fetch('/api/newsletter/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (data.success) {
                showNotification(data.message, 'success');
                setFormData({ subject: '', content: '' });
            } else {
                showNotification(data.message || 'Failed to send newsletter', 'error');
            }
        } catch (error) {
            console.error('Send error:', error);
            showNotification('Failed to send newsletter', 'error');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header-actions">
                <h2>Marketing Dashboard</h2>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--color-primary-light)' }}>
                        <FaUsers />
                    </div>
                    <div className="stat-info">
                        <h3>Total Subscribers</h3>
                        <p className="stat-value">{loading ? '...' : subscribers.length}</p>
                    </div>
                </div>
            </div>

            <div className="content-card" style={{ marginTop: '2rem' }}>
                <h3>Compose Newsletter</h3>
                <form onSubmit={handleSend} className="admin-form">
                    <div className="form-group">
                        <label>Subject Line</label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="e.g. New Single Origin from Ethiopia!"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Content (HTML Supported)</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="<p>Hello Coffee Lovers...</p>"
                            rows="10"
                            required
                            style={{ fontFamily: 'monospace' }}
                        />
                        <small className="form-hint">Tip: You can use basic HTML tags for formatting.</small>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={sending || subscribers.length === 0}
                        >
                            {sending ? 'Sending...' : (
                                <>
                                    <FaPaperPlane style={{ marginRight: '8px' }} />
                                    Send Broadcast
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="content-card" style={{ marginTop: '2rem' }}>
                <h3>Subscriber List</h3>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.slice(0, 10).map((sub) => (
                                <tr key={sub._id}>
                                    <td>{sub.email}</td>
                                    <td>
                                        <span className={`status-badge ${sub.isSubscribed ? 'active' : 'inactive'}`}>
                                            {sub.isSubscribed ? 'Subscribed' : 'Unsubscribed'}
                                        </span>
                                    </td>
                                    <td>{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {subscribers.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center' }}>No subscribers yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {subscribers.length > 10 && (
                        <div style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
                            Showing recent 10 of {subscribers.length} subscribers
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Marketing;
