export const chains = {
  ethereum: {
    name: "Ethereum",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
    chainId: 1,
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  polygon: {
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com/",
    chainId: 137,
    nativeCurrency: {
      name: "Matic",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  binanceSmartChain: {
    name: "Binance Smart Chain",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    chainId: 56,
    nativeCurrency: {
      name: "Binance Coin",
      symbol: "BNB",
      decimals: 18,
    },
  },
  // Add more chains as needed
};

export const getChainById = (chainId) => {
  return Object.values(chains).find(chain => chain.chainId === chainId);
};