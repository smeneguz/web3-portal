import { Code, Palette, Github, Linkedin, Twitter, ExternalLink } from 'lucide-react';

export default function AboutPage() {
  const skills = [
    'Solidity', 'JavaScript', 'TypeScript', 'React', 'Next.js',
    'Web3.js', 'Ethers.js', 'IPFS', 'Smart Contracts', 'DeFi'
  ];

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About <span className="gradient-text">Me</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Passionate Web3 developer building the future of decentralized applications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="card">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Code className="w-6 h-6 text-web3-primary mr-3" />
              What I Do
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                I'm a full-stack Web3 developer with expertise in building decentralized applications,
                smart contracts, and blockchain solutions. My passion lies in creating innovative
                solutions that leverage the power of blockchain technology.
              </p>
              <p>
                From DeFi protocols to NFT marketplaces, I enjoy working on projects that push
                the boundaries of what's possible in the decentralized world.
              </p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Palette className="w-6 h-6 text-web3-secondary mr-3" />
              Skills & Technologies
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-gradient-to-r from-web3-primary/20 to-web3-secondary/20 
                           text-white rounded-full text-sm border border-web3-primary/30"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-web3-primary">
                DeFi Trading Platform
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                A decentralized exchange with automated market making and yield farming capabilities.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Solidity • React • Web3.js</span>
                <ExternalLink className="w-4 h-4 text-web3-accent" />
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-web3-secondary">
                NFT Marketplace
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                A full-featured NFT marketplace with minting, trading, and auction functionality.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Next.js • IPFS • OpenSea API</span>
                <ExternalLink className="w-4 h-4 text-web3-accent" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-8">Let's Connect</h2>
          <div className="flex justify-center space-x-6">
            <a
              href="https://github.com/smeneguz"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-full bg-gray-800 hover:bg-web3-primary transition-colors"
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/silvio-arras-meneguzzo-a29681127"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-full bg-gray-800 hover:bg-web3-accent transition-colors"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a
              href="https://x.com/SilvioMeneguzzo"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-full bg-gray-800 hover:bg-web3-secondary transition-colors"
            >
              <Twitter className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}