# A Pokemon Battle AI for Showdown using Reinforcement Learning

## Creating Battle Simulations using Randomizer

BattleSim makes use of PlayerAI to start a battle between 2 bots using the simulator provided by pokemon-showdown. It generates a stream with all the events happening in the battle.

Run the battle simulations using

```
npx ts-node BattleSim.ts
```

## Synthetic Data for RL

Making use of BattleSim to create the synthetic dataset for training the RL model on battles.

Making use of **`startBattle`** defined in **`BattleSim.ts`** we create a battle log between 2 AIs based on random choice.

Using **`BattleLogs.ts`** we specify the number of battles we want to start and capture the logs.
```
npx ts-node BattleLog.ts
```