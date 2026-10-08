import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Shield, 
  CheckCircle2, 
  Key, 
  Bell, 
  LogOut, 
  Edit3, 
  Save, 
  X, 
  AlertCircle,
  Clock,
  Calendar,
  Lock
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../services/authService';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, logout, sendPasswordReset } = useAuth();

  // If not logged in, redirect to / (Landing page)
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '+91 98765 43210');
  const [organization, setOrganization] = useState(user.organization || 'Emergency Operations Center');

  // Success Feedback
  const [successMessage, setSuccessMessage] = useState('');

  // Preferences State
  const [notifications, setNotifications] = useState(user.preferences?.notifications ?? true);
  const [emailNotifications, setEmailNotifications] = useState(user.preferences?.emailNotifications ?? true);
  const [routeAlerts, setRouteAlerts] = useState(user.preferences?.routeAlerts ?? true);

  // Security Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordResetStatus, setPasswordResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [passwordResetMessage, setPasswordResetMessage] = useState('');

  // Sync state when user object changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '+91 98765 43210');
      setOrganization(user.organization || 'Emergency Operations Center');
      setNotifications(user.preferences?.notifications ?? true);
      setEmailNotifications(user.preferences?.emailNotifications ?? true);
      setRouteAlerts(user.preferences?.routeAlerts ?? true);
    }
  }, [user]);

  // Handle Save Profile
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      updateProfile({
        name: name.trim() || user.name,
        phone: phone.trim() || user.phone,
        organization: organization.trim() || user.organization,
      });
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully.');
      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    setName(user.name || '');
    setPhone(user.phone || '+91 98765 43210');
    setOrganization(user.organization || 'Emergency Operations Center');
    setIsEditing(false);
  };

  // Handle Preference Toggle
  const handleTogglePreference = (key: 'notifications' | 'emailNotifications' | 'routeAlerts') => {
    let nextNotifications = notifications;
    let nextEmail = emailNotifications;
    let nextAlerts = routeAlerts;

    if (key === 'notifications') {
      nextNotifications = !notifications;
      setNotifications(nextNotifications);
    } else if (key === 'emailNotifications') {
      nextEmail = !emailNotifications;
      setEmailNotifications(nextEmail);
    } else if (key === 'routeAlerts') {
      nextAlerts = !routeAlerts;
      setRouteAlerts(nextAlerts);
    }

    updateProfile({
      preferences: {
        notifications: nextNotifications,
        emailNotifications: nextEmail,
        routeAlerts: nextAlerts,
      },
    });
  };

  // Handle Password Reset Request
  const handlePasswordResetRequest = async () => {
    setPasswordResetStatus('loading');
    setPasswordResetMessage('');
    const res = await sendPasswordReset(user.email);
    if (res.success) {
      setPasswordResetStatus('success');
      setPasswordResetMessage(`Password reset link sent to ${user.email}. Check your inbox to set a new password.`);
    } else {
      setPasswordResetStatus('error');
      setPasswordResetMessage(res.message || 'Failed to send password reset email.');
    }
  };

  // Compute initials for avatar
  const initials = user.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Title & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[#112B37] tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-[#617580]">
          Manage your account and preferences
        </p>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#E8F5ED] border border-[#24735B]/30 text-xs sm:text-sm font-semibold text-[#24735B] animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 1. PROFILE HEADER CARD */}
      <Card className="p-6 sm:p-8 bg-white border border-[#DCE5E9] shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar (Initials or Image) */}
            <div className="w-20 h-20 rounded-full bg-[#102E3C] text-white flex items-center justify-center text-2xl font-bold shadow-md ring-4 ring-[#E1F2F1]">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-[#112B37] tracking-tight capitalize">
                {user.name || 'Emergency Dispatcher'}
              </h2>
              <p className="text-sm font-medium text-[#617580]">
                {user.email}
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E1F2F1] text-[#007F86] text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Emergency Operations User</span>
              </div>
            </div>
          </div>

          {/* Edit Profile Action */}
          <div>
            {!isEditing ? (
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Edit3 className="w-4 h-4 text-[#007F86]" />}
                onClick={() => setIsEditing(true)}
                className="font-semibold text-xs sm:text-sm shadow-xs"
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Save className="w-4 h-4" />}
                  onClick={handleSaveProfile}
                  className="font-semibold text-xs sm:text-sm bg-[#007F86] hover:bg-[#006B70]"
                >
                  Save Changes
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<X className="w-4 h-4" />}
                  onClick={handleCancelEdit}
                  className="font-semibold text-xs sm:text-sm"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 2 & 3. TWO-COLUMN GRID: Personal Information & Account Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PERSONAL INFORMATION CARD */}
        <Card className="p-6 bg-white border border-[#DCE5E9] shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border-b border-[#DCE5E9] pb-3">
              <h3 className="text-base font-bold text-[#112B37] flex items-center gap-2">
                <User className="w-4 h-4 text-[#007F86]" />
                <span>Personal Information</span>
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#617580]">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#DCE5E9] focus:border-[#007F86] focus:ring-2 focus:ring-[#007F86]/20 text-[#112B37] text-sm bg-white"
                  />
                ) : (
                  <div className="px-3.5 py-2.5 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9] font-medium text-[#112B37]">
                    {user.name || 'Emergency Dispatcher'}
                  </div>
                )}
              </div>

              {/* Email Address (Always read-only) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#617580]">
                  Email Address
                </label>
                <div className="px-3.5 py-2.5 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9] font-medium text-[#617580] flex items-center justify-between">
                  <span>{user.email}</span>
                  <span className="text-[11px] text-[#A2B6C0] font-normal">Primary / Read-only</span>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#617580]">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#DCE5E9] focus:border-[#007F86] focus:ring-2 focus:ring-[#007F86]/20 text-[#112B37] text-sm bg-white"
                  />
                ) : (
                  <div className="px-3.5 py-2.5 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9] font-medium text-[#112B37]">
                    {user.phone || '+91 98765 43210'}
                  </div>
                )}
              </div>

              {/* Organization */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#617580]">
                  Organization
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Emergency Operations Center"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#DCE5E9] focus:border-[#007F86] focus:ring-2 focus:ring-[#007F86]/20 text-[#112B37] text-sm bg-white"
                  />
                ) : (
                  <div className="px-3.5 py-2.5 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9] font-medium text-[#112B37]">
                    {user.organization || 'Emergency Operations Center'}
                  </div>
                )}
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#617580]">
                  Role
                </label>
                <div className="px-3.5 py-2.5 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9] font-semibold text-[#112B37] flex items-center justify-between">
                  <span>{user.role || 'Dispatcher'}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E1F2F1] text-[#007F86]">
                    Authorized
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Inline Edit Mode Footer Buttons on Mobile / Desktop */}
          {isEditing && (
            <div className="pt-2 flex items-center gap-3 border-t border-[#DCE5E9]">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveProfile}
                className="bg-[#007F86] hover:bg-[#006B70] text-xs font-bold"
              >
                Save Changes
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancelEdit}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
            </div>
          )}
        </Card>

        {/* ACCOUNT INFORMATION CARD */}
        <Card className="p-6 bg-white border border-[#DCE5E9] shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border-b border-[#DCE5E9] pb-3">
              <h3 className="text-base font-bold text-[#112B37] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#007F86]" />
                <span>Account Information</span>
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Account Status */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9]">
                <div>
                  <span className="block text-xs font-semibold text-[#617580]">Account Status</span>
                  <span className="font-bold text-[#112B37] text-sm">Operational Ready</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F5ED] text-[#24735B] border border-[#24735B]/20">
                  <span className="w-2 h-2 rounded-full bg-[#24735B] animate-pulse" />
                  <span>Active</span>
                </span>
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9]">
                <div>
                  <span className="block text-xs font-semibold text-[#617580]">Member Since</span>
                  <span className="font-semibold text-[#112B37] text-sm">{user.memberSince || 'October 2026'}</span>
                </div>
                <Calendar className="w-4 h-4 text-[#617580]" />
              </div>

              {/* Last Login */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9]">
                <div>
                  <span className="block text-xs font-semibold text-[#617580]">Last Login</span>
                  <span className="font-semibold text-[#112B37] text-xs sm:text-sm">{user.lastLogin || 'Active Session'}</span>
                </div>
                <Clock className="w-4 h-4 text-[#617580]" />
              </div>

              {/* Account Type */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9]">
                <div>
                  <span className="block text-xs font-semibold text-[#617580]">Account Type</span>
                  <span className="font-bold text-[#112B37] text-sm">Standard / Dispatcher</span>
                </div>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#102E3C] text-white">
                  Dispatcher
                </span>
              </div>

              {/* Agency Jurisdiction */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9]">
                <div>
                  <span className="block text-xs font-semibold text-[#617580]">Assigned Badge</span>
                  <span className="font-bold text-[#007F86] text-sm">{user.badgeNumber || 'RP-4092'}</span>
                </div>
                <span className="text-[11px] text-[#617580] font-medium">Center 01</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. PREFERENCES CARD */}
      <Card className="p-6 bg-white border border-[#DCE5E9] shadow-sm space-y-4">
        <div className="border-b border-[#DCE5E9] pb-3">
          <h3 className="text-base font-bold text-[#112B37] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#007F86]" />
            <span>Preferences</span>
          </h3>
        </div>

        <div className="space-y-3">
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9]">
            <div>
              <p className="font-semibold text-sm text-[#112B37]">System Notifications</p>
              <p className="text-xs text-[#617580]">Receive real-time push alerts on road conditions and vehicle state</p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePreference('notifications')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                notifications
                  ? 'bg-[#007F86] text-white'
                  : 'bg-[#DCE5E9] text-[#617580]'
              }`}
            >
              {notifications ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Email Notifications Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9]">
            <div>
              <p className="font-semibold text-sm text-[#112B37]">Email Notifications</p>
              <p className="text-xs text-[#617580]">Receive daily mission summaries and incident dispatch reports</p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePreference('emailNotifications')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                emailNotifications
                  ? 'bg-[#007F86] text-white'
                  : 'bg-[#DCE5E9] text-[#617580]'
              }`}
            >
              {emailNotifications ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Emergency Route Alerts Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9]">
            <div>
              <p className="font-semibold text-sm text-[#112B37]">Emergency Route Alerts</p>
              <p className="text-xs text-[#617580]">Automatic re-routing warnings for active corridors under high congestion</p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePreference('routeAlerts')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                routeAlerts
                  ? 'bg-[#007F86] text-white'
                  : 'bg-[#DCE5E9] text-[#617580]'
              }`}
            >
              {routeAlerts ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </Card>

      {/* 5. SECURITY CARD */}
      <Card className="p-6 bg-white border border-[#DCE5E9] shadow-sm space-y-4">
        <div className="border-b border-[#DCE5E9] pb-3">
          <h3 className="text-base font-bold text-[#112B37] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#007F86]" />
            <span>Security</span>
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9]">
          <div>
            <span className="block text-xs font-semibold text-[#617580]">Password</span>
            <span className="font-mono text-lg font-bold text-[#112B37] tracking-widest">••••••••••</span>
            <p className="text-xs text-[#617580] mt-0.5">Firebase encrypted credential authentication</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setPasswordResetStatus('idle');
              setPasswordResetMessage('');
              setPasswordModalOpen(true);
            }}
            className="font-semibold text-xs whitespace-nowrap shadow-xs"
          >
            Change Password
          </Button>
        </div>
      </Card>

      {/* 6. LOGOUT BUTTON (Warning Style) */}
      <div className="pt-4 flex justify-center sm:justify-end">
        <Button
          variant="secondary"
          size="lg"
          leftIcon={<LogOut className="w-4 h-4 text-[#C73540]" />}
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full sm:w-auto font-bold text-sm text-[#C73540] border-[#C73540]/30 hover:bg-[#FFF2F2] hover:border-[#C73540] shadow-xs"
        >
          Log Out
        </Button>
      </div>

      {/* Password Reset Modal */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Change Password"
        subtitle="Secure password update powered by Firebase Auth"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-[#112B37]">
          <p className="text-[#617580] leading-relaxed">
            Click below to generate a secure password reset link sent directly to your registered email: <strong>{user.email}</strong>.
          </p>

          {passwordResetMessage && (
            <div
              className={`p-3 rounded-lg border text-xs font-semibold ${
                passwordResetStatus === 'success'
                  ? 'bg-[#E8F5ED] text-[#24735B] border-[#24735B]/30'
                  : 'bg-[#FFF2F2] text-[#C73540] border-[#C73540]/30'
              }`}
            >
              {passwordResetMessage}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE5E9]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPasswordModalOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={passwordResetStatus === 'loading'}
              onClick={handlePasswordResetRequest}
              className="bg-[#007F86] hover:bg-[#006B70]"
            >
              Send Reset Email
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
