import {get} from '../api'

export async function SecurityChecksGet(page:number,size?:number,userId?:string){
  const query = new URLSearchParams();
  query.append('page', page.toString());
  query.append('size', (size ?? 10).toString());
  if (userId) {
    query.append('userId', userId);
  }

  return get(`/security-checks?${query.toString()}`);
}