// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TouristNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIdCounter;

  struct Location {
    uint256 dailyMintLimit;
    mapping(uint256 => uint256) dailyMintCount;
    mapping(address => uint256) lastMintDate;
  }

  mapping(uint256 => Location) public locations;
  mapping(uint256 => string) private _tokenURIs;

  event NFTMinted(uint256 tokenId, uint256 locationId, address recipient, uint256 timestamp, string tokenURI);
  event LocationAdded(uint256 locationId, uint256 dailyMintLimit);

  constructor() ERC721("TouristNFT", "TNFT") {}

  function addLocation(uint256 locationId, uint256 dailyMintLimit) public onlyOwner {
    require(locations[locationId].dailyMintLimit == 0, "Location already exists");
    locations[locationId].dailyMintLimit = dailyMintLimit;
    emit LocationAdded(locationId, dailyMintLimit);
  }

  function mint(uint256 locationId, string memory _tokenURI) public {
    require(locations[locationId].dailyMintLimit > 0, "Location does not exist");
    require(checkDailyLimit(locationId), "Daily mint limit reached for this location");
    require(checkUserDailyLimit(locationId, msg.sender), "User has already minted for this location today");

    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();

    _safeMint(msg.sender, tokenId);
    // 各トークンにNFTメタデータを設定する
    _setTokenURI(tokenId, _tokenURI);

    uint256 currentDate = block.timestamp / 86400; // Convert to days
    locations[locationId].dailyMintCount[currentDate]++;
    locations[locationId].lastMintDate[msg.sender] = currentDate;

    emit NFTMinted(tokenId, locationId, msg.sender, block.timestamp, _tokenURI);
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

  function checkDailyLimit(uint256 locationId) internal view returns (bool) {
    uint256 currentDate = block.timestamp / 86400; // Convert to days
    return locations[locationId].dailyMintCount[currentDate] < locations[locationId].dailyMintLimit;
  }

  function checkUserDailyLimit(uint256 locationId, address user) internal view returns (bool) {
    uint256 currentDate = block.timestamp / 86400; // Convert to days
    return locations[locationId].lastMintDate[user] != currentDate;
  }

  function getDailyMintCount(uint256 locationId) public view returns (uint256) {
    uint256 currentDate = block.timestamp / 86400; // Convert to days
    return locations[locationId].dailyMintCount[currentDate];
  }
}