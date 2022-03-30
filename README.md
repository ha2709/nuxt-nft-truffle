# nuxt-nft-truffle
Project for NFT marketplace with Nuxt, using Truffle

Using Ganache on local:
https://trufflesuite.com/ganache/index.html

After starting Ganache. 

In terminal 
```shell
npm install
npm install ethers web3modal 
truffle migrate --reset --compile-all --network development
cd front
npm install
npm run dev

```
In Ganache, add `Private Key` to `MetaMask Account` to `Import Account`
