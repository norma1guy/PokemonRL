import  {BattleStream,getPlayerStreams,Teams} from 'pokemon-showdown'
import { RandomPlayerAI } from './PlayerAI'

const allPokemonData = require('./Data/pokedex.json')
const allMovesData = require('./Data/moves.json') 
const namesPokemon = Object.keys(allPokemonData)
const allMoves = Object.keys(allMovesData)

const streams = getPlayerStreams(new BattleStream());

const spec = {
    formatid: "gen9randombattle",
};

const p1spec = {
    name: "Alice",
    team : Teams.pack(Teams.generate('gen9randombattle')),
};

const p2spec = {
    name : "Ben",
    team : Teams.pack(Teams.generate('gen9randombattle')),
};

const p1 = new RandomPlayerAI(streams.p1);
const p2 = new RandomPlayerAI(streams.p2);

console.log("p1 is " + p1.constructor.name);
console.log("p2 is " + p2.constructor.name);

void p1.start();
void p2.start();

void (async () => {
    for await (const chunk of streams.omniscient){
        console.log(chunk);
    }
})();

void streams.omniscient.write(`>start ${JSON.stringify(spec)}
>player p1 ${JSON.stringify(p1spec)}
>player p2 ${JSON.stringify(p2spec)}`);

