import * as React from 'react';
import { getNpmClients } from '@/services/project';

const { useState, useEffect } = React;

interface IParams {
  /** true 时自动运行， 默认 true */
  active?: boolean;
}

interface IResult {
  loading: boolean;
  error?: Error | undefined;
  npmClient: string[];
}

const useNpmClients = (params: IParams = {}): IResult => {
  const { active = true } = params;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState();
  const [npmClient, setNpmClient] = useState<string[]>([]);

  const getMpmClients = async () => {
    if (!npmClient.length) {
      setLoading(true);
      try {
        const { data: clients } = await getNpmClients();
        if (Array.isArray(clients) && clients.length) {
          setNpmClient(clients);
        }
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(
    () => {
      if (active) {
        (async () => {
          await getMpmClients();
        })();
      }
    },
    [active],
  );

  return {
    npmClient,
    error,
    loading,
  };
};

export default useNpmClients;
