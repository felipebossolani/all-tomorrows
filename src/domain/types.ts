export type Kind = 'foot' | 'claw' | 'eye' | 'extender';
export interface Point { x:number; y:number }
export interface Module extends Point { kind:Kind }
export interface Switch extends Point { id:string; hidden:boolean }
export interface Door extends Point { switchId:string }
export interface Level { id:number; name:string; instruction:string; map:string[]; start:Point; stations:Point[]; seed:Point; nest:Point; switches:Switch[]; doors:Door[]; stock:Record<Kind,number>; initial:Module[]; hints:[string,string]; solution:Command[] }
export interface State { position:Point; modules:Module[]; carrying:boolean; delivered:boolean; opened:string[] }
export type Command = {type:'move';dx:number;dy:number} | {type:'assemble';modules:Module[]} | {type:'interact';target:string};
export interface Target extends Point { id:string; label:string }
export type Result = {ok:true;state:State} | {ok:false;reason:string};
// engine.ts exports initialState(level), transition(level,state,command), targets(level,state), validateAssembly(level,state,modules): string|null.
// levels/index.ts exports levels: Level[]. Coordinates use x right, y down. Map '#' is wall, '.' floor.
