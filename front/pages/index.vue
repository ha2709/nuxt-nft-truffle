<template>
  <div class='home'>
    <nav class="border-b p-6">
      <p class="text-4xl font-bold">Partnerverse NFT Market</p>
      <div class="flex mt-4"></div>
      <NuxtLink class="link" to="/" >
         Home
      </NuxtLink >
      <NuxtLink class="link" to="/create-item" >
        Sell NFT
      </NuxtLink >
      <NuxtLink class="link" to="/my-asset" >
        My NFT
      </NuxtLink >
      <NuxtLink  class="link" to="/creator-dashboard" >
        Dashboard
      </NuxtLink >
       <button id="connect" class='primaryButton link' @click='connectWallet' >Connect Wallet</button>
    </nav>
   
    <div>
      <h1>Welcome to Home!</h1>
    </div>
    <div class="container movies">
      <div class="movies-grid" style="max-width: 1600px">
        <div v-for="(nft, i) in nfts" :key="i" class="movie">
          <div :key="i" class="movie-img">
            <img :src="`${nft.image}`" width="200px" height="200px" alt="Pic of the author" />
            <div class="p-4">
              <p class="text-2xl font-semibold" style="height: '64px'">
                {{nft.name}}
              </p>
              <div style="height:70px, overflow:hidden">
                <p class="text-gray-400">{{nft.description}}</p>
              </div>
            </div>
            <div class="p-4 bg-black">
              <p class="text-2xl mb-4 font-bold text-white">{{nft.price}} ETH</p>
              <button class="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                     @click="buyNFT(nft, i)"
              >Buy NFT</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import '@/assets/css/main.css'
import { ethers } from 'ethers'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { nftAdress, nftMarketAddress } from '../config'
import NFT from '../build/contracts/NFT.json'
import Market from '../build/contracts/NFTMarket.json'
var  provider, tokenContract, marketContract

export default {
  name: 'IndexPage',

  data () {
    return {
      currentAccount: null,
      contractAddress: 'set this to your contract address, if ss)',
      nfts: []
    }
  },
  async fetch () {
    await this.loadNFTs()
  },
  methods: {
    async loadNFTs () {
       provider = await new ethers.providers.JsonRpcProvider()
       tokenContract = await new ethers.Contract(nftAdress, NFT.abi, provider)
       marketContract = await new ethers.Contract(nftMarketAddress, Market.abi, provider)

      // Return array of unsold market items
      const data = await marketContract.fetchMarketItems()
      // console.log(78, data)
      // console.log(79, await marketContract.fetchItemsCreated())
      const items = await Promise.all(data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        // console.log(81, tokenUri)
        const meta = await axios.get(tokenUri)
        // console.log(82, meta.data.image)
        const price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        const item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description
        }
        return item
      }))
      this.nfts = items
    },
    async buyNFT (nft) {
      // console.log(99,  nft.tokenId, nft.price.toString(), typeof nft.price)
      const web3modal = new Web3Modal()
      const connection = await web3modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      // sign the transaction
      const signer = provider.getSigner()
      const contract = new ethers.Contract(nftMarketAddress, Market.abi, signer)
      // set price
      const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
      // const price = ethers.utils.formatUnits(nft.price.toString(), 'ether')
      const transaction = await contract.createMarketSale(nftAdress, nft.tokenId, {
        value: price
      })
      await transaction.wait()
      this.loadNFTs()
    },
    async connectWallet () {
      // loadNFTs()
      try {
        if (typeof window !== 'undefined') {
          console.log('You are on the browser')
          // ✅ Can use window here
        } else {
          console.log('You are on the server')
          // ⛔️ Don't use window here
        }

        const { ethereum } = window
        if (!ethereum) {
          alert('Get MetaMask!')
          return
        }
        const accounts = await ethereum.request({
          method: 'eth_requestAccounts'
        })

        // eslint-disable-next-line no-console
        console.log('Connected', accounts[0])
        document.getElementById('connect').innerHTML = accounts[0]
        this.currentAccount = accounts[0]
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.link {
  padding: 10px;
  color: #bd0b2a;
}
</style>
