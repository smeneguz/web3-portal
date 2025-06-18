# Web3 Portal

Welcome to the Web3 Portal project! This application showcases various Web3 projects and integrates with GitHub, allowing users to connect their wallets and mint NFTs across different blockchain networks.

## Features

- **Showcase of Web3 Projects**: Explore a variety of Web3 projects with detailed information.
- **GitHub Integration**: Fetch project data directly from GitHub repositories.
- **Wallet Connection**: Connect your crypto wallet to perform actions like minting NFTs.
- **Multi-Chain Support**: Mint NFTs across different blockchain networks.

## Project Structure

```
web3-portal
├── src
│   ├── components
│   │   ├── common
│   │   ├── wallet
│   │   ├── nft
│   │   └── projects
│   ├── pages
│   ├── hooks
│   ├── services
│   ├── utils
│   ├── types
│   └── styles
├── public
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Getting Started

To get started with the Web3 Portal project, follow these steps:

1. **Clone the Repository**:
   ```
   git clone <repository-url>
   cd web3-portal
   ```

2. **Install Dependencies**:
   ```
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Required
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   
   # Optional - for contract deployment
   PRIVATE_KEY=your_private_key
   INFURA_PROJECT_ID=your_infura_project_id
   PINATA_API_KEY=your_pinata_api_key
   PINATA_SECRET_KEY=your_pinata_secret_key
   
   # Contract addresses (will be filled after deployment)
   NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST=
   NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=
   ```

4. **Run the Development Server**:
   ```
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000` to view the application.


## Smart Contract Development

### Local Development

1. **Start Hardhat network**
   ```bash
   # Terminal 1
   npm run node
   ```

2. **Deploy contracts**
   ```bash
   # Terminal 2
   npm run deploy:local
   ```

3. **Run tests**
   ```bash
   npm test
   ```

### Testnet Deployment

1. **Deploy to Sepolia**
   ```bash
   npm run deploy:sepolia
   ```

2. **Verify contract**
   ```bash
   npm run verify:sepolia YOUR_CONTRACT_ADDRESS

## Contributing

We welcome contributions to the Web3 Portal project! If you have suggestions or improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Acknowledgments

- Thanks to the open-source community for their contributions and support.
- Special thanks to the developers of the libraries and frameworks used in this project.