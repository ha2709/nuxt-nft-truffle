const fs = require('fs');
const NFT = artifacts.require('NFT');
const NFTMarket = artifacts.require('NFTMarket');
// const { deployProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function (deployer, accounts) {

  await deployer.deploy(NFTMarket);
  const nftMarket = await NFTMarket.deployed()
  const marketAddress = nftMarket.address


   await deployer.deploy(NFT, marketAddress);
   const nft = await NFT.deployed()
   console.log(nft.address, 'NFT -  market address ', marketAddress)
   let config = `
   export const nftMarketAddress = '${marketAddress}'
   export const nftAdress = '${nft.address}'
   `
   
   let data = JSON.stringify(config)
   fs.writeFileSync('./front/config.js', JSON.parse(data))
   

};
