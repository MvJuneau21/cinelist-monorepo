// src/pages/Lists.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Plus, Trash2, Eye } from 'lucide-react';
import { useMessage } from '../hooks/useMessage';
import { useUser } from '../context/UserContext';
import Message from '../components/Message';
import LoadingSpinner from '../components/LoadingSpinner';
import { createList, getUserLists, deleteList } from '../services/lists';

function Lists() {
const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const { message, type, showMessage } = useMessage();
  const { user } = useUser(); // Mantido para uso futuro
  const navigate = useNavigate();

  const FIXED_USER_ID = 10;

  useEffect(() => {
    if (user) {
      loadLists();
    }
  }, [user]);

  const loadLists = async () => {
    setLoading(true);
    try {
      // Usando o ID fixo para buscar as listas
      const data = await getUserLists({ user_id: FIXED_USER_ID });
      setLists(data || []);
    } catch (error) {
      showMessage('Erro ao carregar listas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) {
      return showMessage('Digite um nome para a lista', 'error');
    }

    try {
      const payload = {
        nome: newListName.trim(),
        description: newListDescription.trim() || null,
        user_id: FIXED_USER_ID,
      };
      
      await createList(payload);
      
      showMessage('Lista criada com sucesso!', 'success');
      setNewListName('');
      setNewListDescription('');
      setShowCreateModal(false);
      loadLists();
    } catch (error) {
      showMessage('Erro ao criar lista', 'error');
    }
  };

  const handleDeleteList = async (listId) => {
    if (!user) {
        showMessage('Você precisa estar logado para excluir uma lista.', 'error');
        return;
    }

    if (!confirm('Tem certeza que deseja excluir esta lista?')) return;

    try {
      await deleteList({ 
        lista_id: listId, 
        user_id: FIXED_USER_ID, // Usando o ID fixo
      });
      showMessage('Lista excluída com sucesso!', 'success');
      loadLists();
    } catch (error) {
      showMessage('Erro ao excluir lista', 'error');
    }
  };

  const handleViewList = (listId) => {
    navigate(`/lists/${listId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <LoadingSpinner text="Carregando suas listas..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Message message={message} type={type} />

      <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white py-12 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8 lg:px-12 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <List className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Minhas Listas</h1>
          </div>
          <p className="text-slate-300">
            Organize suas mídias favoritas em listas personalizadas
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-[1600px] mx-auto px-8 lg:px-12 pt-16 pb-12">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">
            {lists.length} {lists.length === 1 ? 'Lista' : 'Listas'}
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Lista</span>
          </button>
        </div>

        {lists.length === 0 ? (
          <div className="text-center py-20">
            <List className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Nenhuma lista criada ainda
            </h3>
            <p className="text-slate-600 mb-6">
              Crie sua primeira lista para organizar suas mídias favoritas
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar Primeira Lista
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lists.map((list) => (
              <div
                key={list.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
              >
                {/* CORREÇÃO: 'list.name' para 'list.nome' para corresponder ao backend */}
                <h3 className="text-xl font-bold text-slate-900 mb-2">{list.nome}</h3>
                {list.description && (
                  <p className="text-slate-600 mb-4 line-clamp-2">{list.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {list.item_count || 0} {list.item_count === 1 ? 'item' : 'itens'}
                  </span>
                  <div className="flex space-x-2">
                    {/* CORREÇÃO: Adicionado onClick para o botão de visualizar */}
                    <button
                      onClick={() => handleViewList(list.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteList(list.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Criar Nova Lista</h2>
            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome da Lista
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Ex: Filmes Favoritos"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Adicione uma descrição..."
                  rows="3"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewListName('');
                    setNewListDescription('');
                  }}
                  className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar Lista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Lists;