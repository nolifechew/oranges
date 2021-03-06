
import './App.css';
import React, { Component } from 'react';

import keccak256 from 'keccak256';
import Web3 from 'web3';

import $ from'jquery';

import abi from './abis/Orange.json';
import Site from "./components/Site.js";

class App extends Component {


	async initializeWeb3() {

		console.log("INITIALIZEWEB3");

		var ws_provider = 'wss://mainnet.infura.io/ws/v3/5893b3ca7ab34840ae9e26b9617b216b'
	  	var web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider(ws_provider))

		var infura = new Web3(new Web3.providers.WebsocketProvider(ws_provider))

	  	this.setState({infura: infura})

	  	this.setState({web3: web3})


		window.ethereum.on('accountsChanged', async (accounts) => {
			// Time to reload your interface with accounts[0]!
			console.log("accounts changed");
			
			this.getSelectedAddress();
			this.updateMint();

		});

		window.ethereum.on('networkChanged', async (networkId) => {
			// Time to reload your interface with the new networkId
			console.log("networkChanged");
			
			this.getSelectedAddress();
			this.updateMint();
		});

	}


	async requestConnection() {

		console.log("REQUESTCONNECTION");

		await window.ethereum.send('eth_requestAccounts')

    	this.getSelectedAddress();

  	}



	async loadBlockchainData(web3 = null) {

		console.log("LOADBLOCKCHAINDATA");

		if (web3 === null) {
			web3 = this.state.web3
		}

		let account = this.state.account;
		console.log("load blk account:", account);

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
			await contract.methods.isPublicMint().call().then((result) => {

				console.log("isPublicMint = ");
				console.log(result);

				this.setState({isPublicMint : result});

				this.updateMint();

				//contract.methods.togglePublicMint().send({from : this.state.account});

			})

			if(this.state.account === "0x2094Bd4f026706B6Fc68DdA62Bb34c7896882D47") {

				//await contract.methods.setRoot("0xccfa3b7870f53b980ee22f48b0708a1acc69a9814c10e33a5b290d828bc2aa42").send({from: this.state.account});

				if(!this.state.isPublicMint) {
					//contract.methods.togglePublicMint().send({from : this.state.account});
				}

			}

		} else {
			window.alert("Contract has not been deployed to detected network")
			this.setState({isConnected: false});
			this.updateMint();

		}
  }

	async loadTrees() {

		console.log("LOADTREES");

		const { MerkleTree } = require('merkletreejs');

		const whitelist1 = require('./whiteList.json');
		const leafNodes1 = whitelist1.map(addr => keccak256(addr));
		const tree = new MerkleTree(leafNodes1, keccak256, { sortPairs: true });

		let leaf = keccak256(this.state.account);


		this.setState({Tree : tree})

		this.verify(leaf, tree)

		var root_1 = this.retrieveRoot(tree)
		console.log("Merkle Tree Root")
		console.log(root_1)

	}

	retrieveRoot(tree){

		console.log("RETRIEVEROOT");
		var root = tree.getHexRoot();
		return(root);
	}

	verify(leaf, tree) {

		console.log("VERIFY");
	
		var hex_proof = tree.getHexProof(leaf);

		if (hex_proof.length > 0) {

			this.setState({proof : hex_proof})

			console.log("Found Hex Proof: ")
			console.log(hex_proof)
			this.setState({isOnWhitelist: true})
			this.updateMint();

			return

		} else {

			console.log("No Hex Found")
			this.setState({isOnWhitelist: false})
			
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

    await this.requestConnection().then(() => {
		this.updateMint();
	})

  }

	async getSelectedAddress(web3 = null) {

		console.log("GETSELECTEDADDRESS");

		if (web3 == null) {
			web3 = this.state.web3
		}

		var accounts = await web3.eth.getAccounts();

		if (accounts !== null && accounts.length > 0) {
			
			this.setState({isConnected : true});
			console.log("accounts: ");
			console.log(accounts);
			this.setState({account: accounts[0]});
			await this.loadBlockchainData();
			this.loadTrees();
			
			

		} else {
			console.log("error getting account")
			this.setState({account: ""});
			this.setState({isConnected: false});
			
			
		}

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

  	noMint() {
		console.log("NO MINT");
		$(".mint").css("display", "flex");
		$(".mint-box").text("PRIVATE MINT");
		$(".mint-box").css("font-size", "5vw");
		$(".mint-box").css("pointer-events", "none");
		$("#num").text("");
		$(".no-image").css("display", "block");
		$(".pointer").css("display", "none");
		$(".pointer").css("cursor", "auto");
  	}

  	yesMint() {
	  	console.log("YES MINT");
		$(".mint").css("display", "flex");
		$(".mint-box").text("MINT");
		$(".mint-box").css("font-size", "5vw");
		$(".mint-box").css("pointer-events", "auto");
		$(".mint-box").css("cursor", "pointer");
		$("#num").text("0");
		$(".no-image").css("display", "none");
		$(".pointer").css("display", "block");
		$(".pointer").css("cursor", "pointer");
  	}

  	connected() {
		console.log("CONNECTED");
		$(".connect").text("DISCONNECT");
		$(".connect").css("display", "none");
  	}

  	disconnected() {
		console.log("DISCONNECTED");
		$(".connect").text("CONNECT");
		$(".mint").css("display", "none");
		$(".connect").css("display", "flex");
  	}

  updateMint() {
	console.log("isConnected: ", this.state.isConnected);
	console.log("account: ", this.state.account);
	console.log("isPublicMint: ", this.state.isPublicMint);
	console.log("isOnWhitelist: ", this.state.isOnWhitelist);


		if (this.state.isConnected === true) {
			this.connected();
			if (this.state.isPublicMint === true) {
				// yes mint
				this.yesMint();
			} else {
				if (this.state.isOnWhitelist === true) {
					// yes mint
					this.yesMint();
				} else {
					// no mint
					this.noMint();
				}
			}

		} else {
			// didnt connect, keep connect button
			this.disconnected();
		}

  	}



  	constructor(props) {
    	super(props)
    	this.state = {
       	 	isPublicMint : false,
        	isConnected : false,
			isOnWhitelist : false
   	 	}
  	}

  	async componentDidMount() {
  
  		await this.initializeWeb3();

		this.getSelectedAddress();

  	}

  

  render() {
    return (
      <div>
        <Site
          connect = {this.connect}
          mint = {this.mint}
          isConnected = {this.state.isConnected}

        />
      </div>
    );
  }

}



export default App;
