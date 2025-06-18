// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Web3PortalNFT
 * @dev ERC721 NFT contract with advanced features following OpenZeppelin best practices
 * @author Silvio Meneguzzo
 * @notice This contract implements a feature-rich NFT collection with minting controls,
 *         whitelist functionality, and comprehensive admin features
 */
contract Web3PortalNFT is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    Ownable, 
    ReentrancyGuard, 
    Pausable 
{
    using Counters for Counters.Counter;
    using Strings for uint256;

    // ============ STATE VARIABLES ============
    
    Counters.Counter private _tokenIdCounter;
    
    // Constants
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MAX_MINT_PER_TX = 10;
    uint256 public constant MAX_MINT_PER_WALLET = 50;
    
    // Configurable variables
    uint256 public mintPrice = 0.01 ether;
    string private _baseTokenURI;
    bool public mintingActive = false;
    bool public whitelistActive = false;
    
    // Mappings
    mapping(address => uint256) public addressMintCount;
    mapping(address => bool) public whitelist;
    
    // ============ EVENTS ============
    
    event NFTMinted(
        address indexed to, 
        uint256 indexed tokenId, 
        string tokenURI
    );
    event MintingToggled(bool active);
    event WhitelistToggled(bool active);
    event BaseURIUpdated(string newBaseURI);
    event MintPriceUpdated(uint256 newPrice);
    event WhitelistUpdated(address indexed user, bool status);

    // ============ ERRORS ============
    
    error MintingNotActive();
    error ExceedsMaxSupply();
    error ExceedsMaxMintPerTx();
    error ExceedsMaxMintPerWallet();
    error InsufficientPayment();
    error NotWhitelisted();
    error InvalidQuantity();
    error WithdrawalFailed();
    error InvalidPrice();
    error InvalidBaseURI();

    // ============ CONSTRUCTOR ============
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        uint256 initialMintPrice
    ) ERC721(name, symbol) {
        if (bytes(baseTokenURI).length == 0) revert InvalidBaseURI();
        if (initialMintPrice == 0) revert InvalidPrice();
        
        _baseTokenURI = baseTokenURI;
        mintPrice = initialMintPrice;
        
        // Start with token ID 1
        _tokenIdCounter.increment();
    }

    // ============ MODIFIERS ============
    
    modifier mintCompliance(uint256 quantity) {
        if (!mintingActive) revert MintingNotActive();
        if (quantity == 0 || quantity > MAX_MINT_PER_TX) revert ExceedsMaxMintPerTx();
        if (totalSupply() + quantity > MAX_SUPPLY) revert ExceedsMaxSupply();
        if (addressMintCount[msg.sender] + quantity > MAX_MINT_PER_WALLET) 
            revert ExceedsMaxMintPerWallet();
        _;
    }

    modifier whitelistCompliance() {
        if (whitelistActive && !whitelist[msg.sender]) revert NotWhitelisted();
        _;
    }

    // ============ PUBLIC MINTING FUNCTIONS ============
    
    /**
     * @dev Public mint function with payment validation
     * @param quantity Number of tokens to mint
     * @notice Users can mint up to MAX_MINT_PER_TX tokens per transaction
     * @notice Payment must equal mintPrice * quantity
     */
    function mint(uint256 quantity) 
        external 
        payable 
        nonReentrant 
        whenNotPaused
        mintCompliance(quantity)
        whitelistCompliance
    {
        if (msg.value < mintPrice * quantity) revert InsufficientPayment();

        _mintTokens(msg.sender, quantity);
    }

    /**
     * @dev Free mint for specific addresses (owner only)
     * @param to Address to mint to
     * @param quantity Number of tokens to mint
     * @notice This function bypasses payment requirements but still follows mint compliance
     */
    function freeMint(address to, uint256 quantity) 
        external 
        onlyOwner 
        mintCompliance(quantity)
    {
        _mintTokens(to, quantity);
    }

    /**
     * @dev Batch mint for airdrops and distributions (owner only)
     * @param recipients Array of addresses to mint to
     * @param quantities Array of quantities for each recipient
     * @notice Arrays must be of equal length
     */
    function batchMint(
        address[] calldata recipients, 
        uint256[] calldata quantities
    ) external onlyOwner {
        if (recipients.length != quantities.length) revert InvalidQuantity();
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (totalSupply() + quantities[i] > MAX_SUPPLY) revert ExceedsMaxSupply();
            _mintTokens(recipients[i], quantities[i]);
        }
    }

    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Internal function to mint tokens with metadata
     * @param to Address to mint to
     * @param quantity Number of tokens to mint
     * @notice Creates unique tokenURI for each token and emits NFTMinted event
     */
    function _mintTokens(address to, uint256 quantity) internal {
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            _safeMint(to, tokenId);
            
            // Fixed: Renamed variable to avoid shadowing the tokenURI function
            string memory metadataURI = string(
                abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json")
            );
            _setTokenURI(tokenId, metadataURI);
            
            emit NFTMinted(to, tokenId, metadataURI);
        }
        
        addressMintCount[to] += quantity;
    }

    // ============ OWNER FUNCTIONS ============
    
    /**
     * @dev Toggle minting active state
     * @notice Allows owner to start/stop minting
     */
    function toggleMinting() external onlyOwner {
        mintingActive = !mintingActive;
        emit MintingToggled(mintingActive);
    }

    /**
     * @dev Toggle whitelist active state
     * @notice When active, only whitelisted addresses can mint
     */
    function toggleWhitelist() external onlyOwner {
        whitelistActive = !whitelistActive;
        emit WhitelistToggled(whitelistActive);
    }

    /**
     * @dev Update base URI for metadata
     * @param newBaseURI New base URI for token metadata
     * @notice This affects all future minted tokens
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        if (bytes(newBaseURI).length == 0) revert InvalidBaseURI();
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    /**
     * @dev Update mint price
     * @param newPrice New mint price in wei
     * @notice Price cannot be set to 0
     */
    function setMintPrice(uint256 newPrice) external onlyOwner {
        if (newPrice == 0) revert InvalidPrice();
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }

    /**
     * @dev Add/remove addresses from whitelist
     * @param users Array of addresses to update
     * @param status True to add to whitelist, false to remove
     * @notice Batch operation for efficient whitelist management
     */
    function updateWhitelist(
        address[] calldata users, 
        bool status
    ) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            whitelist[users[i]] = status;
            emit WhitelistUpdated(users[i], status);
        }
    }

    /**
     * @dev Pause contract functionality
     * @notice Prevents all token transfers and minting when paused
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract functionality
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw contract balance to owner
     * @notice Transfers entire contract balance to contract owner
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert WithdrawalFailed();
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) revert WithdrawalFailed();
    }

    /**
     * @dev Emergency withdraw to specific address
     * @param to Address to withdraw funds to
     * @notice Emergency function to withdraw funds to specific address
     */
    function emergencyWithdraw(address payable to) external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert WithdrawalFailed();
        
        (bool success, ) = to.call{value: balance}("");
        if (!success) revert WithdrawalFailed();
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get current token ID counter
     * @return Current token ID that will be minted next
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Get all tokens owned by an address
     * @param owner Address to query tokens for
     * @return tokens Array of token IDs owned by the address
     * @notice This function is compatible with your existing frontend code
     */
    function tokensOfOwner(address owner) 
        external 
        view 
        returns (uint256[] memory tokens) 
    {
        uint256 tokenCount = balanceOf(owner);
        tokens = new uint256[](tokenCount);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokens;
    }

    /**
     * @dev Check if address is whitelisted
     * @param user Address to check
     * @return isWhiteListed True if address is whitelisted
     */
    function isWhitelisted(address user) external view returns (bool isWhiteListed) {
        return whitelist[user];
    }

    /**
     * @dev Get comprehensive contract information
     * @return currentSupply Current number of minted tokens
     * @return maxSupply Maximum number of tokens that can be minted
     * @return currentPrice Current mint price in wei
     * @return isMintingActive Whether minting is currently active
     * @return isWhitelistActive Whether whitelist restriction is active
     * @return isPaused Whether contract is currently paused
     * @notice This function is designed to work with your existing useWeb3PortalNFT hook
     */
    function getContractInfo() external view returns (
        uint256 currentSupply,
        uint256 maxSupply,
        uint256 currentPrice,
        bool isMintingActive,
        bool isWhitelistActive,
        bool isPaused
    ) {
        return (
            totalSupply(),
            MAX_SUPPLY,
            mintPrice,
            mintingActive,
            whitelistActive,
            paused()
        );
    }

    // ============ OVERRIDE FUNCTIONS ============
    
    /**
     * @dev Override to ensure tokens can't be transferred when paused
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Override burn function for ERC721URIStorage compatibility
     */
    function _burn(uint256 tokenId) 
        internal 
        override(ERC721, ERC721URIStorage) 
    {
        super._burn(tokenId);
    }

    /**
     * @dev Override tokenURI function for metadata retrieval
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override supportsInterface for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override base URI function
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}