import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Balance = bigint;
export interface Borrow {
  'borrow' : ActorMethod<[bigint, Principal, bigint], string>,
  'checkRemoveLP' : ActorMethod<[Array<Principal>], Array<bigint>>,
  'checkRemoveLP_2' : ActorMethod<[Principal], Array<number>>,
  'deposit' : ActorMethod<[bigint], string>,
  'getAvaiableToBorrow' : ActorMethod<[bigint], Array<bigint>>,
  'getDepositId' : ActorMethod<[], [] | [DepositType]>,
  'getDepositIdPerUser' : ActorMethod<[Principal], [] | [DepositType]>,
  'getHealthRaito' : ActorMethod<[Principal], number>,
  'getLoanDetail' : ActorMethod<[bigint], [] | [LoanDetail]>,
  'getPairInfo' : ActorMethod<[bigint], Array<bigint>>,
  'getPairInfoPrincipal' : ActorMethod<[bigint], Array<string>>,
  'getReserves' : ActorMethod<[], Array<bigint>>,
  'getTokenBalance' : ActorMethod<[Principal, Principal], Balance>,
  'getTokenDecimals' : ActorMethod<[Principal], number>,
  'getloanId' : ActorMethod<[], bigint>,
  'rePay' : ActorMethod<[], string>,
  'totalSupply_call' : ActorMethod<[string], bigint>,
  'user' : ActorMethod<[], string>,
  'withdraw' : ActorMethod<[bigint], string>,
  'withdrawTokenFromSwap' : ActorMethod<[Principal, bigint], TxReceipt>,
}
export interface DepositType {
  'startTime' : Time,
  'duration' : bigint,
  'interest' : bigint,
  'isUsing' : boolean,
  'reserve0' : bigint,
  'reserve1' : bigint,
  'borrow' : bigint,
  'isActive' : boolean,
  'tokenIdBorrow' : Principal,
  'isAllowWithdraw' : boolean,
  'amount' : bigint,
}
export interface LoanDetail { 'id' : bigint, 'borrower' : Principal }
export type Time = bigint;
export type TxReceipt = { 'ok' : bigint } |
  { 'err' : string };
export interface _SERVICE extends Borrow {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
