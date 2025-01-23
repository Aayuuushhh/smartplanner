import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalWrapperProps {
  children: React.ReactNode;
}

const PortalWrapper: React.FC<PortalWrapperProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) return null;

  return createPortal(children, portalRoot);
};

export default PortalWrapper;
