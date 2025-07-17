# Web3Portal Network Management System

## Overview
This project now includes a comprehensive network management system that allows you to easily deploy and manage your NFT contract across multiple networks.

##  Available Networks

| Network | Chain ID | Symbol | Type | Status |
|---------|----------|--------|------|--------|
| Localhost | 31337 | ETH | Development | ✅ |
| Sepolia | 11155111 | ETH | Testnet | ❌ |
| Polygon Amoy | 80002 | MATIC | Testnet | ❌ |
| Polygon Mainnet | 137 | MATIC | Mainnet | ❌ |

## Quick Start

### 1. Check Network Status
```bash
npm run deploy:status
```

### 2. Deploy to Localhost
```bash
# Start local node first
npm run node

# Deploy to localhost
npm run deploy:localhost
```

### 3. Deploy to Testnet
```bash
# Deploy to Sepolia
npm run deploy:sepolia

# Deploy to Polygon Amoy
npm run deploy:amoy
```

### 4. Check Network Requirements
```bash
npm run network check sepolia
npm run network check amoy
```

## Available Commands

### Package.json Scripts
- `npm run deploy:localhost` - Deploy to local Hardhat node
- `npm run deploy:sepolia` - Deploy to Sepolia testnet
- `npm run deploy:amoy` - Deploy to Polygon Amoy testnet
- `npm run deploy:polygon` - Deploy to Polygon mainnet
- `npm run deploy:status` - Check deployment status for all networks
- `npm run deploy:list` - List available networks
- `npm run network` - Access network manager directly

### Network Manager Commands
```bash
# Deploy to specific network
node scripts/network-manager.js deploy <network>

# Check deployment status
node scripts/network-manager.js status

# List available networks
node scripts/network-manager.js list

# Check network requirements
node scripts/network-manager.js check <network>
```

## Configuration

### Environment Variables
The system automatically manages these environment variables in `.env.local`:

```env
# Contract addresses (auto-updated after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST=0x...
NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=0x...
NEXT_PUBLIC_CONTRACT_ADDRESS_AMOY=0x...
NEXT_PUBLIC_CONTRACT_ADDRESS_POLYGON=0x...

# Required for testnet/mainnet deployment
PRIVATE_KEY=0x...
ALCHEMY_API_KEY=...
INFURA_PROJECT_ID=...
```

### Network Configuration
Networks are configured in `scripts/deploy-universal.js`:

```javascript
const NETWORK_CONFIG = {
  localhost: {
    displayName: 'Web3Portal NFT (Local)',
    symbol: 'WP3L',
    baseURI: 'https://ipfs.io/ipfs/',
    mintPrice: '0.01'
  },
  sepolia: {
    displayName: 'Web3Portal NFT (Sepolia)',
    symbol: 'WP3S',
    baseURI: 'https://ipfs.io/ipfs/',
    mintPrice: '0.01'
  }
  // ... other networks
};
```

##  Frontend Integration

### Network Selector Component
Use the `NetworkSelector` component to let users switch networks:

```tsx
import NetworkSelector from '../components/common/NetworkSelector';

function MyPage() {
  const handleNetworkChange = (chainId: number) => {
    console.log('Network changed to:', chainId);
  };

  return (
    <NetworkSelector onNetworkChange={handleNetworkChange} />
  );
}
```

### Network Info Component
Display current network information:

```tsx
import NetworkInfo from '../components/common/NetworkInfo';

function MyPage() {
  return (
    <NetworkInfo 
      showContractAddress={true}
      showExplorerLink={true}
      compact={false}
    />
  );
}
```

## Deployment Process

### What Happens During Deployment
1. **Verification**: Checks network requirements and configuration
2. **Deployment**: Deploys the contract with network-specific parameters
3. **Testing**: Verifies contract functions work correctly
4. **Configuration**: Enables minting automatically
5. **Environment Update**: Updates `.env.local` with new contract address
6. **Persistence**: Saves deployment info to `deployments/<network>.json`

### Network-Specific Features
- **Localhost**: Instant deployment, no gas costs
- **Sepolia**: ETH testnet, free from faucets
- **Amoy**: MATIC testnet, free from faucets
- **Polygon**: MATIC mainnet, real costs

## Troubleshooting

### Common Issues

#### 1. "Contract not deployed" Error
```bash
# Check deployment status
npm run deploy:status

# Deploy to the network you're trying to use
npm run deploy:localhost  # or sepolia, amoy, etc.
```

#### 2. "Network not supported" Error
Make sure you're using a supported network:
- localhost (31337)
- sepolia (11155111)
- amoy (80002)
- polygon (137)

#### 3. "Insufficient funds" Error
- **Localhost**: No funds needed
- **Sepolia**: Get ETH from [Sepolia Faucet](https://sepoliafaucet.com)
- **Amoy**: Get MATIC from [Polygon Faucet](https://faucet.polygon.technology)

#### 4. "Node not running" Error (Localhost)
```bash
# Start the local node
npm run node

# Then deploy
npm run deploy:localhost
```

## Frontend Network Switching

The frontend automatically detects the current network and shows appropriate contract information. Users can:

1. **View Current Network**: See network info and contract status
2. **Switch Networks**: Use the network selector to change networks
3. **Auto-Detection**: Contract addresses are automatically loaded based on network

##  Best Practices

### Development Workflow
1. **Start Local**: Always test on localhost first
2. **Test on Testnet**: Use Sepolia or Amoy for testing
3. **Deploy to Mainnet**: Only after thorough testing

### Network Management
- Keep private keys secure
- Use different contract symbols for each network
- Monitor gas prices on mainnet
- Use testnet faucets for development

### Frontend Integration
- Always check if contract is deployed before calling functions
- Handle network switching gracefully
- Show appropriate error messages for unsupported networks

## 🔗 Resources

### Faucets
- [Sepolia Faucet](https://sepoliafaucet.com) - Free ETH for Sepolia
- [Polygon Faucet](https://faucet.polygon.technology) - Free MATIC for Amoy

### Explorers
- [Sepolia Etherscan](https://sepolia.etherscan.io)
- [Amoy Polygonscan](https://amoy.polygonscan.com)
- [Polygon Polygonscan](https://polygonscan.com)

### Documentation
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.io/v6/)
- [Wagmi Documentation](https://wagmi.sh/)

##  Next Steps

1. **Get testnet tokens** from faucets
2. **Deploy to testnets** using the new system
3. **Test frontend** with different networks
4. **Prepare for mainnet** deployment

The system is now fully modular and ready for multi-network deployment! 🚀
