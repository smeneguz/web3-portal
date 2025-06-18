import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Palette, Github, ArrowRight, ExternalLink } from 'lucide-react';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Welcome to{' '}
              <span className="gradient-text">Web3 Portal</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Your gateway to decentralized applications, NFT collections, and innovative Web3 projects.
            </p>
            
            {isConnected && (
              <div className="mb-8">
                <p className="text-web3-accent mb-4">
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/projects" className="btn-primary inline-flex items-center">
                <span>Explore Projects</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/mint" className="btn-secondary inline-flex items-center">
                <Palette className="mr-2 w-5 h-5" />
                <span>Mint NFTs</span>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-web3-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-web3-secondary/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What You Can Do
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="card text-center group hover:border-web3-primary/50 transition-all duration-300"
            >
              <Code className="w-12 h-12 text-web3-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-3">Explore Projects</h3>
              <p className="text-gray-400 mb-4">
                Discover my latest Web3 projects, smart contracts, and dApps directly from GitHub.
              </p>
              <Link href="/projects" className="text-web3-primary hover:text-web3-secondary inline-flex items-center">
                <span>View Projects</span>
                <ExternalLink className="ml-2 w-4 h-4" />
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card text-center group hover:border-web3-secondary/50 transition-all duration-300"
            >
              <Palette className="w-12 h-12 text-web3-secondary mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-3">Mint NFTs</h3>
              <p className="text-gray-400 mb-4">
                Mint unique NFTs across multiple chains. Connect your wallet and choose your favorite network.
              </p>
              <Link href="/mint" className="text-web3-secondary hover:text-web3-primary inline-flex items-center">
                <span>Start Minting</span>
                <Palette className="ml-2 w-4 h-4" />
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="card text-center group hover:border-web3-accent/50 transition-all duration-300"
            >
              <Github className="w-12 h-12 text-web3-accent mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-3">GitHub Integration</h3>
              <p className="text-gray-400 mb-4">
                Real-time integration with GitHub repositories, showcasing live project data and statistics.
              </p>
              <a 
                href="https://github.com/smeneguz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-web3-accent hover:text-web3-primary inline-flex items-center"
              >
                <span>View GitHub</span>
                <Github className="ml-2 w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}