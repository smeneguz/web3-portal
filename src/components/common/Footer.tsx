import { Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black/50 border-t border-web3-primary/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Web3 Portal</h3>
            <p className="text-gray-400 text-sm">
              Your gateway to decentralized applications and Web3 projects.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/projects" className="hover:text-web3-accent transition-colors">Projects</a></li>
              <li><a href="/mint" className="hover:text-web3-accent transition-colors">NFT Mint</a></li>
              <li><a href="/about" className="hover:text-web3-accent transition-colors">About</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="https://github.com/smeneguz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-web3-accent transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-web3-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-web3-accent transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Web3 Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}