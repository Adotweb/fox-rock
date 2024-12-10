import { Entity } from "./Entity";

export class Zombie extends Entity{
	constructor(start_pos){
		super(start_pos, 0, 0);

		this.name = "zombie"
	}
}
