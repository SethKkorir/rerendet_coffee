import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBox, FaUser, FaShoppingBag, FaCog, FaHistory, FaTimes, FaShieldAlt } from 'react-icons/fa';
import './CommandPalette.css';

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const inputRef = useRef(null);

    // Toggle with Cmd+K or Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input on open
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const actions = [
        { id: 'home', label: 'Go to Dashboard', icon: <FaHistory />, path: '/admin/dashboard' },
        { id: 'orders', label: 'Manage Orders', icon: <FaShoppingBag />, path: '/admin/orders' },
        { id: 'products', label: 'Manage Products', icon: <FaBox />, path: '/admin/products' },
        { id: 'customers', label: 'Manage Customers', icon: <FaUser />, path: '/admin/users' },
        { id: 'settings', label: 'System Settings', icon: <FaCog />, path: '/admin/settings' },
        { id: 'logs', label: 'Security Logs', icon: <FaShieldAlt />, path: '/admin/dashboard?tab=logs' }
    ];

    const filteredActions = actions.filter(action =>
        action.label.toLowerCase().includes(query.toLowerCase())
    );

    const handleSelect = (path) => {
        if (path.includes('?tab=logs')) {
            // Handle query param navigation
            navigate('/admin/dashboard');
            // Ideally context should switch tab, but simple nav works for now
        } else {
            navigate(path);
        }
        setIsOpen(false);
        setQuery('');
    };

    if (!isOpen) return null;

    return (
        <div className="command-palette-overlay" onClick={() => setIsOpen(false)}>
            <div className="command-palette" onClick={e => e.stopPropagation()}>
                <div className="cp-header">
                    <FaSearch className="cp-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a command or search..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button className="cp-close" onClick={() => setIsOpen(false)}><FaTimes /></button>
                </div>
                <div className="cp-body">
                    {filteredActions.length > 0 ? (
                        <div className="cp-section">
                            <span className="cp-label">Navigation</span>
                            {filteredActions.map(action => (
                                <button
                                    key={action.id}
                                    className="cp-item"
                                    onClick={() => handleSelect(action.path)}
                                >
                                    <span className="cp-item-icon">{action.icon}</span>
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="cp-empty">No results found</div>
                    )}

                    {query.length > 2 && (
                        <div className="cp-section">
                            <span className="cp-label">Global Search</span>
                            <button className="cp-item" onClick={() => { navigate(`/admin/orders?search=${query}`); setIsOpen(false); }}>
                                <span className="cp-item-icon"><FaShoppingBag /></span>
                                Search Orders for "{query}"
                            </button>
                            <button className="cp-item" onClick={() => { navigate(`/admin/products?search=${query}`); setIsOpen(false); }}>
                                <span className="cp-item-icon"><FaBox /></span>
                                Search Products for "{query}"
                            </button>
                            <button className="cp-item" onClick={() => { navigate(`/admin/users?search=${query}`); setIsOpen(false); }}>
                                <span className="cp-item-icon"><FaUser /></span>
                                Search Users for "{query}"
                            </button>
                        </div>
                    )}
                </div>
                <div className="cp-footer">
                    <span>Navigation</span>
                    <span className="key-hint">↵ Select</span>
                    <span className="key-hint">Esc Close</span>
                </div>
            </div>
        </div>
    );
};



export default CommandPalette;
