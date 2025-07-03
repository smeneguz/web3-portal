import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import WalletConnect from '../wallet/WalletConnect';
import NetworkSelector from '../wallet/NetworkSelector';

const Header: React.FC = () => {
  const router = useRouter();
  const { isConnected } = useAccount();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/projects', label: 'Projects' },
    { href: '/mint', label: 'Mint NFT' },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W3</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Web3Portal</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActiveRoute(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side - Network Selector + Wallet */}
          <div className="flex items-center space-x-4">
            {/* Network Selector - Show only when connected */}
            {isConnected && <NetworkSelector />}
            
            {/* Wallet Connect */}
            <WalletConnect />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                block px-3 py-2 rounded-md text-base font-medium transition-colors
                ${isActiveRoute(item.href)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }
              `}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;