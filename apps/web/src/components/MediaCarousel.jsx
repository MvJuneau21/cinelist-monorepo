// src/components/MediaCarousel.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef } from 'react';
import MediaCard from './MediaCard';

function MediaCarousel({ title, items, onAddToList }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const element = scrollRef.current;
    if (element) {
      setCanScrollLeft(element.scrollLeft > 0);
      setCanScrollRight(
        element.scrollLeft < element.scrollWidth - element.clientWidth - 10
      );
    }
  };

  const scroll = (direction) => {
    const element = scrollRef.current;
    if (element) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full ${
              canScrollLeft
                ? 'bg-slate-200 hover:bg-slate-300'
                : 'bg-slate-100 cursor-not-allowed'
            } transition-colors`}
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-full ${
              canScrollRight
                ? 'bg-slate-200 hover:bg-slate-300'
                : 'bg-slate-100 cursor-not-allowed'
            } transition-colors`}
          >
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div key={item.id} className="flex-shrink-0 w-64">
            <MediaCard media={item} onAddToList={onAddToList} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default MediaCarousel;