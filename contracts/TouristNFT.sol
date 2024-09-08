// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TouristNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIdCounter;

  mapping(uint256 => string) private _tokenURIs;
  mapping(uint256 => bool) private _activeLocations;
  uint256[] private _locationIds;

  event NFTMinted(uint256 tokenId, address recipient, uint256 timestamp, string tokenURI);
  event LocationAdded(uint256 locationId);

  constructor(uint256[] memory initialLocationIds) ERC721("TouristNFT", "TNFT") {
    for (uint i = 0; i < initialLocationIds.length; i++) {
      _addLocation(initialLocationIds[i]);
    }
  }

  function addLocation(uint256 locationId) public onlyOwner {
    _addLocation(locationId);
  }

  function _addLocation(uint256 locationId) private {
    require(!_activeLocations[locationId], "Location already exists");
    _activeLocations[locationId] = true;
    _locationIds.push(locationId);
    emit LocationAdded(locationId);
  }

  function addLocations(uint256[] memory locationIds) public onlyOwner {
    for (uint i = 0; i < locationIds.length; i++) {
      _addLocation(locationIds[i]);
    }
  }


  function mint(uint256 locationId, string memory _tokenURI) public {
    require(_activeLocations[locationId], "Invalid location");
    
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();

    _safeMint(msg.sender, tokenId);
    _setTokenURI(tokenId, _tokenURI);

    emit NFTMinted(tokenId, msg.sender, block.timestamp, _tokenURI);
  }

  function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
    return super.tokenURI(tokenId);
  }

  function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
    super._burn(tokenId);
  }

  // コントラクトがERC721インターフェイスをサポートしているかを確認する
  function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
    return super.supportsInterface(interfaceId);
  }

  function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override(ERC721, ERC721Enumerable) {
    super._beforeTokenTransfer(from, to, tokenId, batchSize);
  }

  function isActiveLocation(uint256 locationId) public view returns (bool) {
    return _activeLocations[locationId];
  }
}