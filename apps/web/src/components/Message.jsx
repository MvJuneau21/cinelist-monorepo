// src/components/Message.jsx
function Message({ message, type }) {
  if (!message) return null;

  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ${typeStyles[type] || 'bg-gray-500'}`}>
      {message}
    </div>
  );
}

export default Message;