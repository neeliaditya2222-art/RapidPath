import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  Activity, 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Radio,
  X,
  User
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { authService, useAuth } from '../services/authService';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation & Submission States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [generalError, setGeneralError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Auxiliary Modals State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resetMsg, setResetMsg] = useState('');

  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupStatus, setSignupStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [signupMsg, setSignupMsg] = useState('');

  if (isAuthenticated && loginStatus !== 'loading' && loginStatus !== 'success' && !googleLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  // Email format regex validation
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  // Form Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    let hasError = false;

    if (!email.trim()) {
      setEmailError('Please enter your email address.');
      hasError = true;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must contain at least 6 characters.');
      hasError = true;
    }

    if (hasError) return;

    setLoginStatus('loading');

    try {
      const response = await authService.login({
        email,
        password,
        rememberMe,
      });

      if (response.success) {
        setLoginStatus('success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        setLoginStatus('error');
        setGeneralError(response.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setLoginStatus('error');
      setGeneralError('An unexpected authentication error occurred. Please try again.');
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setGeneralError('');
    setGoogleLoading(true);
    try {
      const response = await authService.loginWithGoogle();
      if (response.success) {
        navigate('/dashboard');
      } else if (response.message && response.message !== 'Sign-in cancelled.') {
        setGeneralError(response.message);
      }
    } catch (err: any) {
      setGeneralError('Google Sign-In was unable to authenticate.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Password Reset Handler
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !isValidEmail(resetEmail)) {
      setResetMsg('Please enter a valid email address.');
      setResetStatus('error');
      return;
    }

    setResetStatus('loading');
    setResetMsg('');

    const res = await authService.sendPasswordReset(resetEmail);
    if (res.success) {
      setResetStatus('success');
      setResetMsg('Password reset instructions have been sent to your email.');
      setTimeout(() => {
        setForgotModalOpen(false);
        setResetStatus('idle');
        setResetMsg('');
      }, 2500);
    } else {
      setResetStatus('error');
      setResetMsg(res.message);
    }
  };

  // Account Signup Handler
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail.trim() || !isValidEmail(signupEmail)) {
      setSignupMsg('Please enter a valid email address.');
      setSignupStatus('error');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setSignupMsg('Password must be at least 6 characters.');
      setSignupStatus('error');
      return;
    }

    setSignupStatus('loading');
    setSignupMsg('');

    const res = await authService.signup(signupEmail, signupPassword);
    if (res.success) {
      setSignupStatus('success');
      setSignupMsg('Account created successfully! Redirecting...');
      setTimeout(() => {
        setSignupModalOpen(false);
        navigate('/dashboard');
      }, 600);
    } else {
      setSignupStatus('error');
      setSignupMsg(res.message || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#F2F5F6]">
      {/* Top Controls: Back Navigation */}
      <div className="w-full max-w-5xl mb-3 flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#617580] hover:text-[#007F86] hover:bg-white border border-transparent hover:border-[#DCE5E9] shadow-xs transition-all group"
          title="Return to RapidPath Home"
        >
          <ArrowLeft className="w-4 h-4 text-[#617580] group-hover:text-[#007F86] group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Two-Column Container */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-elevated border border-[#DCE5E9] overflow-hidden flex flex-col lg:flex-row">
        
        {/* LEFT COLUMN: Branded RapidPath Visual Showcase (Desktop & Tablet) */}
        <div className="w-full lg:w-1/2 p-8 sm:p-10 lg:p-12 bg-gradient-to-br from-[#102E3C] via-[#0D2430] to-[#06141B] text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Route Line Backdrops */}
          <div className="absolute inset-0 pointer-events-none opacity-15">
            <svg className="w-full h-full" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M-50 100 Q 150 150 250 80 T 550 200" stroke="#007F86" strokeWidth="3" strokeDasharray="6 6" />
              <path d="M-50 250 Q 180 320 350 220 T 550 400" stroke="#007F86" strokeWidth="4" />
              <path d="M-50 400 Q 200 350 400 450" stroke="#007F86" strokeWidth="2" />
              <circle cx="250" cy="80" r="6" fill="#007F86" />
              <circle cx="350" cy="220" r="8" fill="#C73540" />
            </svg>
          </div>

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#007F86] flex items-center justify-center text-white shadow-md">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19L12 4l8 15" />
                  <path d="M12 9v6" />
                  <circle cx="12" cy="18" r="1" fill="currentColor" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Rapid<span className="text-[#007F86]">Path</span>
                </span>
                <span className="text-[11px] text-[#A2B6C0] block -mt-1 font-medium">
                  Every Second. Every Route. Every Life.
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A3D4E] text-[#007F86] text-xs font-semibold border border-[#007F86]/30">
              <span className="w-2 h-2 rounded-full bg-[#007F86] animate-pulse" />
              <span>Firebase Cloud Authentication</span>
            </div>
          </div>

          {/* Center Value Proposition & Visual Graphic */}
          <div className="relative z-10 py-8 space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
                Mission-Critical Emergency Corridor Intelligence
              </h2>
              <p className="text-xs sm:text-sm text-[#A2B6C0] leading-relaxed">
                Intelligent emergency routing designed to help teams find the safest and fastest corridor when every second matters.
              </p>
            </div>

            {/* Tactical Live Metrics Row */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#0A1E27]/80 border border-[#1A4254] backdrop-blur-xs">
                <span className="text-[11px] text-[#A2B6C0] font-medium block">Route Reliability</span>
                <span className="text-lg font-black text-[#007F86] mt-0.5 block">99.98%</span>
                <span className="text-[10px] text-[#A2B6C0]">Zero signal bottlenecks</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0A1E27]/80 border border-[#1A4254] backdrop-blur-xs">
                <span className="text-[11px] text-[#A2B6C0] font-medium block">Live Telemetry Sync</span>
                <span className="text-lg font-black text-white mt-0.5 block">&lt;150ms</span>
                <span className="text-[10px] text-[#A2B6C0]">Continuous GPS tracking</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 pt-4 border-t border-[#1A4254] flex items-center justify-between text-[11px] text-[#A2B6C0]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#007F86]" />
              <span>Google Firebase Auth 256-Bit</span>
            </div>
            <span>v2.4 Enterprise</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Production-Grade Login Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Form Header */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[#112B37] tracking-tight">
                Welcome back
              </h2>
              <p className="text-xs sm:text-sm text-[#617580]">
                Sign in to your RapidPath account
              </p>
            </div>

            {/* General Error Banner if Authentication Fails */}
            {generalError && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#FFF2F2] border border-[#C73540]/30 text-xs text-[#C73540] animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{generalError}</span>
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              
              {/* Email Address Input */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="login-email" 
                  className="block text-xs font-semibold uppercase tracking-wider text-[#617580]"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#617580]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="name@organization.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm text-[#112B37] placeholder-[#A2B6C0] bg-white transition-all focus:outline-none focus:ring-2 ${
                      emailError
                        ? 'border-[#C73540] focus:border-[#C73540] focus:ring-[#C73540]/20'
                        : 'border-[#DCE5E9] focus:border-[#007F86] focus:ring-[#007F86]/20'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-xs text-[#C73540] font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="login-password" 
                  className="block text-xs font-semibold uppercase tracking-wider text-[#617580]"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#617580]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm text-[#112B37] placeholder-[#A2B6C0] bg-white transition-all focus:outline-none focus:ring-2 ${
                      passwordError
                        ? 'border-[#C73540] focus:border-[#C73540] focus:ring-[#C73540]/20'
                        : 'border-[#DCE5E9] focus:border-[#007F86] focus:ring-[#007F86]/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#617580] hover:text-[#112B37] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-[#C73540] font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              {/* Options Row: Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#617580] hover:text-[#112B37]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#DCE5E9] text-[#007F86] focus:ring-[#007F86]/30 accent-[#007F86]"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetMsg('');
                    setResetStatus('idle');
                    setForgotModalOpen(true);
                  }}
                  className="font-semibold text-[#007F86] hover:text-[#006B70] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Primary Action Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loginStatus === 'loading'}
                disabled={loginStatus === 'loading' || loginStatus === 'success'}
                className="w-full mt-2 font-bold text-sm sm:text-base py-3 bg-[#007F86] hover:bg-[#006B70] shadow-sm rounded-lg"
              >
                {loginStatus === 'loading' ? (
                  'Signing in...'
                ) : loginStatus === 'success' ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Login successful</span>
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-[#DCE5E9] w-full" />
              <span className="bg-white px-3 text-xs uppercase tracking-wider text-[#617580] font-semibold">
                OR
              </span>
              <div className="border-t border-[#DCE5E9] w-full" />
            </div>

            {/* Continue with Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-[#DCE5E9] hover:border-[#617580] hover:bg-[#F2F5F6] text-[#112B37] text-sm font-semibold transition-all shadow-xs disabled:opacity-50"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-[#007F86] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {/* Footer / Create Account Link */}
            <div className="text-center pt-2 text-xs text-[#617580]">
              <span>Don't have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setSignupEmail(email);
                  setSignupMsg('');
                  setSignupStatus('idle');
                  setSignupModalOpen(true);
                }}
                className="font-bold text-[#007F86] hover:text-[#006B70] hover:underline"
              >
                Create account
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Password Recovery"
        subtitle="Reset access credentials for your dispatch account"
        maxWidth="md"
      >
        <form onSubmit={handlePasswordReset} className="space-y-4 text-xs text-[#112B37]">
          <p className="text-[#617580] leading-relaxed">
            Enter your registered operator email address. We will send you a secure link to reset your password via Firebase Auth.
          </p>

          {resetMsg && (
            <div
              className={`p-2.5 rounded-lg border text-xs font-semibold ${
                resetStatus === 'success'
                  ? 'bg-[#E8F5ED] text-[#24735B] border-[#24735B]/30'
                  : 'bg-[#FFF2F2] text-[#C73540] border-[#C73540]/30'
              }`}
            >
              {resetMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-[#617580]">Operator Email</label>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="dispatcher@rapidpath.gov"
              className="w-full px-3 py-2 rounded-lg border border-[#DCE5E9] focus:outline-none focus:border-[#007F86]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="secondary" 
              size="sm" 
              onClick={() => setForgotModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={resetStatus === 'loading'}
            >
              Send Reset Link
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Account Modal */}
      <Modal
        isOpen={signupModalOpen}
        onClose={() => setSignupModalOpen(false)}
        title="Agency Registration"
        subtitle="Create a new dispatch account with Firebase Authentication"
        maxWidth="md"
      >
        <form onSubmit={handleSignup} className="space-y-4 text-xs text-[#112B37]">
          <p className="text-[#617580] leading-relaxed">
            Create your account to access RapidPath Emergency Route Intelligence.
          </p>

          {signupMsg && (
            <div
              className={`p-2.5 rounded-lg border text-xs font-semibold ${
                signupStatus === 'success'
                  ? 'bg-[#E8F5ED] text-[#24735B] border-[#24735B]/30'
                  : 'bg-[#FFF2F2] text-[#C73540] border-[#C73540]/30'
              }`}
            >
              {signupMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-[#617580]">Email Address</label>
            <input
              type="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="name@organization.com"
              className="w-full px-3 py-2 rounded-lg border border-[#DCE5E9] focus:outline-none focus:border-[#007F86]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#617580]">Password</label>
            <input
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3 py-2 rounded-lg border border-[#DCE5E9] focus:outline-none focus:border-[#007F86]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="secondary" 
              size="sm" 
              onClick={() => setSignupModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={signupStatus === 'loading'}
            >
              Register & Sign In
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
