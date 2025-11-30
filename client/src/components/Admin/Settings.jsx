// src/components/Admin/Settings.jsx - COMPLETELY REWRITTEN
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { 
  FaSave, FaStore, FaCreditCard, FaEnvelope, 
  FaShieldAlt, FaBell, FaGlobe, FaTools,
  FaCheck, FaTimes, FaUpload, FaImage
} from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  const { showNotification, token } = useContext(AppContext);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('store');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
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
        if (data.data.store?.logo) {
          setLogoPreview(data.data.store.logo);
        }
      }
    } catch (error) {
      console.error('Settings fetch error:', error);
      showNotification('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Handle logo upload if new file selected
      let updatedSettings = { ...settings };
      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);
        
        const uploadResponse = await fetch('/api/admin/upload/logo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          updatedSettings.store.logo = uploadData.data.url;
        }
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedSettings)
      });

      if (!response.ok) throw new Error('Failed to save settings');

      const data = await response.json();
      
      if (data.success) {
        showNotification('Settings saved successfully', 'success');
        setSettings(data.data);
        setLogoFile(null);
      }
    } catch (error) {
      console.error('Save settings error:', error);
      showNotification('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section, subSection, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: {
          ...prev[section]?.[subSection],
          [field]: value
        }
      }
    }));
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours?.[day],
          [field]: field === 'closed' ? value === 'true' : value
        }
      }
    }));
  };

  const TabButton = ({ id, icon, label, isActive }) => (
    <button
      className={`tab-btn ${isActive ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      {icon} {label}
    </button>
  );

  const SettingSection = ({ title, children }) => (
    <div className="setting-section">
      <h3>{title}</h3>
      <div className="setting-content">
        {children}
      </div>
    </div>
  );

  const InputField = ({ label, type = 'text', value, onChange, placeholder, ...props }) => (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );

  const CheckboxField = ({ label, checked, onChange }) => (
    <div className="form-group checkbox-group">
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={checked || false}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="checkmark"></span>
        {label}
      </label>
    </div>
  );

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

      <div className="settings-container">
        {/* Sidebar Tabs */}
        <div className="settings-sidebar">
          <TabButton 
            id="store" 
            icon={<FaStore />} 
            label="Store Info" 
            isActive={activeTab === 'store'} 
          />
          <TabButton 
            id="payment" 
            icon={<FaCreditCard />} 
            label="Payment" 
            isActive={activeTab === 'payment'} 
          />
          <TabButton 
            id="email" 
            icon={<FaEnvelope />} 
            label="Email" 
            isActive={activeTab === 'email'} 
          />
          <TabButton 
            id="notifications" 
            icon={<FaBell />} 
            label="Notifications" 
            isActive={activeTab === 'notifications'} 
          />
          <TabButton 
            id="security" 
            icon={<FaShieldAlt />} 
            label="Security" 
            isActive={activeTab === 'security'} 
          />
          <TabButton 
            id="seo" 
            icon={<FaGlobe />} 
            label="SEO" 
            isActive={activeTab === 'seo'} 
          />
          <TabButton 
            id="maintenance" 
            icon={<FaTools />} 
            label="Maintenance" 
            isActive={activeTab === 'maintenance'} 
          />
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {/* Store Information Tab */}
          {activeTab === 'store' && (
            <div className="tab-content">
              <SettingSection title="Store Details">
                <div className="form-grid">
                  <InputField
                    label="Store Name"
                    value={settings.store?.name}
                    onChange={(value) => handleInputChange('store', 'name', value)}
                    placeholder="Rerendet Coffee"
                  />
                  <InputField
                    label="Store Email"
                    type="email"
                    value={settings.store?.email}
                    onChange={(value) => handleInputChange('store', 'email', value)}
                    placeholder="info@rerendetcoffee.com"
                  />
                  <InputField
                    label="Store Phone"
                    value={settings.store?.phone}
                    onChange={(value) => handleInputChange('store', 'phone', value)}
                    placeholder="+254700000000"
                  />
                  <InputField
                    label="Store Address"
                    value={settings.store?.address}
                    onChange={(value) => handleInputChange('store', 'address', value)}
                    placeholder="Nairobi, Kenya"
                  />
                </div>
              </SettingSection>

              <SettingSection title="Store Logo">
                <div className="logo-upload">
                  <div className="logo-preview">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Store Logo" />
                    ) : (
                      <div className="logo-placeholder">
                        <FaImage size={40} />
                        <span>No Logo</span>
                      </div>
                    )}
                  </div>
                  <div className="upload-controls">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="logo-upload" className="btn-outline">
                      <FaUpload /> Choose Logo
                    </label>
                    {logoPreview && (
                      <button 
                        className="btn-outline danger"
                        onClick={() => {
                          setLogoPreview('');
                          setLogoFile(null);
                          handleInputChange('store', 'logo', '');
                        }}
                      >
                        <FaTimes /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </SettingSection>

              <SettingSection title="Business Hours">
                <div className="business-hours">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <div key={day} className="business-day">
                      <div className="day-header">
                        <CheckboxField
                          label={day.charAt(0).toUpperCase() + day.slice(1)}
                          checked={!settings.businessHours?.[day]?.closed}
                          onChange={(checked) => handleBusinessHoursChange(day, 'closed', !checked)}
                        />
                      </div>
                      <div className="time-inputs">
                        <InputField
                          label="Open"
                          type="time"
                          value={settings.businessHours?.[day]?.open || '09:00'}
                          onChange={(value) => handleBusinessHoursChange(day, 'open', value)}
                          disabled={settings.businessHours?.[day]?.closed}
                        />
                        <InputField
                          label="Close"
                          type="time"
                          value={settings.businessHours?.[day]?.close || '17:00'}
                          onChange={(value) => handleBusinessHoursChange(day, 'close', value)}
                          disabled={settings.businessHours?.[day]?.closed}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </SettingSection>
            </div>
          )}

          {/* Payment Settings Tab */}
          {activeTab === 'payment' && (
            <div className="tab-content">
              <SettingSection title="Currency & Pricing">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Currency</label>
                    <select
                      value={settings.payment?.currency || 'KES'}
                      onChange={(e) => handleInputChange('payment', 'currency', e.target.value)}
                    >
                      <option value="KES">Kenyan Shilling (KES)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                  <InputField
                    label="Tax Rate (%)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.payment?.taxRate * 100 || 16}
                    onChange={(value) => handleInputChange('payment', 'taxRate', parseFloat(value) / 100)}
                  />
                  <InputField
                    label="Free Shipping Threshold (KES)"
                    type="number"
                    value={settings.payment?.freeShippingThreshold || 5000}
                    onChange={(value) => handleInputChange('payment', 'freeShippingThreshold', parseInt(value))}
                  />
                  <InputField
                    label="Standard Shipping Price (KES)"
                    type="number"
                    value={settings.payment?.shippingPrice || 500}
                    onChange={(value) => handleInputChange('payment', 'shippingPrice', parseInt(value))}
                  />
                </div>
              </SettingSection>

              <SettingSection title="Payment Methods">
                <div className="payment-methods">
                  <CheckboxField
                    label="M-Pesa"
                    checked={settings.payment?.paymentMethods?.mpesa}
                    onChange={(checked) => handleNestedChange('payment', 'paymentMethods', 'mpesa', checked)}
                  />
                  <CheckboxField
                    label="Credit/Debit Card"
                    checked={settings.payment?.paymentMethods?.card}
                    onChange={(checked) => handleNestedChange('payment', 'paymentMethods', 'card', checked)}
                  />
                  <CheckboxField
                    label="Cash on Delivery"
                    checked={settings.payment?.paymentMethods?.cashOnDelivery}
                    onChange={(checked) => handleNestedChange('payment', 'paymentMethods', 'cashOnDelivery', checked)}
                  />
                </div>
              </SettingSection>
            </div>
          )}

          {/* Email Settings Tab */}
          {activeTab === 'email' && (
            <div className="tab-content">
              <SettingSection title="SMTP Configuration">
                <div className="form-grid">
                  <CheckboxField
                    label="Enable Email System"
                    checked={settings.email?.enabled}
                    onChange={(checked) => handleInputChange('email', 'enabled', checked)}
                  />
                  <InputField
                    label="SMTP Host"
                    value={settings.email?.host}
                    onChange={(value) => handleInputChange('email', 'host', value)}
                    placeholder="smtp.gmail.com"
                  />
                  <InputField
                    label="SMTP Port"
                    type="number"
                    value={settings.email?.port}
                    onChange={(value) => handleInputChange('email', 'port', parseInt(value))}
                    placeholder="587"
                  />
                  <CheckboxField
                    label="Use SSL/TLS"
                    checked={settings.email?.secure}
                    onChange={(checked) => handleInputChange('email', 'secure', checked)}
                  />
                  <InputField
                    label="SMTP Username"
                    type="email"
                    value={settings.email?.auth?.user}
                    onChange={(value) => handleNestedChange('email', 'auth', 'user', value)}
                  />
                  <InputField
                    label="SMTP Password"
                    type="password"
                    value={settings.email?.auth?.pass}
                    onChange={(value) => handleNestedChange('email', 'auth', 'pass', value)}
                  />
                  <InputField
                    label="From Email"
                    type="email"
                    value={settings.email?.from}
                    onChange={(value) => handleInputChange('email', 'from', value)}
                    placeholder="Rerendet Coffee <noreply@rerendetcoffee.com>"
                  />
                </div>
              </SettingSection>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="tab-content">
              <SettingSection title="Admin Notifications">
                <div className="notification-grid">
                  <CheckboxField
                    label="New Order Notifications"
                    checked={settings.notifications?.admin?.newOrder}
                    onChange={(checked) => handleNestedChange('notifications', 'admin', 'newOrder', checked)}
                  />
                  <CheckboxField
                    label="Low Stock Alerts"
                    checked={settings.notifications?.admin?.lowStock}
                    onChange={(checked) => handleNestedChange('notifications', 'admin', 'lowStock', checked)}
                  />
                  <CheckboxField
                    label="New User Registrations"
                    checked={settings.notifications?.admin?.newUser}
                    onChange={(checked) => handleNestedChange('notifications', 'admin', 'newUser', checked)}
                  />
                  <CheckboxField
                    label="Contact Form Submissions"
                    checked={settings.notifications?.admin?.contactForm}
                    onChange={(checked) => handleNestedChange('notifications', 'admin', 'contactForm', checked)}
                  />
                </div>
              </SettingSection>

              <SettingSection title="Customer Notifications">
                <div className="notification-grid">
                  <CheckboxField
                    label="Order Confirmation Emails"
                    checked={settings.notifications?.customer?.orderConfirmation}
                    onChange={(checked) => handleNestedChange('notifications', 'customer', 'orderConfirmation', checked)}
                  />
                  <CheckboxField
                    label="Order Status Updates"
                    checked={settings.notifications?.customer?.orderStatus}
                    onChange={(checked) => handleNestedChange('notifications', 'customer', 'orderStatus', checked)}
                  />
                  <CheckboxField
                    label="Shipping Notifications"
                    checked={settings.notifications?.customer?.shipping}
                    onChange={(checked) => handleNestedChange('notifications', 'customer', 'shipping', checked)}
                  />
                  <CheckboxField
                    label="Promotional Emails"
                    checked={settings.notifications?.customer?.promotions}
                    onChange={(checked) => handleNestedChange('notifications', 'customer', 'promotions', checked)}
                  />
                </div>
              </SettingSection>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="tab-content">
              <SettingSection title="Security Settings">
                <div className="form-grid">
                  <CheckboxField
                    label="Require Two-Factor Authentication for Admins"
                    checked={settings.security?.require2FA}
                    onChange={(checked) => handleInputChange('security', 'require2FA', checked)}
                  />
                  <InputField
                    label="Session Timeout (hours)"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.security?.sessionTimeout}
                    onChange={(value) => handleInputChange('security', 'sessionTimeout', parseInt(value))}
                  />
                  <InputField
                    label="Max Login Attempts"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.security?.maxLoginAttempts}
                    onChange={(value) => handleInputChange('security', 'maxLoginAttempts', parseInt(value))}
                  />
                  <InputField
                    label="Minimum Password Length"
                    type="number"
                    min="6"
                    max="32"
                    value={settings.security?.passwordMinLength}
                    onChange={(value) => handleInputChange('security', 'passwordMinLength', parseInt(value))}
                  />
                  <CheckboxField
                    label="Require Special Characters in Passwords"
                    checked={settings.security?.passwordRequireSpecial}
                    onChange={(checked) => handleInputChange('security', 'passwordRequireSpecial', checked)}
                  />
                </div>
              </SettingSection>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="tab-content">
              <SettingSection title="SEO Settings">
                <div className="form-grid">
                  <InputField
                    label="Meta Title"
                    value={settings.seo?.metaTitle}
                    onChange={(value) => handleInputChange('seo', 'metaTitle', value)}
                    placeholder="Rerendet Coffee - Premium Coffee Blends"
                  />
                  <div className="form-group full-width">
                    <label>Meta Description</label>
                    <textarea
                      value={settings.seo?.metaDescription}
                      onChange={(e) => handleInputChange('seo', 'metaDescription', e.target.value)}
                      placeholder="Discover our premium coffee blends roasted to perfection. Fresh beans delivered to your doorstep."
                      rows="3"
                    />
                  </div>
                  <InputField
                    label="Keywords"
                    value={settings.seo?.keywords}
                    onChange={(value) => handleInputChange('seo', 'keywords', value)}
                    placeholder="coffee, beans, brew, kenya, arabica"
                  />
                </div>
              </SettingSection>

              <SettingSection title="Social Media">
                <div className="form-grid">
                  <InputField
                    label="Facebook URL"
                    value={settings.seo?.social?.facebook}
                    onChange={(value) => handleNestedChange('seo', 'social', 'facebook', value)}
                    placeholder="https://facebook.com/rerendetcoffee"
                  />
                  <InputField
                    label="Instagram URL"
                    value={settings.seo?.social?.instagram}
                    onChange={(value) => handleNestedChange('seo', 'social', 'instagram', value)}
                    placeholder="https://instagram.com/rerendetcoffee"
                  />
                  <InputField
                    label="Twitter URL"
                    value={settings.seo?.social?.twitter}
                    onChange={(value) => handleNestedChange('seo', 'social', 'twitter', value)}
                    placeholder="https://twitter.com/rerendetcoffee"
                  />
                </div>
              </SettingSection>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="tab-content">
              <SettingSection title="Maintenance Mode">
                <div className="form-grid">
                  <CheckboxField
                    label="Enable Maintenance Mode"
                    checked={settings.maintenance?.enabled}
                    onChange={(checked) => handleInputChange('maintenance', 'enabled', checked)}
                  />
                  <div className="form-group full-width">
                    <label>Maintenance Message</label>
                    <textarea
                      value={settings.maintenance?.message}
                      onChange={(e) => handleInputChange('maintenance', 'message', e.target.value)}
                      placeholder="We are currently performing maintenance. Please check back soon."
                      rows="4"
                      disabled={!settings.maintenance?.enabled}
                    />
                  </div>
                </div>
              </SettingSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;