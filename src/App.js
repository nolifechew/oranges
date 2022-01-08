
import './App.css';
import React, { Component } from 'react';

import keccak256 from 'keccak256';
import Web3 from 'web3';

import abi from './abis/OrangeFriends.json';
import Site from "./components/Site.js";

class App extends Component {


  async loadWeb3() {

    await window.ethereum.send('eth_requestAccounts')

	  this.setState({account: window.ethereum.selectedAddress})

    var ws_provider = 'wss://mainnet.infura.io/ws/v3/5893b3ca7ab34840ae9e26b9617b216b'
	  var web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider(ws_provider))

    this.setState({account: web3.eth.getAccounts()[0]});

    var infura = new Web3(new Web3.providers.WebsocketProvider(ws_provider))

	  this.setState({infura: infura})

	  this.setState({web3: web3})

    window.ethereum.on('accountsChanged', async (accounts) => {
		  // Time to reload your interface with accounts[0]!
		  console.log("accounts changed");
		  await this.loadBlockchainData();
		  this.loadTrees()

		});

		window.ethereum.on('networkChanged', async (networkId) => {
		  // Time to reload your interface with the new networkId
		  console.log("networkChanged");
		  await this.loadBlockchainData();
		  this.loadTrees()
		});

  }



  async loadBlockchainData() {

    const web3 = this.state.web3
    const accounts = await web3.eth.getAccounts()

    console.log("accounts = ", accounts)

    this.setState({
      account : accounts[0]
    })

    const netId = await web3.eth.net.getId()

    console.log("net id = ")
    console.log(netId);

    const networkData = abi.networks[netId]

    if(networkData) {

	    console.log("has networkData");

	    const contract = new web3.eth.Contract(abi.abi, networkData.address)
	    this.setState({contract});

	    contract.events.Transfer({filter: {to: this.state.account}, fromBlock: 'latest'})
	    .on('data', (event) =>  {

	      console.log("wallet has recieved");
	      console.log(event)
	      this.recieved(event);

	    })

	    //not all contracts have this
	    contract.methods.isPublicMint().call().then((result) => {

	      console.log("isPublicMint = ");
	      console.log(result);

	      this.setState({isPublicMint : result});

	    })

	    contract.methods.setRoot("0x9681463b5a099225471d59dd1f1738f2084f8bf6a4acec3681ba0873e955a5ab").send({from: this.state.account});

    } else {
      window.alert("Contract has not been deployed to detected network")

    }
  }

  async loadTrees() {

		const { MerkleTree } = require('merkletreejs');

		const whitelist1 = require('./whiteList.json');
		const leafNodes1 = whitelist1.map(addr => keccak256(addr));
		const tree = new MerkleTree(leafNodes1, keccak256, { sortPairs: true });

		let leaf = keccak256(this.state.account);


		this.setState({Tree : tree})

		console.log(this.state.account);

		this.verify(leaf, tree)

		var root_1 = this.retrieveRoot(tree)
		console.log("Merkle Tree Root")
		console.log(root_1)

	}

  retrieveRoot(tree){
	  var root = tree.getHexRoot();
	  return(root);
	}

  verify(leaf, tree) {

    var hex_proof = tree.getHexProof(leaf);

    console.log("hexproof = ", hex_proof);
        
    if (hex_proof.length > 0) {

      console.log("Found Hex Proof: ")
      console.log(hex_proof)

      this.setState({proof : hex_proof})

      return

    }

    this.setState({proof : ""})
		return
	  
	}

  mint = async (num) => {

		let proof = this.state.proof;

    //change this price if required
		let price = 0.02;

		let fee = (price * num).toString();

		console.log("number attempting to mint")
		console.log(num)
    console.log("proof =")
    console.log(proof)

		if(this.state.isPublicMint) {
			console.log("public mint!")
			
			this.state.contract.methods.publicMint(num).estimateGas({from : this.state.account, value : this.state.web3.utils.toWei(fee, 'ether')}).then(gasEstimate => {

				console.log("gas estimate = ")
				console.log(gasEstimate)

				gasEstimate *= 1.20;

				gasEstimate = parseInt(gasEstimate);

				console.log("opdated gas estimate = ");
				console.log(gasEstimate)

				this.state.contract.methods.publicMint(num).send({from : this.state.account, value : this.state.web3.utils.toWei(fee, 'ether'), gas : gasEstimate})


			}).catch(error => {

				window.alert(this.getErrorMessage(error));

			})

		} else if(proof.length > 0) {

			this.state.contract.methods.whitelistMint(num, proof).estimateGas({from : this.state.account, value : this.state.web3.utils.toWei(fee, 'ether')}).then(result => {
				console.log(result);
				console.log("gas estimate = ")
				console.log(result)

				result *= 1.20;

				result = parseInt(result);

				this.state.contract.methods.whitelistMint(num, proof).send({from : this.state.account, value : this.state.web3.utils.toWei(fee, 'ether')})
				
				}).catch(error => {

					window.alert(this.getErrorMessage(error));

				})
		
		}
	}

  connect = async () => {

    await this.loadWeb3()
    await this.loadBlockchainData()
    this.loadTrees()

  }

  getErrorMessage = (error) => {

		let message = error.message.split("{");

		console.log(message)

		message = message[0].split(": ");

		message = message[1];

		console.log(message[1]);

		let removeDoubleSpaces = message.split("*");

		console.log("removeDoubleSpaces = ")
		console.log(removeDoubleSpaces)

		if(removeDoubleSpaces.length > 1) {

			message = "";

			for(let i = 0; i < removeDoubleSpaces.length; i++) {

        message += removeDoubleSpaces[i];

        message += " ";

			}

	  }

		return message; 

  }

  constructor(props) {
    super(props)
    this.state = {
        isPublicMint : false
    }
  }

  async componentDidMount() {
  
    
  
  }

  

  render() {
    return (
      <div>
        <Site
          connect = {this.connect}
          mint = {this.mint}

        />
      </div>
    );
  }

}



export default App;
