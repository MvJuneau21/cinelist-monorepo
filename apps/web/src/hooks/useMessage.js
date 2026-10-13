// src/hooks/useMessege.js
import { useState, useCallback } from 'react';

export const useMessage = () => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');

  const showMessage = useCallback((msg, msgType = 'success') => {
    setMessage(msg);
    setType(msgType);
    setTimeout(() => {
      setMessage('');
    }, 3000);
  }, []);

  return { message, type, showMessage };
};