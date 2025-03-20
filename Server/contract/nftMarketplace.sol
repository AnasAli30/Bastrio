// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// NFT Collection Contract
contract NFTCollection is ERC721URIStorage, Ownable {
    uint256 public maxSupply;
    uint256 public totalMinted;
    uint256 public mintPrice;
    uint256 public maxMintPerWallet;
    string public baseURI;
    mapping(address => uint256) public mintedPerWallet;
    address public marketplace;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI_,
        uint256 _maxSupply,
        uint256 _mintPrice,
        uint256 _maxMintPerWallet,
        address creator,
        address _marketplace
    ) ERC721(name, symbol) Ownable(creator) { 
        maxSupply = _maxSupply;
        baseURI = baseURI_;
        mintPrice = _mintPrice;
        maxMintPerWallet = _maxMintPerWallet;
        marketplace = _marketplace;
    }

    modifier onlyMarketplace() {
        require(msg.sender == marketplace, "Only marketplace can mint");
        _;
    }

    function mint(address to, uint256 quantity) external payable onlyMarketplace {
        require(totalMinted + quantity <= maxSupply, "Exceeds max supply");
        require(mintedPerWallet[to] + quantity <= maxMintPerWallet, "Exceeds per-wallet limit");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = totalMinted + 1;
            _mint(to, tokenId);
            _setTokenURI(tokenId, string(abi.encodePacked(baseURI, Strings.toString(tokenId))));
            totalMinted++;
            mintedPerWallet[to]++;
        }
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
}

// Marketplace Contract
contract NFTMarketplace  {
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
    }

    mapping(address => mapping(uint256 => Listing)) public listings;
    mapping(address => uint256[]) public contractNFTs;
    address[] public collections;  // Stores all deployed NFT collections

    event NFTListed(address seller, address nftContract, uint256 tokenId, uint256 price);
    event NFTBought(address buyer, address seller, address nftContract, uint256 tokenId, uint256 price);
    event CollectionCreated(address indexed collectionAddress, string name, string symbol, address creator);

    function createCollection(
        string memory name,
        string memory symbol,
        string memory baseURI_,
        uint256 _maxSupply,
        uint256 _mintPrice,
        uint256 _maxMintPerWallet
    ) external {
        // Deploy a new NFTCollection contract dynamically
        NFTCollection newCollection = new NFTCollection(
            name,
            symbol,
            baseURI_,
            _maxSupply,
            _mintPrice,
            _maxMintPerWallet,
            msg.sender, // Creator
            address(this) // Marketplace as minter
        );

        collections.push(address(newCollection)); // Store collection address
        emit CollectionCreated(address(newCollection), name, symbol, msg.sender);
    }

    function mintNFT(address nftContract, uint256 quantity) external payable {
        NFTCollection collection = NFTCollection(nftContract);
        require(msg.value >= collection.mintPrice() * quantity, "Insufficient payment");
        require(collection.mintedPerWallet(msg.sender) + quantity <= collection.maxMintPerWallet(), "Exceeds per-wallet limit");

        collection.mint{value: msg.value}(msg.sender, quantity);
        for (uint256 i = 0; i < quantity; i++) {
            contractNFTs[nftContract].push(collection.totalMinted());
        }
    }

    function listNFT(address nftContract, uint256 tokenId, uint256 price) external {
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        listings[nftContract][tokenId] = Listing(msg.sender, nftContract, tokenId, price);
        emit NFTListed(msg.sender, nftContract, tokenId, price);
    }

    function buyNFT(address nftContract, uint256 tokenId) external payable {
        Listing memory listing = listings[nftContract][tokenId];
        require(msg.value >= listing.price, "Insufficient funds");

        payable(listing.seller).transfer(msg.value);
        IERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId);
        delete listings[nftContract][tokenId];

        emit NFTBought(msg.sender, listing.seller, nftContract, tokenId, msg.value);
    }

    function getNFTsByContract(address nftContract) external view returns (
        uint256[] memory tokenIds, 
        bool[] memory listedStatus, 
        string memory baseURI, 
        uint256 totalSupply, 
        uint256 maxMintPerWallet
    ) {
        NFTCollection collection = NFTCollection(nftContract);
        tokenIds = contractNFTs[nftContract];
        listedStatus = new bool[](tokenIds.length);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            listedStatus[i] = listings[nftContract][tokenIds[i]].seller != address(0);
        }

        return (
            tokenIds,
            listedStatus,
            collection.baseURI(),
            collection.maxSupply(),
            collection.maxMintPerWallet()
        );
    }
// Define a struct to hold collection details
struct CollectionData {
    address contractAddress;
    string name;
    uint256 maxSupply;
    uint256 mintPrice;
    string baseURI;
    uint256 totalMinted;
    uint256[] tokenIds;
}

function getCollections() external view returns (CollectionData[] memory) {
    uint256 collectionCount = collections.length;
    CollectionData[] memory allCollections = new CollectionData[](collectionCount);

    for (uint256 i = 0; i < collectionCount; i++) {
        NFTCollection collection = NFTCollection(collections[i]);

        // Populate struct for each collection
        allCollections[i] = CollectionData({
            contractAddress: collections[i],
            name: collection.name(),
            maxSupply: collection.maxSupply(),
            mintPrice: collection.mintPrice(),
            baseURI: collection.baseURI(),
            totalMinted: collection.totalMinted(),
            tokenIds: contractNFTs[collections[i]]
        });
    }

    return allCollections;
}


}
