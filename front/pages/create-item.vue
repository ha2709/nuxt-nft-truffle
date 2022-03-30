<template>
  <div class=" flex justify-center">
    <div>
        <div>
            <input
                v-model.lazy="name"
                type="text" 
                placeholder="Asset Name"
                class="mt-8 border rounded p-4"
            >
        </div>
        <div>
            <textarea 
            placeholder="Asset description"
            v-model="description"
            class="mt-2 border rounded p-4"/>
        </div>
        <div>
        <input
            v-model.lazy="price"
            type="text" 
            placeholder="Asset Price"
            class="mt-8 border rounded p-4"
        />
        </div>
        <div>
            <input
                type="file" 
                placeholder="Asset"
                class="my-4"
                @change="onChange"
            />
        </div>

      <button
         @click="createItem"
        class="font-bold mt-4 bg-pink-200 text-black rounded p-4 shadow-lg"
      >Create NFT</button>
      <div>
        <img v-if="this.fileUrl"
            :src="`${this.fileUrl}`"
            alt="Picture of the author"
            class="rounded mt-4"
            width='350'
            height='500'
       
    />
      </div>
    </div>
</div>
</template>

<script>
import { create as ipfsHttpClient } from 'ipfs-http-client'
import '@/assets/css/main.css'
import { nftAdress, nftMarketAddress } from '../config'
import NFT from '../build/contracts/NFT.json'
import Market from '../build/contracts/NFTMarket.json'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

export default {
  data () {
    return {
      fileUrl: '',
      name: '',
      description: '',
      price:''
    }
  },
  methods: {
    async onChange (e) {
      
      const file = e.target.files[0]
    //   console.log(file)
      try {
        const added = await client.add(
          file,
          { 
            progress: (prog) => {console.log(`recived: ${prog}`)}
          } 
        )
        const url = `https://ipfs.infura.io/ipfs/${added.path}`

        this.fileUrl = url
        // console.log(76, this.fileUrl)
      } catch (e) {
        console.log(e)
        throw e
      }
    },
    async createItem () {
        
      const data = JSON.stringify({
        'name': this.name, 
        'description': this.description, 
        image: this.fileUrl
      })
      // console.log(91, data, this.name)
      // eslint-disable-next-line no-empty
      try {
        const added = await client.add(data)
        const url = `https://ipfs.infura.io/ipfs/${added.path}`
        // pass the url to save it on after it has hbeen uploaded to IPFS
        this.createSale(url)
      } catch (error) {
        console.log('Error uploading file:', error)
      }
    },
    async createSale (url) {
        
      const web3modal = new Web3Modal()
      const connection = await new web3modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      // sign the transaction
      const signer = provider.getSigner()
      const contract = new ethers.Contract(nftAdress, NFT.abi, signer)
      // console.log(121, url)
      let transaction = await new contract.createToken(url)
      // console.log(122, transaction, url)
      let tx = await transaction.wait()
      console.log('Transaction: ', tx)
      console.log('Transaction events: ', tx.events[0])
    //   get the tokenId from the transaction that occured above
      let event = tx.events[0]
      let value = event.args[2]
      let tokenId = value.toNumber()
    //   get a reference to the price 
      let _price = ethers.utils.parseUnits(this.price.toString(), 'ether')
      // eslint-disable-next-line no-const-assign
      const contractMarket = new ethers.Contract(nftMarketAddress, Market.abi, signer);
        // console.log(135, _price)
    //   get listing price
      let listingPrice = await contractMarket.getListingPrice()
      listingPrice = listingPrice.toString()

      transaction = await contractMarket.createMarketItem(
        nftAdress, tokenId, _price, { value: listingPrice }
      )
      await transaction.wait()
      // console.log(144, transaction)
      // router.push('/')
      this.$router.push('/')
    }
  }
}
</script>

