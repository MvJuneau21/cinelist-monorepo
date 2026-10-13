// src/components/NavBar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Film, Tv, Monitor, User, List, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';

function Navbar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/home" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Film className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold">CineList</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/home" className="hover:text-blue-400 transition-colors flex items-center space-x-1">
              <Monitor className="w-5 h-5" />
              <span>Início</span>
            </Link>
            <Link to="/movies" className="hover:text-blue-400 transition-colors flex items-center space-x-1">
              <Film className="w-5 h-5" />
              <span>Filmes</span>
            </Link>
            <Link to="/series" className="hover:text-blue-400 transition-colors flex items-center space-x-1">
              <Tv className="w-5 h-5" />
              <span>Séries</span>
            </Link>
            <Link to="/anime" className="hover:text-blue-400 transition-colors flex items-center space-x-1">
              <Monitor className="w-5 h-5" />
              <span>Animes</span>
            </Link>
            <Link to="/lists" className="hover:text-blue-400 transition-colors flex items-center space-x-1">
              <List className="w-5 h-5" />
              <span>Minhas Listas</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/profile" className="flex items-center space-x-2 hover:text-blue-400 transition-colors">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">{user?.name || 'Perfil'}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;