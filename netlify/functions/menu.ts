import type { Handler } from '@netlify/functions';
import { error,json,options,rateLimit } from './_shared/http.js';
import { supabase } from './_shared/supabase.js';

/** Public menu endpoint: prices are returned in kobo. */
export const handler:Handler = async event => {
  if(event.httpMethod==='OPTIONS') return options(event);
  if(event.httpMethod!=='GET') return error(event,405,'METHOD_NOT_ALLOWED','Use GET.');
  if(!rateLimit(event,100)) return error(event,429,'RATE_LIMITED','Too many requests.');
  try {
    const {data, error:dbError}=await supabase().from('menu_items').select('*').eq('available',true).order('created_at');
    if(dbError) throw dbError;
    return json(event,200,{data});
  } catch (cause) { console.error('menu:',cause); return error(event,500,'MENU_UNAVAILABLE','Unable to load the menu.'); }
};
