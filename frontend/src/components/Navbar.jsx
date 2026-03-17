import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <Link to="/" className="text-xl font-bold text-gray-900 no-underline">
              SecureTransact
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900 no-underline flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            {user.role === 'ADMIN' && (
              <Link to="/admin" className="text-gray-600 hover:text-gray-900 no-underline">
                Admin Panel
              </Link>
            )}
            <span className="text-sm text-gray-500">
              {user.firstName} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-red-600 hover:text-red-800 cursor-pointer bg-transparent border-none"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
