import { startBattle } from "./BattleSim";
import * as fs from "fs";

async function genBattleLogs(n : number){
    const logs:any[] = [];
    for(let i = 0 ; i < n; i++){
        const log = await startBattle();
        //console.log(log);
        logs.push(log);
        //console.log(`Battle ${i + 1} is over \n`)
    }
    //console.log(logs);
    return logs;
}

async function main(){
    const battles = await genBattleLogs(100);
    fs.writeFileSync("Data/battle_logs.json",JSON.stringify(battles,null,2));
}

main();
