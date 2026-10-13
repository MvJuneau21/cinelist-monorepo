import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Star, List, Eye, Trash2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { getUserRatings } from '../services/media';
import { getUserLists, deleteList } from '../services/lists';
import MediaRatedCard from '../components/MediaRatedCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useMessage } from '../hooks/useMessage';
import Message from '../components/Message';

function Profile() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { message, type, showMessage } = useMessage();

  const FIXED_USER_ID = 10; // Na aplicação real, este viria do contexto do usuário

  // Busca todos os dados do perfil (avaliações e listas) de uma só vez
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [ratingsResponse, listsResponse] = await Promise.all([
        getUserRatings(FIXED_USER_ID),
        getUserLists({ user_id: FIXED_USER_ID })
      ]);

      setRatings(ratingsResponse.results || []);
      setLists(listsResponse || []);
    } catch (error) {
      showMessage('Erro ao carregar dados do perfil.', 'error');
      console.error('Falha ao buscar dados do perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Funções para manipular as listas
  const handleDeleteList = async (listId) => {
    if (!confirm('Tem certeza que deseja excluir esta lista e todos os seus itens?')) return;

    try {
      await deleteList({ 
        lista_id: listId, 
        user_id: FIXED_USER_ID,
      });
      showMessage('Lista excluída com sucesso!', 'success');
      fetchProfileData(); // Recarrega os dados para atualizar a UI
    } catch (error) {
      showMessage('Erro ao excluir lista', 'error');
    }
  };

  const handleViewList = (listId) => {
    navigate(`/lists/${listId}`);
  };

  // Normaliza os dados de mídias avaliadas para o componente MediaRatedCard
  const normalizeRatedData = (item) => {
    let id;
    if (item.type === 'movie') id = item.movie_id;
    else if (item.type === 'serie') id = item.serie_id;
    else if (item.type === 'anime') id = item.anime_id;

    return {
      id,
      type: item.type,
      title: item.title || item.name || 'Sem título',
      overview: (item.overview || item.description || '').replace(/<[^>]*>/g, '') || 'Sem descrição disponível.',
      vote_average: item.rating ?? item.score ?? 0,
      poster_path: item.poster_path || item.image || null,
      backdrop_path: item.backdrop_path || null,
      comment: item.comment || null,
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Message message={message} type={type} />

      {/* Banner do perfil */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white py-12 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8 lg:px-12">
          <div className="flex flex-col items-center text-center">
            <img
              src={user?.avatar || 'https://www.w3schools.com/howto/img_avatar.png'}
              alt={user?.name || 'Usuário #10'}
              className="w-32 h-32 rounded-full border-4 border-white shadow-xl mb-4"
            />
            <h1 className="text-4xl font-bold mb-2">{user?.name || 'Usuário #10'}</h1>
            {user?.email && (
              <p className="text-slate-300 flex items-center justify-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full px-4 md:px-8 lg:px-12 pt-16 pb-12">
        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Star className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-slate-900 mb-1">
              {loading ? '...' : ratings.length}
            </h3>
            <p className="text-slate-600">Avaliações</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <List className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-slate-900 mb-1">
              {loading ? '...' : lists.length}
            </h3>
            <p className="text-slate-600">Listas</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Calendar className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-slate-900 mb-1">
              {new Date().getFullYear()}
            </h3>
            <p className="text-slate-600">Membro desde</p>
          </div>
        </div>

        {/* Avaliações */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <Star className="w-6 h-6" />
            <span>Minhas Avaliações</span>
          </h2>
          {loading ? (
            <LoadingSpinner text="Carregando avaliações..." />
          ) : ratings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {ratings.map((item) => (
                <MediaRatedCard
                  key={`${item.type}-${item.id}`}
                  media={normalizeRatedData(item)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600">Você ainda não avaliou nenhuma mídia.</p>
            </div>
          )}
        </div>

        {/* Listas do Usuário */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <List className="w-6 h-6" />
            <span>Minhas Listas</span>
          </h2>
          {loading ? (
            <LoadingSpinner text="Carregando listas..." />
          ) : lists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl hover:shadow-lg transition-shadow p-6 flex flex-col"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{list.nome}</h3>
                  {list.description && (
                    <p className="text-slate-600 mb-4 line-clamp-2 flex-grow">{list.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200">
                    <span className="text-sm text-slate-500">
                      {list.item_count || 0} {list.item_count === 1 ? 'item' : 'itens'}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewList(list.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Ver lista"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteList(list.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir lista"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600">Você ainda não criou nenhuma lista.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;