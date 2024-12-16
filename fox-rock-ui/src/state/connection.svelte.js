//state to manage connections with a host

import { writable } from "svelte/store";

export let connection = writable(undefined)
