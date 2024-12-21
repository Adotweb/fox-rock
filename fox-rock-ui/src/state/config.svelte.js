//global configuration that doesnt change
export let screen_w = 800;
export let screen_h = 800;
export let mini_map_w = 300;
export let mini_map_h = 300;

export let prod_url = "https://localhost-njg5.onrender.com"
export let dev_url = "http://localhost:3000"


let in_prod = import.meta.env.PROD;


export let default_server_url = in_prod ? prod_url : dev_url
export let websocket_url = in_prod ? "wss://localhost-njg5.onrender.com/" : "ws://localhost:3000"
