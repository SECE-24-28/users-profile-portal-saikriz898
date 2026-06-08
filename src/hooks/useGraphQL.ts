'use client';

import { useCallback } from 'react';
import { useAuth } from './useAuth';

export function useGraphQL() {
  const { token } = useAuth();

  const query = useCallback(
    async <T = unknown>(gqlQuery: string, variables?: Record<string, unknown>): Promise<T> => {
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: gqlQuery, variables }),
      });

      const data = await res.json();
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }
      return data.data as T;
    },
    [token]
  );

  return { query };
}
