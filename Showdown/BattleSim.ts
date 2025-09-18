import  {BattleStream,getPlayerStreams,Teams} from 'pokemon-showdown'
import { RandomPlayerAI } from './PlayerAI'

export async function startBattle(): Promise<string>{
    const battleStream = new BattleStream();
    const streams = getPlayerStreams(battleStream);
    const logs: string[] = [];
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

    const p1AI = p1.start();
    const p2AI =p2.start();

    const battleLog =  (async () => {
        for await (const chunk of streams.omniscient){
            //console.log(chunk);
            logs.push(chunk);
        }
    })();

    battleStream.write(`>start ${JSON.stringify(spec)}\n` +
    `>player p1 ${JSON.stringify(p1spec)}\n` +
    `>player p2 ${JSON.stringify(p2spec)}\n`);

    await Promise.all([p1AI,p2AI,battleLog]);
    //console.log(logs.join("\n"));
    return logs.join("\n");
}




