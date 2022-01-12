import React, { Component } from 'react';

import no from "../images/no.png";

import logo from "../images/logo.png";
import opensea from "../images/opensea.png";
import twitter from "../images/twitter.png";

class Site extends Component {

	render() {

		return(

<div>

	{/* HEADER	----------------------------------------------------------------------------------------------------- */}
	<header>

		{/* BUTTONS THAT SCROLL TO SECTION - ABOUT - ROADMAP */}

		<img src={logo} alt="" class="logo"/>

		<div class="hill"></div>


	</header>

	{/* MAIN	----------------------------------------------------------------------------------------------------- */}
	<main>

		{/* ABOUT US */}
		<div class="section aboutus">

			<h2>What is ORANGEFRIENDS?</h2>

			<p>Each orange originally started as seed, being planted naturally in the rich soil of orangum. Through the years rainfall and sunny days came along till the tree grew strong and tall. The oranges grew day by day till becoming a little orange. As they prematurely fall out, they’re looking for someone to foster.</p>

		</div>

		{/* MINT */}
		<div id="mint" class="mint">

			<div class="mint-num">

				<img src={no} alt="" class="no-image"/>

				<div class="pointer up" onClick={(event) => {
					let max = 10
					let value = +document.getElementById("num").innerText
					if(value !== max) {
						document.getElementById("num").innerText = value + 1
					}
								
				}}></div>

				<span id="num">0</span>

				<div class="pointer down" onClick={(event) => {

					let value = +document.getElementById("num").innerText
					if(value !== 0) {
						document.getElementById("num").innerText = value - 1
					}
				}}></div>
							
			</div>
			<div class="mint-box" onClick={(event) => {
				let value = document.getElementById("num").innerText
				if (value > 0) {
					this.props.mint(value)
					console.log("MINT PRESSED")
					console.log("mint " + value + " oranges")
				}
				
			}}>MINT</div>

		</div>

		{/* CONNECT */}
		<div id="connect" class="connect" onClick={(event) => {
			console.log("CONNECT PRESSED")
			this.props.connect();
			
		}}>CONNECT</div>

		{/* TRAITS */}
		<div class="section traits">

			<h1>TRAITS</h1>

			<p>On a planet, lightyears away from Earth. A population of 10000 oranges are rolling around the planet oranguam waiting to be picked up to start it’s journey. You make the journey how you like it be, adventurous, exciting, thrilling, or just plain simple. That’s a decision you need to make.</p>

		</div>

		

		{/* ROADMAP */}
		<div class="section roadmap">

			<div class="timeline"></div>
			<h1>ROADMAP</h1>

			<h2 class="top-space">Phase 1: Events</h2>
			<p>We will be hosting events for our holders such as ama’s, giveaways &amp; others events for us to interact. Provide updates and timelines of each phase launch. Allowing opportunities to be whitelisted and potentially a role in discord.</p>

			<h2>Phase 2:  Mutations</h2>
			<p>Currently Holders of oranges friends will be able to claim a mutation serum, where you can mutate your orange friend into a mutated orange. To claim a free serum you will need to own a minimum of 3 oranges friends or more. For every 3 oranges you can claim one serum. Whatever doesn’t get claimed will be up for a public mint. The supply of the serum will be 3333. The supply of the mutated orange friends will be limited to 3333 as well. </p>

			<h2>Phase 3: Merchandising</h2>
			<p>The aim is to launch a clothing line including hoodies, t-shirts, caps etc. Alongside accessories complementing your fit or just styling items such as keyring, lanyards, mugs etc. These will be both customizable to your nft or the standard logo of Orange friends.</p>

			<h2>Phase 4: Voxel Art</h2>
			<p>Voxel style little 
				orange friends where it will be exclusive to people who hold the orange friend or mutated orange friend. There will be an alpha chat for the holders, allowing us to efficiently and effectively allocate the voxel orange to the current holders of the pixelated little orange friends. Will be buying land in the sandbox allowing you showcase and interact</p>

		</div>

		{/* TEAM */}
		<div class="section team">

			<h1>TEAM</h1>

			<div class="members">
				<div class="member">
					<div class="dot red"></div>
					HUMPTY / LEAD

				</div>
				<div class="member">
					<div class="dot yellow"></div>
					ALSSY / ARTIST

				</div>
				<div class="member">
					<div class="dot green"></div>
					KING / CONTRACT

				</div>
				<div class="member">
					<div class="dot blue"></div>
					SLOW / WEB

				</div>
			</div>

		</div>




	</main>

	{/* FOOTER	----------------------------------------------------------------------------------------------------- */}
	<footer>

		Little Orange Friends

		<img src={opensea} alt="" class="social"/>
		<img src={twitter} alt="" class="social"/>

	</footer>

				
</div>
);}}

export default Site;