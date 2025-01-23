// location.tpl
import { useState, useEffect } from 'react';
import { useLocation as defaultUseLocation } from 'react-router-dom';
import { history } from './history';

function useLocationCompat() {
  const [location, setLocation] = useState(history.location);

  useEffect(() => {
    const unlisten = history.listen((update) => {
      setLocation(update.location);
    });

    return unlisten;
  }, []);

  return location;
}

export const useLocation = {{#historyWithQuery}}useLocationCompat{{/historyWithQuery}}{{^historyWithQuery}}defaultUseLocation{{/historyWithQuery}};
