import { useState, useEffect } from 'react';
import { Github, Star, ExternalLink, GitBranch, Clock } from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  updated_at: string;
  topics: string[];
}

export default function ProjectsPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setLoading(true);
        // Replace 'silviomeneguzzo' with your GitHub username
        const response = await fetch('https://api.github.com/users/smeneguz/repos?sort=updated&per_page=12');
        if (!response.ok) throw new Error('Failed to fetch repositories');
        const data = await response.json();
        setRepositories(data);
      } catch (err) {
        setError('Failed to load projects');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-web3-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            My <span className="gradient-text">Projects</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore my latest Web3 projects, smart contracts, and decentralized applications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories.map((repo) => (
            <div key={repo.id} className="card hover:border-web3-primary/50 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-white group-hover:text-web3-primary transition-colors">
                  {repo.name}
                </h3>
                <Github className="w-5 h-5 text-gray-400" />
              </div>
              
              <p className="text-gray-400 text-sm mb-4 line-clamp-3 min-h-[3rem]">
                {repo.description || 'No description available'}
              </p>

              {repo.topics && repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {repo.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 bg-web3-primary/20 text-web3-primary text-xs rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center space-x-4">
                  {repo.language && (
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 rounded-full bg-web3-accent"></div>
                      <span className="text-gray-400">{repo.language}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400">{repo.stargazers_count}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">
                    {new Date(repo.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-web3-primary hover:text-web3-secondary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">View Project</span>
                </a>
                
                <div className="flex space-x-2">
                  <button className="p-2 rounded-lg bg-web3-primary/20 text-web3-primary hover:bg-web3-primary hover:text-white transition-colors">
                    <GitBranch className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {repositories.length === 0 && (
          <div className="text-center py-20">
            <Github className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No repositories found</p>
          </div>
        )}
      </div>
    </div>
  );
}