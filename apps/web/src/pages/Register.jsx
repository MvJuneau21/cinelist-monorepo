// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Film, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useMessage } from '../hooks/useMessage';
import Message from '../components/Message';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useUser();
  const navigate = useNavigate();
  const { message, type, showMessage } = useMessage();

  const handleRegister = (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      return showMessage('Preencha todos os campos!', 'error');
    }

    setUser({
      name,
      email,
      avatar: 'https://www.w3schools.com/howto/img_avatar.png',
    });

    localStorage.setItem('token', 'demo-token');
    showMessage('Cadastro realizado com sucesso!', 'success');
    setTimeout(() => navigate('/home'), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <Message message={message} type={type} />

      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Film className="w-16 h-16 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-slate-900">CineList</h1>
          <p className="text-slate-600 mt-2">Crie sua conta</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nome
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Cadastrar
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;