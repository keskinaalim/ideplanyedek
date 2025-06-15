import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Building, BookOpen, Calendar, LogOut, Eye, Menu, X, GraduationCap, Home, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Anasayfa', color: 'text-blue-600' },
    { to: '/subjects', icon: BookOpen, label: 'Dersler', color: 'text-indigo-600' },
    { to: '/teachers', icon: Users, label: 'Öğretmenler', color: 'text-blue-600' },
    { to: '/classes', icon: Building, label: 'Sınıflar', color: 'text-emerald-600' },
    { to: '/schedules', icon: Calendar, label: 'Program Oluştur', color: 'text-purple-600' },
    { to: '/auto-schedule', icon: Zap, label: 'Otomatik Program', color: 'text-orange-600' },
    { to: '/class-schedules', icon: GraduationCap, label: 'Sınıf Programları', color: 'text-emerald-600' },
    { to: '/all-schedules', icon: Eye, label: 'Öğretmen Programları', color: 'text-blue-600' },
    { to: '/pdf', icon: Calendar, label: 'PDF Çıktı', color: 'text-orange-600' }
  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50 safe-top safe-left">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="btn-icon bg-white shadow-lg border-gray-200 hover:bg-gray-50"
          aria-label="Menüyü aç/kapat"
        >
          {isMobileMenuOpen ? (
            <X size={20} className="text-gray-700" />
          ) : (
            <Menu size={20} className="text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`
        sidebar-corporate fixed lg:static inset-y-0 left-0 z-40 h-screen
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        safe-top safe-bottom safe-left
      `}>
        {/* Logo Header */}
        <div className="logo-corporate">
          <div className="flex items-center justify-between lg:justify-start">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <img 
                  src="https://cv.ide.k12.tr/images/ideokullari_logo.png" 
                  alt="İDE Okulları Logo"
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-8 h-8 text-white flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>';
                    }
                  }}
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">İDE Okulları</h1>
                <p className="text-xs text-blue-100 opacity-90">Ders Programı Sistemi</p>
              </div>
            </div>
            
            {/* Mobile close button */}
            <button
              onClick={closeMobileMenu}
              className="lg:hidden btn-icon bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30"
              aria-label="Menüyü kapat"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 bg-gray-50 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map(({ to, icon: Icon, label, color }) => (
              <NavLink
                key={to}
                to={to}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `nav-corporate group ${isActive ? 'active' : ''}`
                }
              >
                <Icon 
                  size={20} 
                  className={`mr-3 flex-shrink-0 transition-colors duration-200 ${
                    window.location.pathname === to ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                  }`}
                />
                <span className="font-medium truncate">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 bg-white safe-bottom">
          <button
            onClick={handleLogout}
            className="nav-corporate w-full text-gray-700 hover:bg-red-50 hover:text-red-700 group"
          >
            <LogOut size={20} className="mr-3 flex-shrink-0 text-gray-500 group-hover:text-red-500 transition-colors duration-200" />
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;