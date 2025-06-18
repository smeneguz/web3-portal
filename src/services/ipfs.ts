interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

class IPFSService {
  private pinataApiKey: string;
  private pinataSecretKey: string;

  constructor() {
    this.pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
    this.pinataSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '';
  }

  /**
   * Upload metadata to IPFS using Pinata
   */
  async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    try {
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        throw new Error('Pinata API credentials not configured');
      }

      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `${metadata.name} Metadata`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to upload to Pinata: ${response.statusText}`);
      }

      const result = await response.json();
      return result.IpfsHash;
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload image to IPFS using Pinata
   */
  async uploadImage(file: File | Blob): Promise<string> {
    try {
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        throw new Error('Pinata API credentials not configured');
      }

      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload image to Pinata: ${response.statusText}`);
      }

      const result = await response.json();
      return result.IpfsHash;
    } catch (error) {
      console.error('Error uploading image to IPFS:', error);
      throw error;
    }
  }

  /**
   * Create complete NFT metadata with image
   */
  async createNFTMetadata(
    name: string,
    description: string,
    imageFile?: File,
    attributes: Array<{ trait_type: string; value: string | number }> = []
  ): Promise<string> {
    try {
      let imageUrl = '';
      
      if (imageFile) {
        const imageHash = await this.uploadImage(imageFile);
        imageUrl = `https://ipfs.io/ipfs/${imageHash}`;
      }

      const metadata: NFTMetadata = {
        name,
        description,
        image: imageUrl,
        attributes,
      };

      const metadataHash = await this.uploadMetadata(metadata);
      return metadataHash;
    } catch (error) {
      console.error('Error creating NFT metadata:', error);
      throw error;
    }
  }

  /**
   * Generate collection metadata for batch upload
   */
  async generateCollectionMetadata(
    collectionSize: number,
    baseDescription: string = "Web3Portal NFT Collection"
  ): Promise<string[]> {
    const metadataHashes: string[] = [];
    
    for (let i = 1; i <= collectionSize; i++) {
      const metadata: NFTMetadata = {
        name: `Web3Portal NFT #${i}`,
        description: `${baseDescription} - Token #${i}`,
        image: `https://ipfs.io/ipfs/collection/${i}.png`,
        attributes: [
          {
            trait_type: "Collection",
            value: "Web3Portal Genesis"
          },
          {
            trait_type: "Token Number",
            value: i
          },
          {
            trait_type: "Rarity",
            value: this.getRarityForToken(i)
          }
        ]
      };

      try {
        const hash = await this.uploadMetadata(metadata);
        metadataHashes.push(hash);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to upload metadata for token ${i}:`, error);
        throw error;
      }
    }

    return metadataHashes;
  }

  private getRarityForToken(tokenId: number): string {
    if (tokenId <= 100) return "Legendary";
    if (tokenId <= 500) return "Epic";
    if (tokenId <= 2000) return "Rare";
    return "Common";
  }

  /**
   * Fetch metadata from IPFS
   */
  async fetchMetadata(hash: string): Promise<NFTMetadata | null> {
    try {
      const url = `https://ipfs.io/ipfs/${hash}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching metadata from IPFS:', error);
      return null;
    }
  }
}

export const ipfsService = new IPFSService();
export type { NFTMetadata };