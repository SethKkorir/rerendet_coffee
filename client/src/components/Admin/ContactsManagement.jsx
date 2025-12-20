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

    const ContactRow = ({ contact }) => (
        <tr className="contact-row">
            <td>
                <div className="contact-main">
                    <h4>{contact.name}</h4>
                    <span>{contact.subject}</span>
                </div>
            </td>
            <td>
                <div className="contact-info">
                    <div><FaEnvelope /> {contact.email}</div>
                    {contact.phone && <div><FaPhone /> {contact.phone}</div>}
                </div>
            </td>
            <td>
                <div className="contact-date">
                    <FaCalendar /> {new Date(contact.createdAt).toLocaleDateString()}
                </div>
            </td>
            <td>
                <span className={`status-badge ${contact.status}`}>
                    {contact.status}
                </span>
            </td>
            <td>
                <button
                    className="btn-view"
                    onClick={() => {
                        setSelectedContact(contact);
                        setShowModal(true);
                    }}
                >
                    View / Reply
                </button>
            </td>
        </tr>
    );

    return (
        <div className="contacts-management">
            <div className="page-header">
                <div className="header-title">
                    <h1>Customer Inquiries</h1>
                    <p>Manage messages and support requests</p>
                </div>
                <button className="btn-refresh" onClick={fetchContacts}>
                    <FaSync className={loading ? 'spinning' : ''} /> Refresh
                </button>
            </div>

            <div className="filters-section">
                <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                >
                    <option value="all">All Inquiries</option>
                    <option value="pending">Pending</option>
                    <option value="replied">Replied</option>
                    <option value="closed">Closed</option>
                </select>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : (
                    <table className="contacts-table">
                        <thead>
                            <tr>
                                <th>Customer / Subject</th>
                                <th>Contact Info</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.length === 0 ? (
                                <tr><td colSpan="5" className="empty-state">No inquiries found</td></tr>
                            ) : (
                                contacts.map(c => <ContactRow key={c._id} contact={c} />)
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && selectedContact && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Inquiry: {selectedContact.subject}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>
                        <div className="modal-body">
                            <div className="inquiry-details">
                                <p><strong>From:</strong> {selectedContact.name} ({selectedContact.email})</p>
                                <p><strong>Date:</strong> {new Date(selectedContact.createdAt).toLocaleString()}</p>
                                <div className="message-box">
                                    <strong>Message:</strong>
                                    <p>{selectedContact.message}</p>
                                </div>
                            </div>

                            {selectedContact.status !== 'closed' && (
                                <div className="reply-section">
                                    <label>Your Response / Internal Note:</label>
                                    <textarea
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        placeholder="Type your response here..."
                                    />
                                    <div className="reply-actions">
                                        <button
                                            className="btn-replied"
                                            onClick={() => handleStatusUpdate(selectedContact._id, 'replied')}
                                        >
                                            <FaReply /> Mark as Replied
                                        </button>
                                        <button
                                            className="btn-closed"
                                            onClick={() => handleStatusUpdate(selectedContact._id, 'closed')}
                                        >
                                            <FaCheck /> Close Inquiry
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactsManagement;
