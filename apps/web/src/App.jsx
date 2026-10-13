// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Series from './pages/Series';
import Anime from './pages/Anime';
import MediaDetails from './pages/MediaDetails';
import MediaRatedDetails from './pages/MediaRatedDetails'; // <-- 1. Importe o componente
import Lists from './pages/Lists';
import ListDetails from './pages/ListDetails';
import ListDetailsItem from './pages/ListDetailsItem';
import Profile from './pages/Profile';

function PrivateRoute({ children }) {
  const { user } = useUser();
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user } = useUser();
  return user ? <Navigate to="/home" replace /> : children;
}

function AppContent() {
  const { user } = useUser();

  return (
    <div className="flex flex-col min-h-screen">
      {user && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/movies"
            element={
              <PrivateRoute>
                <Movies />
              </PrivateRoute>
            }
          />
          <Route
            path="/series"
            element={
              <PrivateRoute>
                <Series />
              </PrivateRoute>
            }
          />
          <Route
            path="/anime"
            element={
              <PrivateRoute>
                <Anime />
              </PrivateRoute>
            }
          />
          {/* Rota para ver detalhes de uma mídia (de qualquer lugar, exceto perfil) */}
          <Route
            path="/media/:id"
            element={
              <PrivateRoute>
                <MediaDetails />
              </PrivateRoute>
            }
          />
          {/* 2. ADICIONE A NOVA ROTA AQUI */}
          {/* Rota para ver/editar uma AVALIAÇÃO (acessada pelo Perfil) */}
          <Route
            path="/rated/:type/:id"
            element={
              <PrivateRoute>
                <MediaRatedDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/lists"
            element={
              <PrivateRoute>
                <Lists />
              </PrivateRoute>
            }
          />
          <Route
            path="/lists/:id"
            element={
              <PrivateRoute>
                <ListDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/lists/:listId/item/:id"
            element={
              <PrivateRoute>
                <ListDetailsItem />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      {user && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;