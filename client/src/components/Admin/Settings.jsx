import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaSave, FaEnvelope, FaShieldAlt, FaStore } from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  const { showNotification } = useContext(AppContext);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Settings fetch error:', error);
      showNotification('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error('Failed to save settings');

      const data = await response.json();
      
      if (data.success) {
        showNotification('Settings saved successfully', 'success');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      showNotification('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings">
      <div className="page-header">
        <h1>System Settings</h1>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={handleSaveSettings}
            disabled={saving}
          >
            <FaSave /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="settings-content">
        {/* Store Settings */}
        <div className="settings-section">
          <div className="section-header">
            <FaStore className="section-icon" />
            <h2>Store Settings</h2>
          </div>
          <div className="settings-grid">
            <div className="setting-group">
              <label>Store Name</label>
              <input
                type="text"
                value={settings.store?.name || ''}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  store: { ...prev.store, name: e.target.value }
                }))}
              />
            </div>
            <div className="setting-group">
              <label>Currency</label>
              <select
                value={settings.store?.currency || 'KES'}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  store: { ...prev.store, currency: e.target.value }
                }))}
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>
            <div className="setting-group">
              <label>Tax Rate (%)</label>
              <input
                type="number"
                value={settings.store?.taxRate || 0.16}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  store: { ...prev.store, taxRate: parseFloat(e.target.value) }
                }))}
                step="0.01"
                min="0"
                max="1"
              />
            </div>
            <div className="setting-group">
              <label>Free Shipping Threshold (KES)</label>
              <input
                type="number"
                value={settings.store?.freeShippingThreshold || 5000}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  store: { ...prev.store, freeShippingThreshold: parseInt(e.target.value) }
                }))}
              />
            </div>
            <div className="setting-group">
              <label>Shipping Price (KES)</label>
              <input
                type="number"
                value={settings.store?.shippingPrice || 500}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  store: { ...prev.store, shippingPrice: parseInt(e.target.value) }
                }))}
              />
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="settings-section">
          <div className="section-header">
            <FaEnvelope className="section-icon" />
            <h2>Email Settings</h2>
          </div>
          <div className="settings-grid">
            <div className="setting-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.email?.notifications || false}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    email: { ...prev.email, notifications: e.target.checked }
                  }))}
                />
                Enable Email Notifications
              </label>
            </div>
            <div className="setting-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.email?.orderConfirmations || false}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    email: { ...prev.email, orderConfirmations: e.target.checked }
                  }))}
                />
                Send Order Confirmations
              </label>
            </div>
            <div className="setting-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.email?.statusUpdates || false}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    email: { ...prev.email, statusUpdates: e.target.checked }
                  }))}
                />
                Send Status Updates
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="settings-section">
          <div className="section-header">
            <FaShieldAlt className="section-icon" />
            <h2>Security Settings</h2>
          </div>
          <div className="settings-grid">
            <div className="setting-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.security?.require2FA || false}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, require2FA: e.target.checked }
                  }))}
                />
                Require Two-Factor Authentication
              </label>
            </div>
            <div className="setting-group">
              <label>Session Timeout (hours)</label>
              <input
                type="number"
                value={settings.security?.sessionTimeout || 24}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                }))}
                min="1"
                max="168"
              />
            </div>
            <div className="setting-group">
              <label>Max Login Attempts</label>
              <input
                type="number"
                value={settings.security?.loginAttempts || 5}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, loginAttempts: parseInt(e.target.value) }
                }))}
                min="1"
                max="10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;