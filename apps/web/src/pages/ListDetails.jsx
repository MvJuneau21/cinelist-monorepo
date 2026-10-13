import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { List, ArrowLeft } from 'lucide-react';
import { getList, deleteListItem } from '../services/lists';
import { useMessage } from '../hooks/useMessage';
import Message from '../components/Message';
import LoadingSpinner from '../components/LoadingSpinner';
import MediaCard from '../components/MediaCard';

function ListDetails() {
  const [listData, setListData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { message, type, showMessage } = useMessage();
  const FIXED_USER_ID = 10;

  // Função para padronizar os dados dos itens da lista
  const normalizeItemData = (item) => {
    // Primeiro, padroniza a propriedade 'type'
    const baseData = {
      ...item,
      type: item.media_type,
    };

    // Se for um anime, aplica a normalização específica
    if (baseData.type === 'anime') {
      return {
        ...baseData, // Mantém o vote_average que já veio do backend
        title: item.title?.romaji || item.title?.english || 'Sem título',
        overview: item.description ? item.description.replace(/<[^>]*>/g, '') : 'Sem descrição.',
        // As linhas de poster_path e backdrop_path também já foram removidas na etapa anterior
        // A linha de vote_average foi REMOVIDA AGORA
      };
    }
      // Para filmes e séries, apenas retorna com o 'type' ajustado
    return baseData;
  };

  // Função para buscar os detalhes da lista
  const fetchListDetails = async () => {
    try {
      const data = await getList({ lista_id: parseInt(id) });
      setListData(data);
    } catch (error) {
      showMessage('Erro ao carregar detalhes da lista.', 'error');
      setListData(null);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para buscar os dados quando o ID da URL mudar
  useEffect(() => {
    setLoading(true);
    fetchListDetails();
  }, [id]);

  // Função para lidar com a remoção de um item da lista
  const handleRemoveItem = async (media) => {
    if (!confirm(`Tem certeza que deseja remover "${media.title || media.name}" da lista?`)) {
      return;
    }

    try {
      const payload = {
        user_id: FIXED_USER_ID,
        lista_id: parseInt(id),
        media_id: media.id,
        // Usa a propriedade 'type' já normalizada
        media_type: media.type, 
      };
      await deleteListItem(payload);
      showMessage('Item removido com sucesso!', 'success');
      fetchListDetails(); // Recarrega a lista
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Erro ao remover item.';
      showMessage(errorMessage, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <LoadingSpinner text="Carregando lista..." />
      </div>
    );
  }

  if (!listData) {
    return (
      <div className="min-h-screen bg-slate-50 text-center py-20">
        <Message message={message} type={type} />
        <h2 className="text-2xl font-bold text-slate-800">Lista não encontrada</h2>
        <Link to="/lists" className="mt-4 inline-flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Minhas Listas
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Message message={message} type={type} />

      <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white py-12 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8 lg:px-12">
          <Link to="/lists" className="mb-4 inline-flex items-center text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Minhas Listas
          </Link>
          <div className="flex items-center space-x-3 mb-2">
            <List className="w-8 h-8" />
            <h1 className="text-4xl font-bold">{listData.nome}</h1>
          </div>
          {listData.description && (
            <p className="text-slate-300 max-w-2xl">{listData.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 lg:px-12 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {listData.item_count} {listData.item_count === 1 ? 'Item na Lista' : 'Itens na Lista'}
        </h2>
        
        {listData.itens.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {listData.itens.map((item) => (
              <MediaCard 
                key={`${item.media_type}-${item.id}`}
                // Normaliza os dados antes de passar para o card
                media={normalizeItemData(item)} 
                onRemoveFromList={handleRemoveItem}
                listId={id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <List className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Lista Vazia
            </h3>
            <p className="text-slate-600">
              Adicione filmes, séries ou animes para vê-los aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListDetails;