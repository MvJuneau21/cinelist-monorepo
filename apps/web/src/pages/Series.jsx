import { useState, useEffect } from 'react';
import { Tv } from 'lucide-react';
import { useMessage } from '../hooks/useMessage';
import Message from '../components/Message';
import SearchBar from '../components/SearchBar';
import MediaCard from '../components/MediaCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AddToListModal from '../components/AddToListModal'; // 1. Importar modal
import { getPopularSeries, searchSeries } from '../services/series';
import { getUserLists, addItemToList } from '../services/lists'; // 2. Importar serviços de lista

const removeDuplicatesById = (mediaList) => {
  if (!Array.isArray(mediaList)) return [];
  const mediaMap = new Map();
  mediaList.forEach(media => {
    mediaMap.set(media.id, media);
  });
  return Array.from(mediaMap.values());
};

function Series() {
  const [series, setSeries] = useState([]);
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
    loadSeries();
  }, []);

  const loadSeries = async () => {
    setLoading(true);
    try {
      const data = await getPopularSeries();
      const uniqueSeries = removeDuplicatesById(data || []);
      setSeries(uniqueSeries.slice(0, 40));
    } catch (error) {
      showMessage('Erro ao carregar séries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearching(true);
    try {
      const results = await searchSeries(query);
      const uniqueSeries = removeDuplicatesById(results || []);
      setSeries(uniqueSeries.slice(0, 40));
      if (!results || results.length === 0) {
        showMessage('Nenhuma série encontrada', 'warning');
      }
    } catch (error) {
      showMessage('Erro ao buscar séries', 'error');
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
      showMessage(`"${selectedMedia.name}" adicionado à lista!`, 'success');
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
        <LoadingSpinner text="Carregando séries..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Message message={message} type={type} />

      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-12 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8 lg:px-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Tv className="w-10 h-10" />
              <h1 className="text-4xl font-bold">Séries</h1>
            </div>
            <p className="text-green-100 text-lg mb-8">
              Explore as melhores séries
            </p>
            <div className="flex justify-center w-full max-w-md">
              <SearchBar onSearch={handleSearch} placeholder="Buscar séries..." />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1600px] mx-auto px-8 lg:px-12 pt-16 pb-12">
        {searching ? (
          <LoadingSpinner text="Buscando séries..." />
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">
                {series.length} {series.length === 1 ? 'Série' : 'Séries'}
              </h2>
              <button
                onClick={loadSeries}
                className="text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Recarregar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {series.map((show) => (
                <MediaCard
                  key={show.id}
                  media={{ ...show, type: 'serie' }} // CORREÇÃO: 'tv' para 'serie' para corresponder ao backend
                  onAddToList={handleOpenAddToListModal}
                />
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

export default Series;