// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarketplace is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct NFT {
        uint256 tokenId;
        address owner;
        uint256 price;
        bool listed;
    }

    mapping(uint256 => NFT) public nftDetails;

  
    constructor() ERC721("NFT Marketplace", "NFTM") Ownable(msg.sender) {}

    function createNFT(string memory tokenURI, uint256 price) public {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        nftDetails[newItemId] = NFT(newItemId, msg.sender, price, true);
    }

    function buyNFT(uint256 tokenId) public payable {
        require(nftDetails[tokenId].listed, "NFT not listed");
        require(msg.value >= nftDetails[tokenId].price, "Not enough ETH");

        address seller = nftDetails[tokenId].owner;
        payable(seller).transfer(msg.value);

        _transfer(seller, msg.sender, tokenId);
        nftDetails[tokenId].owner = msg.sender;
        nftDetails[tokenId].listed = false;
    }

    function listNFT(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        nftDetails[tokenId].listed = true;
        nftDetails[tokenId].price = price;
    }
}
