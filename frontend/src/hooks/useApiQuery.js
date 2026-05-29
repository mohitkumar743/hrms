import { useQuery } from 'react-query';
import { api } from '../services/api.js';

export const useApiQuery = (key, url, options = {}) =>
  useQuery(key, async () => (await api.get(url)).data, { retry: false, staleTime: 30000, ...options });
