import { useState, useEffect } from 'react';
import { fetchRepositories } from '@/services/github';
import { GitHubProject } from '@/types';

export const useGitHub = (username: string) => {
  const [repositories, setRepositories] = useState<GitHubProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRepositories = async () => {
      try {
        setLoading(true);
        const repos = await fetchRepositories(username);
        setRepositories(repos);
        setError(null);
      } catch (err) {
        setError('Failed to fetch repositories');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      loadRepositories();
    }
  }, [username]);

  return { repositories, loading, error };
};