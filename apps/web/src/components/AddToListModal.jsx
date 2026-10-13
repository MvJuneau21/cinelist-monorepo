import { List as ListIcon, X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

function AddToListModal({ isOpen, onClose, lists, onSelectList, isLoading }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">Adicionar à Lista</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 max-h-60 overflow-y-auto">
          {isLoading ? (
            <LoadingSpinner text="Carregando listas..." />
          ) : lists.length > 0 ? (
            <ul className="space-y-2">
              {lists.map((list) => (
                <li key={list.id}>
                  <button
                    onClick={() => onSelectList(list.id)}
                    className="w-full text-left flex items-center space-x-3 px-4 py-3 bg-slate-50 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <ListIcon className="w-5 h-5 text-slate-600" />
                    <span className="font-semibold text-slate-800">{list.nome}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-slate-600 py-8">
              Você ainda não possui nenhuma lista.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddToListModal;