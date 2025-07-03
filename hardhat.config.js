require("@nomicfoundation/hardhat-toolbox");

// Load environment variables from both .env and .env.local
require("dotenv").config();
require("dotenv").config({ path: ".env.local" });

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;

// Debug logging (without emojis to avoid syntax errors)
console.log("Environment check:");
console.log(`Private key loaded: ${PRIVATE_KEY ? 'YES' : 'NO'}`);
console.log(`Alchemy key loaded: ${ALCHEMY_API_KEY ? 'YES' : 'NO'}`);
console.log(`Infura key loaded: ${INFURA_PROJECT_ID ? 'YES' : 'NO'}`);

if (!PRIVATE_KEY) {
  console.warn("WARNING: PRIVATE_KEY not found in environment variables!");
  console.warn("Make sure you have either .env or .env.local with PRIVATE_KEY");
}

// Use only tested working public RPCs to avoid rate limits
function getSepoliaUrl() {
  // Use tested working public RPCs first (no rate limits)
  return "https://sepolia.gateway.tenderly.co";
  
  // Commented out Alchemy/Infura due to rate limits
  // if (ALCHEMY_API_KEY) {
  //   return `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
  // }
  // if (INFURA_PROJECT_ID) {
  //   return `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`;
  // }
}

function getAmoyUrl() {
  // Use tested working public RPC (most reliable)
  return "https://rpc-amoy.polygon.technology";
  
  // Commented out paid providers for now
  // if (ALCHEMY_API_KEY) {
  //   return `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
  // }
  // if (INFURA_PROJECT_ID) {
  //   return `https://polygon-amoy.infura.io/v3/${INFURA_PROJECT_ID}`;
  // }
}

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    }
  },
  networks: {
    hardhat: {
      chainId: 31337,
      mining: {
        auto: true,
        interval: 1000,
      }
    },
    sepolia: {
      url: getSepoliaUrl(),
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      timeout: 120000,
      gasPrice: "auto",
      gas: "auto",
    },
    amoy: {
      url: getAmoyUrl(),
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 80002,
      timeout: 120000,
      gasPrice: "auto",
      gas: "auto",
    },
    polygon: {
      url: "https://polygon-rpc.com", // Public RPC
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 137,
      timeout: 60000,
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
      amoy: process.env.POLYGONSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
    },
    customChains: [
      {
        network: "amoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
  mocha: {
    timeout: 300000,
  },
};