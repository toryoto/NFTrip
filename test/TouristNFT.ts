const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("TouristNFT", function () {
  async function deployTouristNFTFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const TouristNFT = await ethers.getContractFactory("TouristNFT");
    const touristNFT = await TouristNFT.deploy();
    await touristNFT.waitForDeployment();

    return { touristNFT, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { touristNFT, owner } = await loadFixture(deployTouristNFTFixture);
      expect(await touristNFT.owner()).to.equal(owner.address);
    });

    it("Should have the correct name and symbol", async function () {
      const { touristNFT } = await loadFixture(deployTouristNFTFixture);
      expect(await touristNFT.name()).to.equal("TouristNFT");
      expect(await touristNFT.symbol()).to.equal("TNFT");
    });
  });

  describe("Location Management", function () {
    it("Should allow owner to add a new location", async function () {
      const { touristNFT, owner, addr1, addr2 } = await loadFixture(deployTouristNFTFixture);
      await expect(touristNFT.connect(owner).addLocation(1, 2))
        .to.emit(touristNFT, "LocationAdded")
        .withArgs(1, 2);

      await touristNFT.connect(owner).mint(1, "ipfs://example1");
      await touristNFT.connect(addr1).mint(1, "ipfs://example2");

      await expect(touristNFT.connect(addr2).mint(1, "ipfs://exampleLimit"))
        .to.be.revertedWith("Daily mint limit reached for this location");
    });

    it("Should not allow non-owner to add a new location", async function () {
      const { touristNFT, addr1 } = await loadFixture(deployTouristNFTFixture);
      const locationId = 1;
      const dailyMintLimit = 10;

      await expect(touristNFT.connect(addr1).addLocation(locationId, dailyMintLimit))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow adding a location that already exists", async function () {
      const { touristNFT, owner } = await loadFixture(deployTouristNFTFixture);
      const locationId = 1;
      const dailyMintLimit = 10;

      await touristNFT.connect(owner).addLocation(locationId, dailyMintLimit);

      await expect(touristNFT.connect(owner).addLocation(locationId, dailyMintLimit))
        .to.be.revertedWith("Location already exists");
    });
  });

  describe("Minting", function () {
    it("Should allow minting an NFT for an existing location", async function () {
      const { touristNFT, owner, addr1 } = await loadFixture(deployTouristNFTFixture);
      const locationId = 1;
      const dailyMintLimit = 10;
      const tokenURI = "ipfs://example";

      await touristNFT.connect(owner).addLocation(locationId, dailyMintLimit);

      await touristNFT.connect(addr1).mint(1, tokenURI);
      
      const tokenId = await touristNFT.tokenOfOwnerByIndex(addr1.address, 0);

      expect(await touristNFT.ownerOf(tokenId)).to.equal(addr1.address);
      expect(await touristNFT.tokenURI(tokenId)).to.equal(tokenURI);
    });

    it("Should not allow minting for a non-existent location", async function () {
      const { touristNFT, addr1 } = await loadFixture(deployTouristNFTFixture);
      const locationId = 1;
      const tokenURI = "ipfs://example";

      await expect(touristNFT.connect(addr1).mint(locationId, tokenURI))
        .to.be.revertedWith("Location does not exist");
    });

    it("Should not allow minting more than the daily limit", async function () {
      const { touristNFT, owner, addr1, addr2 } = await loadFixture(deployTouristNFTFixture);
      const locationId = 1;
      const dailyMintLimit = 2;
      const tokenURI = "ipfs://example";

      await touristNFT.connect(owner).addLocation(locationId, dailyMintLimit);

      await touristNFT.connect(addr1).mint(locationId, tokenURI);
      await touristNFT.connect(addr2).mint(locationId, tokenURI);

      await expect(touristNFT.connect(owner).mint(locationId, tokenURI))
        .to.be.revertedWith("Daily mint limit reached for this location");
    });

    it("Should not allow minting more than once per day per user", async function () {
      const { touristNFT, owner, addr1 } = await loadFixture(deployTouristNFTFixture);
      const locationId = 1;
      const dailyMintLimit = 10;
      const tokenURI = "ipfs://example";

      await touristNFT.connect(owner).addLocation(locationId, dailyMintLimit);

      await touristNFT.connect(addr1).mint(locationId, tokenURI);

      await expect(touristNFT.connect(addr1).mint(locationId, tokenURI))
        .to.be.revertedWith("User has already minted for this location today");
    });
  });

  describe("Daily Mint Count", function () {
    it("Should correctly track and return daily mint count", async function () {
      const { touristNFT, owner, addr1, addr2 } = await loadFixture(deployTouristNFTFixture);
      const locationId = 1;
      const dailyMintLimit = 10;
      const tokenURI = "ipfs://example";

      await touristNFT.connect(owner).addLocation(locationId, dailyMintLimit);

      await touristNFT.connect(addr1).mint(locationId, tokenURI);
      await touristNFT.connect(addr2).mint(locationId, tokenURI);

      expect(await touristNFT.getDailyMintCount(locationId)).to.equal(2);
    });
  });
});