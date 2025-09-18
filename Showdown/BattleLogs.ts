import { startBattle } from "./BattleSim";


async function genBattleLogs(n : number){

    for(let i = 0 ; i < n; i++){
        const log = await startBattle();
        console.log(log);
        console.log(`Battle ${i + 1} is over \n`)
    }
}
