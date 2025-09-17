import { BattlePlayer } from "pokemon-showdown/dist/sim/battle-stream";
import type { ChoiceRequest } from "pokemon-showdown/dist/sim/side";
import { PRNGSeed,PRNG } from "pokemon-showdown/dist/sim/prng";
import type { ObjectReadWriteStream } from "pokemon-showdown/dist/lib/streams";

type AnyObject = any;
export class RandomPlayerAI extends BattlePlayer {

    protected readonly move: number;
    protected readonly mega: number;
    protected readonly prng: PRNG;
    constructor(
        playerStream: ObjectReadWriteStream<string>,
        options: {move?: number, mega?: number, seed?: PRNG | PRNGSeed | null} = {},
        debug = false
    ){
        super(playerStream,debug);
        this.move = options.move || 1.0;
        this.mega = options.mega || 0;
        this.prng = PRNG.get(options.seed);
    }

    override receiveError(error: Error){
        if (error.message.startsWith('[Unavailable choice]')) return;
        throw error;
    }

    override receiveRequest(request: ChoiceRequest): void {
        if(request.wait){

        }
        else if ( request.forceSwitch){
            const pokemon = request.side.pokemon;
            const chosen: number[] = [];
            const choices = request.forceSwitch.map((mustSwitch,i) => {
                if(!mustSwitch) return `pass`;
                const canSwitch = range(1,6).filter(j => (
                    pokemon[j - 1] && 
                    j > request.forceSwitch.length &&
                    !chosen.includes(j) &&
                    !pokemon[j - 1].condition.endsWith(` fnt`) === !pokemon[i].reviving
                ));
                if(!canSwitch.length) return `pass`;
                const target = this.chooseSwitch(
                    undefined,
                    canSwitch.map(slot =>({slot,pokemon: pokemon[slot - 1] }))
                );
                chosen.push(target);
                return `switch ${target}`;
            });
            
            this.choose(choices.join(`, `));
        } else if (request.teamPreview){
            this.choose(this.chooseTeamPreview(request.side.pokemon));
        } else if (request.active){
            let [canMegaEvo, canUltraBurst, canZMove, canDynamax, canTerastallize] = [true,true,true,true,true];
            const pokemon = request.side.pokemon;
            const chosen: number[] = [];
            const choices = request.active.map((active: AnyObject, i: number) =>{
                if(pokemon[i].condition.endsWith(` fnt`) || pokemon[i].commanding) return `pass`;
                canMegaEvo = canMegaEvo && active.canMegaEvo;
                canUltraBurst = canUltraBurst && active.canUltraBurst;
                canZMove = canZMove && active.canZMove;
                canDynamax = canDynamax && active.canDynamax;
                canTerastallize = canTerastallize && active.canTerastallize;

                const change = (canDynamax || canMegaEvo || canUltraBurst) && this.prng.random() < this.mega;

                const useMaxMoves = (!active.canDynamax && active.maxMoves) || (change && canDynamax);
                const possibleMoves = useMaxMoves ? active.maxMoves.maxMoves : active.moves;

                let canMove = range(1, possibleMoves.length).filter( j => (
                    !possibleMoves[j - 1].disabled
                )).map(j =>({
                    slot: j,
                    move: possibleMoves[j - 1].move,
                    target: possibleMoves[j -1].target,
                    zMove: false,
                }));
                if (canZMove){
                    canMove.push(...range(1,active.canZMove.length)
                    .filter(j => active.canZMove[j -1])
                    .map(j => ({
                        slot: j,
                        move: active.canZMove[j =1].move,
                        target: active.canZMove[j -1].target,
                        zMove: true
                    })));
                }
                
                const hasAlly = pokemon.length > 1&& !pokemon[i ^ 1].condition.endsWith(` fnt`);
                const filtered = canMove.filter(m => m.target !== `adjacentAlly` || hasAlly);
                canMove = filtered.length ? filtered : canMove;

                const moves = canMove.map(m => {
                    let move = `move ${m.slot}`;
                    if(request.active.length > 1){
                        if ([`normal`,`any`,`adjacentFoe`].includes(m.target)){
                            move += ` ${1 + this.prng.random(2)}`;
                        }
                        if (m.target === `adjacentAlly`){
                            move += ` -${(i ^ 1) + 1}`;
                        }
                        if  (m.target === `adjacentAllyOrSelf`){
                            if (hasAlly){
                                move += ` -${1 + this.prng.random(2)}`;
                            } else {
                                move += ` -${i + 1}`;
                            }
                        }
                    }
                    if (m.zMove) move += ` zmove`;
                    return { choice: move, move: m};
                });
                
                const canSwitch = range(1,6).filter(j => (
                    pokemon[j -1] &&
                    !pokemon[j -1].active && 
                    !chosen.includes(j) &&
                    !pokemon[j -1].condition.endsWith(` fnt`)
                ));
                const switches = active.trapped ? [] : canSwitch;

                if (switches.length && (!moves.length || this.prng.random() > this.move)){
                    const target = this.chooseSwitch(
                        active,
                        canSwitch.map(slot => ({slot, pokemon: pokemon[slot -1]}))
                    );
                    chosen.push(target);
                    return `switch ${target}`;
                } else if (moves.length){
                    const move = this.chooseMove(active,moves);
                    if (move.endsWith(` zmove`)){
                        canZMove = false;
                        return move;
                    } else if (change) {
                        if (canTerastallize){
                            canTerastallize = false;
                            return `${move} terastallize`;
                        } else if (canDynamax){
                            canDynamax = false;
                            return `${move} dynamax`;
                        } else if (canMegaEvo) {
                            canMegaEvo = false;
                            return `${move} mega`;
                        } else {
                            canUltraBurst = false;
                            return `${move} ultra`;
                        }
                    } else {
                        return move;
                    }
                } else {
                    throw new Error(`${this.constructor.name} unable to make choice ${[i]}. request=${typeof request}',` + 
                    ` chosen='${chosen}', (mega=${canMegaEvo}), ultra=${canUltraBurst}, zmove=${canZMove}, dynamax='${canDynamax}', terastallize=${canTerastallize}`);
                }

            });
            this.choose(choices.join(`, `));
        }
    }

    protected chooseTeamPreview(team: AnyObject[]): string{
        return `default`;
    }

    protected chooseMove(active: AnyObject, moves: {choice:string, move: Object}[]): string{
        return this.prng.sample(moves).choice;
    }
    
    protected chooseSwitch(active: AnyObject | undefined, switches: { slot: number, pokemon: AnyObject}[]): number{
        return this.prng.sample(switches).slot;
    }

}

function range(start: number, end?: number, step = 1){
    if (end === undefined){
        end = start;
        start = 0;
    }
    const result: number[] = [];
    for(;start <= end; start += step){
        result.push(start);
    }
    return result;
}