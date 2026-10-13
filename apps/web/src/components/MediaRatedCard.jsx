import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

// Função para tratar URLs de imagem
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/w500${path}`;
};

function MediaRatedCard({ media }) {
  const navigate = useNavigate();

  // MODIFICAÇÃO: A rota agora inclui o TIPO e o ID da mídia
  const handleClick = () => {
    navigate(`/rated/${media.type}/${media.id}`, { state: { media } });
  };
  
  const title = typeof media.title === 'object' 
    ? media.title.romaji || media.title.english || 'Sem título' 
    : media.title || media.name;

  const imageUrl = getImageUrl(media.poster_path);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group h-full flex flex-col">
      <div className="relative h-64 bg-slate-800 cursor-pointer" onClick={handleClick}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            Sem Imagem
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg mb-2 line-clamp-1 text-slate-900">
          {title}
        </h3>

        <span className="inline-block self-start px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mb-2">
          {media.type === 'movie' ? 'Filme' : media.type === 'serie' || media.type === 'tv' ? 'Série' : 'Anime'}
        </span>

        {/* Mostra a nota que o USUÁRIO deu */}
        {(media.vote_average != null) && (
          <div className="flex items-center space-x-1 mb-3">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-slate-700">
              Sua nota: {media.vote_average.toFixed(1)}
            </span>
          </div>
        )}

        {/* Mostra o COMENTÁRIO */}
        {media.comment ? (
          <blockquote className="mb-4 flex-grow border-l-4 border-slate-300 py-1 pl-3 text-sm italic text-slate-700 line-clamp-3">
            "{media.comment}"
          </blockquote>
        ) : (
          <p className="mb-4 flex-grow text-sm italic text-slate-500">
            Nenhum comentário adicionado.
          </p>
        )}

        <div className="mt-auto">
          <button
            onClick={handleClick}
            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Detalhes
          </button>
        </div>
      </div>
    </div>
  );
}

export default MediaRatedCard;