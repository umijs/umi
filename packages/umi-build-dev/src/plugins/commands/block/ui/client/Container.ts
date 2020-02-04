import { useState } from 'react';
import { parse } from 'qs';
import { createContainer } from './unstated-next';
import { Resource } from '../../data';

export default createContainer(function(initialState: object) {
  const getQueryConfig = () => parse(window.location.search.substr(1));
  const query = getQueryConfig();
  const [type, setType] = useState<Resource['blockType']>(query.type || 'block');
  const [activeResource, setActiveResource] = useState<Resource>(
    query.resource ? { id: query.resource } : null,
  );

  return {
    ...initialState,
    type,
    setType,
    activeResource,
    setActiveResource,
  };
});
