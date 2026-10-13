// src/pages/MediaRatedDetails.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useMessage } from '../hooks/useMessage';
import Message from '../components/Message';
import { updateRating, deleteRating } from '../services/media'; 

function MediaRatedDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { type: mediaType, id: mediaId } = useParams();
  const media = location.state?.media;
  const { message, type, showMessage } = useMessage();

  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (media) {
      setRating(media.vote_average || 5);
      setReview(media.comment || '');
    }
  }, [media]);

  const getMediaTitle = (media) => {
    if (!media) return 'Título indisponível';
    return media.title || media.name || 'Título desconhecido';
  };

  const getImageUrl = (path, quality = 'w500') => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/${quality}${path}`;
  };

  const handleUpdateRating = async (e) => {
    e.preventDefault();
    if (rating === '' || rating < 0 || rating > 10) {
      return showMessage('Por favor, selecione uma nota entre 0 e 10.', 'error');
    }
    setSubmitting(true);
    try {
      const payload = {
        media_type: mediaType,
        media_id: parseInt(mediaId, 10),
        rating: parseFloat(rating),
        comment: review.trim(),
        user_id: 10,
      };
      await updateRating(payload); 
      showMessage('Avaliação atualizada com sucesso!', 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Erro ao atualizar avaliação.';
      showMessage(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!window.confirm('Tem certeza que deseja deletar esta avaliação?')) return;
    setSubmitting(true);
    try {
      const payload = {
        media_type: mediaType,
        media_id: parseInt(mediaId, 10),
        user_id: 10,
      };
      await deleteRating(payload);
      showMessage('Avaliação deletada com sucesso!', 'success');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Erro ao deletar avaliação.';
      showMessage(errorMessage, 'error');
      setSubmitting(false);
    }
  };

  if (!media) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Mídia avaliada não encontrada</h2>
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar para o Perfil
          </button>
        </div>
      </div>
    );
  }

  const backdropUrl = getImageUrl(media.backdrop_path, 'original');
  const posterUrl = getImageUrl(media.poster_path, 'w500');

  return (
    <div className="min-h-screen bg-slate-50">
      <Message message={message} type={type} />

      <button
        onClick={() => navigate(-1)}
        className="fixed top-20 left-4 z-10 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <ArrowLeft className="w-6 h-6 text-slate-700" />
      </button>

      <div className="relative h-96 bg-gradient-to-br from-slate-900 to-slate-700">
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt={getMediaTitle(media)}
            className="w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {posterUrl && (
              <img
                src={posterUrl}
                alt={getMediaTitle(media)}
                // LINHA ALTERADA AQUI
                className="w-64 h-auto object-cover rounded-xl shadow-lg mx-auto md:mx-0"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">{getMediaTitle(media)}</h1>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-3 mt-6">Sinopse</h2>
              <p className="text-slate-700 leading-relaxed mb-8">
                {media.overview || 'Sem descrição disponível.'}
              </p>

              <div className="bg-slate-50 p-6 rounded-xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Editar sua avaliação</h2>
                <form onSubmit={handleUpdateRating} className="space-y-4">
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Nota
                      </label>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-lg font-bold">
                        {parseFloat(rating || 0).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💩</span>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        style={{
                          background: `linear-gradient(to right, #ef4444, #f59e0b, #22c55e)`,
                        }}
                      />
                      <span className="text-2xl">🤩</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Comentário (opcional)
                    </label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Compartilhe sua opinião..."
                      rows="4"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex justify-center items-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit className="w-5 h-5" />
                      {submitting ? 'Atualizando...' : 'Atualizar Avaliação'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteRating}
                      disabled={submitting}
                      className="w-full flex justify-center items-center gap-2 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-5 h-5" />
                      Deletar Avaliação
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MediaRatedDetails;