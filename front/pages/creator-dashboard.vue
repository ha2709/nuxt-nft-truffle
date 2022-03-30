<template>
   <div class="home">
      <div v-if="loadingState === 'loaded' || !nfts.length"    class="">
          <h1 className="py-10 px-20 text-3xl">No assets owned</h1>
      </div>
      <div v-else class="container movies">
          <div class="movies-grid" style="max-width: 1600px">
            <div v-for="(nft, i) in nfts" :key="i" class="movie">
              <div :key="i" class="movie-img">
                <img :src="`${nft.image}`" width="200px" height="200px" alt="Pic of the author" />
                <div class="p-4 bg-black">
                  <p class="text-2xl mb-4 font-bold text-white">{{nft.price}} ETH</p>
        
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

</template>

<script>
import { nftAdress, nftMarketAddress } from '../config'
import '@/assets/css/main.css'
import { ethers } from 'ethers'
import NFT from '../build/contracts/NFT.json'
import Market from '../build/contracts/NFTMarket.json'
import { EtherscanProvider } from '@ethersproject/providers'
import axios from 'axios';
import Web3Modal from 'web3modal'
var item = {}   
export default {
  name: 'CreatorDashBoardPage',
  data () {
    return {
      currentAccount: null,
      contractAddress: 'set this to your contract address, if ss)',
      nfts: [],
      loadingState: 'not-loaded'

    }
  },
  async fetch () {
      await this.loadNFTs()
  },
  methods: {
    async loadNFTs () {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      // const provider = await new ethers.providers.JsonRpcProvider()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const account  = await signer.getAddress()

      const marketContract = new ethers.Contract(nftMarketAddress, Market.abi, provider)
      const tokenContract = new ethers.Contract(nftAdress, NFT.abi, provider)
      // Return array of unsold market items
      const data = await marketContract.fetchItemsCreated()

      console.log(63,data)

      const items = await Promise.all(data.map(async i => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          image: meta.data.image,
        }
        return item
      }))
        console.log(88, items)
        this.nfts = items
        this.loadingSate = 'loaded'
    },
  }
}
</script>