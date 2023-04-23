import { useLocation } from 'react-router-dom';
import { useAppData } from './appContext';

export function __useFetcher() {
  const { preloadRoute } = useAppData();
  const location = useLocation();
  return {
    load(path?: string) {
      preloadRoute!(path || location.pathname);
    },
  };
}
