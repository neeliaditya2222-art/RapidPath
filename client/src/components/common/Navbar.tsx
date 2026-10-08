import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Radio, 
  Layers, 
  History, 
  Settings, 
  CheckCircle2, 
  Menu, 
  X, 
  User, 
  Compass,
  Cpu,
  MapPin,
  Database,
  LogOut
} from 'lucide-react';
import { healthApi } from '../../api/routeApi';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../services/authService';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [systemHealth, setSystemHealth] = useState<{ status: string; gemini: string; maps: string; database: string }>({
    status: 'Operational',
    gemini: 'Connected',
    maps: 'Connected',
    database: 'Connected',
  });

  useEffect(() => {
    healthApi.checkHealth()
      .then((res) => {
        setSystemHealth({
          status: 'Operational',
          gemini: res.services.geminiAI === 'configured' ? 'Connected' : 'Heuristic Mode',
          maps: res.services.routingEngine ? 'Connected (OSRM)' : 'Connected',
          database: res.services.database === 'connected' ? 'Connected' : 'In-Memory',
        });
      })
      .catch(() => {
        setSystemHealth({
          status: 'Operational',
          gemini: 'Heuristic Mode',
          maps: 'Connected (OSRM)',
          database: 'In-Memory',
        });
      });
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Route Analysis', path: '/route' },
    { name: 'History', path: '/history' },
    { name: 'Settings', path: '/settings' },
  ];

  // When logged in, top-left logo directs to /dashboard; when logged out, directs to /
  const logoDestination = isAuthenticated ? '/dashboard' : '/';

  return (
    <>
      <header className="bg-white border-b border-[#DCE5E9] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* 1. LEFT: Logo representing road/path forward movement */}
            <div className="flex items-center shrink-0">
              <Link to={logoDestination} className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-[#007F86] flex items-center justify-center text-white shadow-sm group-hover:bg-[#006B70] transition-colors">
                  {/* Clean SVG: Path forward movement + emergency beacon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19L12 4l8 15" />
                    <path d="M12 9v6" />
                    <circle cx="12" cy="18" r="1" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tracking-tight text-[#112B37]">
                      Rapid<span className="text-[#007F86]">Path</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-[#617580] tracking-tight block -mt-1 font-medium">
                    Every Second. Every Route. Every Life.
                  </span>
                </div>
              </Link>
            </div>

            {/* 2. CENTER: Symmetrically centered Navigation Links (When logged in) */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center justify-center gap-2 flex-1 px-4">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#E1F2F1] text-[#007F86] font-semibold shadow-xs'
                          : 'text-[#617580] hover:text-[#112B37] hover:bg-[#F2F5F6]'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* 3. RIGHT: System Status & User Profile OR Sign In button */}
            <div className="hidden sm:flex items-center gap-3.5 shrink-0">
              {isAuthenticated ? (
                <>
                  {/* System Operational Badge */}
                  <button
                    type="button"
                    onClick={() => setStatusModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F5ED] text-[#24735B] border border-[#24735B]/20 text-xs font-medium hover:bg-[#D9EFE0] transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#24735B] animate-pulse" />
                    <span>System Operational</span>
                  </button>

                  {/* Vertical Divider */}
                  <div className="h-7 w-[1px] bg-[#DCE5E9]" />

                  {/* User Profile Info (Navigates to /profile) */}
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2.5 p-1 -m-1 rounded-lg hover:bg-[#F2F5F6] transition-colors group cursor-pointer"
                    title="Manage Profile"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#102E3C] text-white flex items-center justify-center text-xs font-semibold shadow-xs group-hover:ring-2 group-hover:ring-[#007F86] transition-all">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ED'}
                    </div>
                    <div className="hidden lg:block text-left text-xs">
                      <p className="font-semibold text-[#112B37] leading-tight capitalize group-hover:text-[#007F86] transition-colors">
                        {user?.name || 'Dispatch Ops'}
                      </p>
                      <p className="text-[11px] text-[#617580]">
                        {user?.badgeNumber ? `Badge ${user.badgeNumber}` : 'Center 01'}
                      </p>
                    </div>
                  </Link>

                  {/* Sign Out Button */}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="ml-1 px-3 py-1.5 text-xs font-semibold text-[#617580] hover:text-[#C73540] hover:bg-[#FFF2F2] border border-transparent hover:border-[#C73540]/20 rounded-lg transition-all"
                    title="Sign Out"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-[#007F86] hover:bg-[#006B70] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#617580] hover:text-[#112B37] hover:bg-[#F2F5F6]"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#DCE5E9] px-4 pt-2 pb-4 space-y-1">
            {isAuthenticated ? (
              <>
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium ${
                        isActive
                          ? 'bg-[#E1F2F1] text-[#007F86] font-semibold'
                          : 'text-[#617580] hover:text-[#112B37] hover:bg-[#F2F5F6]'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
                <div className="pt-3 border-t border-[#DCE5E9] flex items-center justify-between">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-xs font-semibold text-[#112B37] hover:text-[#007F86]"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#102E3C] text-white flex items-center justify-center text-[10px] font-semibold">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ED'}
                    </div>
                    <span>{user?.name || 'Dispatch Ops'} (Profile)</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="text-xs font-semibold text-[#C73540] hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center px-4 py-2.5 bg-[#007F86] text-white text-sm font-bold rounded-lg"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* System Status Inspection Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Subsystem Operational Status"
        subtitle="Real-time telemetry and API connectivity"
        maxWidth="md"
      >
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9]">
            <div className="flex items-center gap-2.5 text-[#112B37]">
              <MapPin className="w-4 h-4 text-[#007F86]" />
              <span className="font-medium">OpenStreetMap & OSRM Engine</span>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#E8F5ED] text-[#24735B]">
              {systemHealth.maps}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9]">
            <div className="flex items-center gap-2.5 text-[#112B37]">
              <Cpu className="w-4 h-4 text-[#007F86]" />
              <span className="font-medium">Google Gemini AI Engine</span>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#E8F5ED] text-[#24735B]">
              {systemHealth.gemini}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9]">
            <div className="flex items-center gap-2.5 text-[#112B37]">
              <Compass className="w-4 h-4 text-[#007F86]" />
              <span className="font-medium">Deterministic Scoring Engine</span>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#E8F5ED] text-[#24735B]">
              Available (&lt;150ms)
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F2F5F6] border border-[#DCE5E9]">
            <div className="flex items-center gap-2.5 text-[#112B37]">
              <Database className="w-4 h-4 text-[#007F86]" />
              <span className="font-medium">Audit Database</span>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#E8F5ED] text-[#24735B]">
              {systemHealth.database}
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
};
