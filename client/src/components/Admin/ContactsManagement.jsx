// src/components/Admin/ContactsManagement.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaSearch, FaEnvelope, FaPhone, FaCalendar, FaSync, FaTimes, FaCheck, FaReply, FaTrash } from 'react-icons/fa';
import './ContactsManagement.css';

const ContactsManagement = () => {
    const { showAlert, token } = useContext(AppContext);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0
    });
    const [selectedContact, setSelectedContact] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [response, setResponse] = useState('');

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/admin/contacts?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setContacts(data.data.contacts);
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error('Contacts fetch error:', error);
            showAlert('Failed to load contacts', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [filters]);

    const handleStatusUpdate = async (id, status) => {
        try {
            const res = await fetch(`/api/admin/contacts/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status, adminResponse: response })
            });

            const data = await res.json();
            if (data.success) {
                showAlert('Contact status updated', 'success');
                fetchContacts();
                setShowModal(false);
                setResponse('');
            }
        } catch (error) {
            showAlert('Failed to update status', 'error');
        }
    };

    const handleDeleteContact = async (id) => {
        if (!window.confirm('Are you sure you want to delete this inquiry? This cannot be undone.')) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/contacts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (data.success) {
                // Optimistic UI update: Remove immediately
                setContacts(prevContacts => prevContacts.filter(c => c._id !== id));
                showAlert('Inquiry deleted successfully', 'success');

                if (selectedContact && selectedContact._id === id) {
                    setShowModal(false);
                }

                // Fetch in background to ensure consistency
                fetchContacts();
            } else {
                showAlert(data.message || 'Failed to delete inquiry', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showAlert('Failed to delete inquiry', 'error');
        }
    };

    const ContactRow = ({ contact }) => (
        <tr className="contact-row">
            <td>
                <div className="contact-main">
                    <h4 className="contact-subject">{contact.subject}</h4>
                    <span className="contact-sender">by <span className="sender-name">{contact.name}</span></span>
                </div>
            </td>
            <td>
                <div className="contact-info">
                    <div className="info-item"><FaEnvelope className="icon" /> {contact.email}</div>
                    {contact.phone && <div className="info-item"><FaPhone className="icon" /> {contact.phone}</div>}
                </div>
            </td>
            <td>
                <div className="contact-date">
                    <FaCalendar className="icon" /> {new Date(contact.createdAt).toLocaleDateString()}
                </div>
            </td>
            <td>
                <span className={`status-badge ${contact.status}`}>
                    {contact.status}
                </span>
            </td>
            <td>
                <button
                    className="btn-icon info"
                    onClick={() => {
                        setSelectedContact(contact);
                        setShowModal(true);
                        setResponse(contact.adminResponse || ''); // Pre-fill if already replied
                    }}
                    title="View & Reply"
                >
                    <FaReply />
                </button>
                <button
                    className="btn-icon danger"
                    title="Delete Inquiry"
                    onClick={() => handleDeleteContact(contact._id)}
                >
                    <FaTrash />
                </button>
            </td>
        </tr>
    );

    return (
        <div className="contacts-management">
            <div className="page-header">
                <div className="header-title">
                    <h1>Customer Inquiries</h1>
                    <p>Manage support messages and email responses</p>
                </div>
                <div className="header-actions">
                    <button className="btn-primary" onClick={fetchContacts}>
                        <FaSync className={loading ? 'spinning' : ''} /> Refresh
                    </button>
                </div>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input type="text" placeholder="Search inquiries..." className="search-input" />
                </div>
                <select
                    className="filter-select"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="replied">Replied</option>
                    <option value="closed">Closed</option>
                </select>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading inquiries...</p>
                    </div>
                ) : (
                    <table className="contacts-table">
                        <thead>
                            <tr>
                                <th>Subject / From</th>
                                <th>Contact Details</th>
                                <th>Date Received</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-state">
                                        <FaEnvelope className="empty-icon" />
                                        <p>No inquiries found</p>
                                    </td>
                                </tr>
                            ) : (
                                contacts.map(c => <ContactRow key={c._id} contact={c} />)
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* View/Reply Modal */}
            {showModal && selectedContact && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Inquiry Details</h3>
                            <button className="close-modal" onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>

                        <div className="modal-body-scroll">
                            <div className="inquiry-meta-section">
                                <div className="meta-row">
                                    <div className="meta-item">
                                        <span className="label">From</span>
                                        <span className="value">{selectedContact.name} ({selectedContact.email})</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="label">Date</span>
                                        <span className="value">{new Date(selectedContact.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="meta-subject">
                                    <span className="label">Subject</span>
                                    <h4>{selectedContact.subject}</h4>
                                </div>
                            </div>

                            <div className="message-container">
                                <div className="message-label">Customer Message:</div>
                                <div className="message-content">
                                    {selectedContact.message}
                                </div>
                            </div>

                            {selectedContact.adminResponse && (
                                <div className="previous-response">
                                    <div className="message-label">Previous Response:</div>
                                    <p>{selectedContact.adminResponse}</p>
                                    <span className="response-date">Sent on {new Date(selectedContact.respondedAt).toLocaleDateString()}</span>
                                </div>
                            )}

                            {selectedContact.status !== 'closed' && (
                                <div className="reply-section">
                                    <div className="message-label">Your Reply:</div>
                                    <textarea
                                        className="reply-textarea"
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        placeholder="Type your response here... (This will be emailed to the customer)"
                                        rows="6"
                                    />
                                    <p className="email-disclaimer">
                                        <FaEnvelope /> This reply will be sent to <strong>{selectedContact.email}</strong> immediately.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            {selectedContact.status !== 'closed' ? (
                                <>
                                    <button
                                        className="btn-outline danger"
                                        onClick={() => handleStatusUpdate(selectedContact._id, 'closed')}
                                    >
                                        Close Inquiry
                                    </button>
                                    <button
                                        className="btn-primary"
                                        onClick={() => handleStatusUpdate(selectedContact._id, 'replied')}
                                        disabled={!response.trim()}
                                    >
                                        <FaReply /> Send Email & Mark Replied
                                    </button>
                                </>
                            ) : (
                                <button className="btn-primary" onClick={() => setShowModal(false)}>Close Window</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactsManagement;
