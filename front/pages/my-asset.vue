<template>
    <div class="home">
       <button id="connect" class='primaryButton' @click='connectWallet'>Connect Wallet</button>
      <div v-if="loadingState === 'loaded' || !nfts.length"    class="">
          <h1 className="py-10 px-20 text-3xl">No assets owned</h1>
      </div>
      <div v-else class="container movies">
          <div class="movies-grid" style="max-width: 1600px">
            <div v-for="(nft, i) in nfts" :key="i" class="movie">
              <div :key="i" class="movie-img">
                <img :src="`${nft.image}`" width="200px" height="200px" alt="Pic of the author" />
                <div class="p-4 bg-black">
                  <p class="text-2xl mb-4 font-bold text-white">{{nft.name}} </p>
        
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
export default {
  name: 'MyAssetPage',
  data () {
    return {
 
      contractAddress: 'set this to your contract address, if ss)',
      nfts: [],
      loadingState: 'not-loaded'

    }
  },
  async fetch () {
      await this.loadNFTs()
  },
   fetchDelay:1000,
  methods: {
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
        const provider = await new ethers.providers.JsonRpcProvider()
        const signer = provider.getSigner()

        const marketContract = new ethers.Contract(nftMarketAddress, Market.abi, signer)
        const tokenContract = new ethers.Contract(nftAdress, NFT.abi, provider)
        // Return array of unsold market items

        const data = await marketContract.fetchMyNFTs()
        // console.log(63, data )
        let item = {}
        // let items =[]
        const items = await Promise.all(data.map(async i => {
          const tokenUri = await tokenContract.tokenURI(i.tokenId)
          const meta = await axios.get(tokenUri)
          let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.data.image,
          }
          return item
        }))
        // console.log(87, items)
        this.nfts = items
        this.loadingSate = 'loaded'
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error)
        }
      },
    async loadNFTs () {
      this.connectWallet()
    },
  }
}
</script>

<style lang="scss" scoped>
.home {
  .loading {
    padding-top: 120px;
    align-items: flex-start;
  }

  .search {
    display: flex;
    padding: 32px 16px;

    input {
      max-width: 350px;
      width: 100%;
      padding: 12px 6px;
      font-size: 14px;
      border: none;

      &:focus {
        outline: none;
      }
    }

    .button {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }

  .movies {
    padding: 32px 16px;
    .movies-grid {
      display: grid;
      column-gap: 32px;
      row-gap: 64px;
      grid-template-columns: 1fr;
      @media (min-width: 500px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (min-width: 750px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (min-width: 1100px) {
        grid-template-columns: repeat(4, 1fr);
      }

      .movie {
        position: relative;
        display: flex;
        flex-direction: column;

        .movie-img {
          position: relative;
          overflow: hidden;

          &:hover {
            .overview {
              transform: translateY(0);
            }
          }

          img {
            display: block;
            width: 100%;
            height: 100%;
          }

          .review {
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 40px;
            height: 40px;
            background-color: #c92502;
            color: #fff;
            border-radius: 0 0 16px 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .overview {
            line-height: 1.5;
            position: absolute;
            bottom: 0;
            background-color: rgba(201, 38, 2, 0.9);
            padding: 12px;
            color: #fff;
            transform: translateY(100%);
            transition: 0.3s ease-in-out all;
          }
        }

        .info {
          margin-top: auto;
          .title {
            margin-top: 8px;
            color: #fff;
            font-size: 20px;
          }

          .release {
            margin-top: 8px;
            color: #c9c9c9;
          }

          .button {
            margin-top: 8px;
          }
        }
      }
    }
  }
}
</style>
