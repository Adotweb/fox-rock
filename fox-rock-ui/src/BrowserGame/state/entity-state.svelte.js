import { Ghoul } from "../entities/Entities";

export const entity_state = $state([]);

let ghoul1 = new Ghoul([4, 4])

ghoul1.register_to(entity_state)
