import type { HandlerEvent, HandlerResponse } from '@netlify/functions';

const recentRequests = new Map<string,{count:number;resetAt:number}>();
export const cors = (event:HandlerEvent) => ({
  'Access-Control-Allow-Origin': event.headers.origin || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Content-Type': 'application/json; charset=utf-8',
  'Vary': 'Origin'
});
export const json = (event:HandlerEvent,statusCode:number,body:unknown):HandlerResponse => ({ statusCode,headers:cors(event),body:JSON.stringify(body) });
export const options = (event:HandlerEvent):HandlerResponse => ({statusCode:204,headers:cors(event),body:''});
export const error = (event:HandlerEvent,status:number,code:string,message:string) => json(event,status,{error:{code,message}});
export function rateLimit(event:HandlerEvent,limit=60,windowMs=60_000):boolean {
  const key=(event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const now=Date.now(),record=recentRequests.get(key);
  if(!record || record.resetAt<=now){recentRequests.set(key,{count:1,resetAt:now+windowMs});return true;}
  record.count++;return record.count<=limit;
}
