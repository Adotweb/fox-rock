<script>
//function to change the mode of the window
export let decide_mode;

//functions to click through the first page
function play_default_server(){
	decide_mode("play")
}	

function play_defined_server(){
	decide_mode("connect")
}
function create_defined_server(){
	decide_mode("create")
}

</script>

<style>
.popup{

	position:absolute;
	top:0px;
	left:0px;
	height:100vh;
	width:100vw;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap:10px;
	align-items: center;
	background-color: rgb(0, 0, 0, 0.7);
	

	.box {	
		padding : 20px;
		border-radius : 20px;
		background-color: white;
		width: 200px;	
		display:flex;
		flex-direction: column;
		gap: 10px;
		
		button{
			transition:  ease-in 0.1s;
			background-color: black;
			border-radius: 5px;
			border: none;
			padding : 10px;
			font-weight: bold;
			font-size: 1em;
			border: 1px solid white;
		}
		button:hover{
			background-color: white;
			color : black;
			border: 1px solid black;
		}
	}
}
</style>

<div class="popup">
	<div class="box">
		<strong>Controls</strong>
		<div>
			"WASD" for Movement <br>
			Left + Right Key to turn <br>
			Space to use item <br>
			1 to equip gun <br>
			2 to equip medkit 
		</div>
	</div>
	<div class="box">

		<button onclick={play_default_server}>Play default server (recommended)</button>
		<button onclick={play_defined_server}>Play custom server</button>
		<button onclick={create_defined_server}>create custom server</button>
	</div>	
</div>

