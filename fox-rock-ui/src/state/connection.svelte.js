//state to manage connections with a host

import { writable } from "svelte/store";


//this is the server id for when we want to communicate with the server
export let connection = writable(undefined)
