import { useGitHub } from '@/hooks/useGitHub';
import { Github, Star, ExternalLink } from 'lucide-react';

interface ProjectListProps {
  username: string;
}

export default function ProjectList({ username }: ProjectListProps) {
  const { repositories, loading, error } = useGitHub(username);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-web3-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {repositories.slice(0, 6).map((repo) => (
        <div key={repo.id} className="card hover:border-web3-primary/50 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{repo.name}</h3>
            <Github className="w-5 h-5 text-gray-400" />
          </div>
          
          <p className="text-gray-400 text-sm mb-4 line-clamp-3">
            {repo.description || 'No description available'}
          </p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              {repo.language && (
                <span className="text-web3-accent">{repo.language}</span>
              )}
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-400">{repo.stargazers_count}</span>
              </div>
            </div>
            
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-web3-primary hover:text-web3-secondary transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}