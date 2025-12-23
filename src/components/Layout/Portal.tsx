import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
};

export default Portal;
