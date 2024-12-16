<script>
//function to change the mode of the window
export let decide_mode;


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
	justify-content: center;
	align-items: center;
	background-color: rgb(0, 0, 0, 0.7);

	.box {	
		border : 1px solid black;	
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
		<button onclick={play_default_server}>Play default server (recommended)</button>
		<button onclick={play_defined_server}>Play custom server</button>
		<button onclick={create_defined_server}>create custom server</button>
	</div>	
</div>

