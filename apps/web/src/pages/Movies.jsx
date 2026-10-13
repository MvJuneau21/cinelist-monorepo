import { useState, useEffect } from 'react';
import { Film } from 'lucide-react';
import { useMessage } from '../hooks/useMessage';
import Message from '../components/Message';
import SearchBar from '../components/SearchBar';
import MediaCard from '../components/MediaCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AddToListModal from '../components/AddToListModal'; // 1. Importar modal
import { getPopularMovies, searchMovies } from '../services/movies';
import { getUserLists, addItemToList } from '../services/lists'; // 2. Importar serviços de lista

const removeDuplicatesById = (mediaList) => {
  if (!Array.isArray(mediaList)) return [];
  const mediaMap = new Map();
  mediaList.forEach(media => {
    mediaMap.set(media.id, media);
  });
  return Array.from(mediaMap.values());
};

function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const { message, type, showMessage } = useMessage();

  // --- States para o Modal "Adicionar à Lista" ---
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const FIXED_USER_ID = 10;

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const data = await getPopularMovies();
      const uniqueMovies = removeDuplicatesById(data || []);
      setMovies(uniqueMovies.slice(0, 40));
    } catch (error) {
      showMessage('Erro ao carregar filmes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query) {
      loadMovies();
      return;
    }
    setSearching(true);
    try {
      const results = await searchMovies(query);
      const uniqueMovies = removeDuplicatesById(results || []);
      setMovies(uniqueMovies.slice(0, 40));
      if (uniqueMovies.length === 0) {
        showMessage('Nenhum filme encontrado', 'warning');
      }
    } catch (error) {
      showMessage('Erro ao buscar filmes', 'error');
    } finally {
      setSearching(false);
    }
  };

  // --- Funções para controlar o modal ---
  const handleOpenAddToListModal = async (media) => {
    setSelectedMedia(media);
    setIsAddToListModalOpen(true);
    setLoadingLists(true);
    try {
      const lists = await getUserLists({ user_id: FIXED_USER_ID });
      setUserLists(lists || []);
    } catch (error) {
      showMessage('Erro ao buscar suas listas', 'error');
    } finally {
      setLoadingLists(false);
    }
  };

  const handleCloseModal = () => {
    setIsAddToListModalOpen(false);
    setSelectedMedia(null);
  };

  const handleSelectList = async (listId) => {
    if (!selectedMedia) return;
    try {
      const payload = {
        lista_id: listId,
        media_id: selectedMedia.id,
        media_type: selectedMedia.type,
        title: selectedMedia.title || selectedMedia.name,
        poster_path: selectedMedia.poster_path,
        backdrop_path: selectedMedia.backdrop_path,
        overview: selectedMedia.overview,
        vote_average: selectedMedia.vote_average,
      };
      await addItemToList(payload);
      showMessage(`"${selectedMedia.title || selectedMedia.name}" adicionado à lista!`, 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Erro ao adicionar item';
      showMessage(errorMessage, 'error');
    } finally {
      handleCloseModal();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <LoadingSpinner text="Carregando filmes..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Message message={message} type={type} />

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Film className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Filmes</h1>
          </div>
          <p className="text-center text-blue-100 mb-6">
            Explore os melhores filmes
          </p>
          <div className="flex justify-center">
            <SearchBar onSearch={handleSearch} placeholder="Buscar filmes..." />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {searching ? (
          <LoadingSpinner text="Buscando filmes..." />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {movies.length} {movies.length === 1 ? 'Filme' : 'Filmes'}
              </h2>
              <button
                onClick={loadMovies}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Recarregar Populares
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <MediaCard key={movie.id} media={{ ...movie, type: 'movie' }} onAddToList={handleOpenAddToListModal} />
              ))}
            </div>
          </>
        )}
      </div>

      <AddToListModal
        isOpen={isAddToListModalOpen}
        onClose={handleCloseModal}
        lists={userLists}
        isLoading={loadingLists}
        onSelectList={handleSelectList}
      />
    </div>
  );
}

export default Movies;