import { useState, useEffect } from 'react';
import { useMessage } from '../hooks/useMessage';
import Message from '../components/Message';
import SearchBar from '../components/SearchBar';
import MediaCarousel from '../components/MediaCarousel';
import MediaCard from '../components/MediaCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AddToListModal from '../components/AddToListModal';
import { getPopularMedia, searchMedia } from '../services/media';
import { getUserLists, addItemToList } from '../services/lists';

function Home() {
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [anime, setAnime] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const { message, type, showMessage } = useMessage();

  // --- States for "Add to List" Modal ---
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const FIXED_USER_ID = 10;

  useEffect(() => {
    loadAllMedia();
  }, []);

  const loadAllMedia = async () => {
    setLoading(true);
    try {
      const response = await getPopularMedia();
      const allMedia = response.results || [];

      setMovies(allMedia.filter(m => m.type === 'movie').slice(0, 10));
      setSeries(allMedia.filter(m => m.type === 'serie').slice(0, 10));
      setAnime(allMedia.filter(m => m.type === 'anime').slice(0, 10));
    } catch (error) {
      showMessage('Erro ao carregar conteúdo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]); // Limpa os resultados se a busca for vazia
      return;
    }
    setSearching(true);
    try {
      const response = await searchMedia(query);
      const resultsArray = response?.results || [];
      // Normaliza os dados de anime, pois o formato da API é diferente
      const normalizedResults = resultsArray.map(item =>
        item.type === 'anime' ? normalizeAnimeData(item) : item
      );
      setSearchResults(normalizedResults);
      if (resultsArray.length === 0) {
        showMessage('Nenhum resultado encontrado', 'warning');
      }
    } catch (error) {
      showMessage('Erro ao buscar', 'error');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // --- Functions to control the "Add to List" modal ---
  
  const handleOpenAddToListModal = async (media) => {
    setSelectedMedia(media);
    setIsAddToListModalOpen(true);
    setLoadingLists(true);
    try {
      const lists = await getUserLists({ user_id: FIXED_USER_ID });
      setUserLists(lists || []);
    } catch (error) {
      showMessage('Erro ao buscar suas listas', 'error');
      setUserLists([]);
    } finally {
      setLoadingLists(false);
    }
  };

  const handleCloseModal = () => {
    setIsAddToListModalOpen(false);
    setSelectedMedia(null);
    setUserLists([]);
  };

  const handleSelectList = async (listId) => {
    if (!selectedMedia) return;
    try {
      const payload = {
        lista_id: listId,
        media_id: selectedMedia.id,
        // Garante que 'tv' seja mapeado para 'serie' como no backend
        media_type: selectedMedia.type === 'tv' ? 'serie' : selectedMedia.type,
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

  const normalizeAnimeData = (anime) => ({
    ...anime,
    type: 'anime',
    title: anime.title?.romaji || anime.title?.english || 'Sem título',
    overview: anime.description ? anime.description.replace(/<[^>]*>/g, '') : 'Sem descrição disponível.',
    poster_path: anime.coverImage?.large || anime.coverImage?.medium || null,
    backdrop_path: anime.bannerImage || anime.coverImage?.extraLarge || null,
    vote_average: anime.averageScore ? anime.averageScore / 10 : 0,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <LoadingSpinner text="Carregando conteúdo..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Message message={message} type={type} />
      
      {/* --- Header Section com a Barra de Busca --- */}
      <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo ao CineList</h1>
          <p className="text-lg text-slate-300 mb-8">
            Explore, avalie e organize filmes, séries e animes em um só lugar.
          </p>
          {/* 👇 BARRA DE BUSCA REINSERIDA E CONECTADA À FUNÇÃO handleSearch 👇 */}
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {searching ? (
          <LoadingSpinner text="Buscando..." />
        ) : searchResults.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Resultados da Busca</h2>
              <button onClick={() => setSearchResults([])} className="text-blue-600 hover:text-blue-700 font-medium">
                Limpar busca
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
              {searchResults.map((item) => (
                <MediaCard key={`${item.type}-${item.id}`} media={item} onAddToList={handleOpenAddToListModal} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {movies.length > 0 && (
              <MediaCarousel
                title="Filmes Populares"
                items={movies}
                onAddToList={handleOpenAddToListModal}
              />
            )}
            {series.length > 0 && (
              <MediaCarousel
                title="Séries Populares"
                items={series}
                onAddToList={handleOpenAddToListModal}
              />
            )}
            {anime.length > 0 && (
              <MediaCarousel
                title="Animes Populares"
                // Normaliza os dados aqui para consistência
                items={anime.map(normalizeAnimeData)}
                onAddToList={handleOpenAddToListModal}
              />
            )}
          </>
        )}
      </div>

      {/* Render the modal at the end of the page */}
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

export default Home;