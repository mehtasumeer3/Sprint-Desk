import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAuthFetch } from './authFetch';
import { refreshSession } from './authService';
vi.mock('./authService',()=>({refreshSession:vi.fn()}));
describe('authFetch',()=>{
 beforeEach(()=>vi.clearAllMocks());
 it('refreshes a token on 401 and retries once',async()=>{
  const fetchMock=vi.fn().mockResolvedValueOnce(new Response(null,{status:401})).mockResolvedValueOnce(new Response(JSON.stringify({ok:true}),{status:200}));
  vi.stubGlobal('fetch',fetchMock);
  vi.mocked(refreshSession).mockResolvedValue({id:1,username:'user',email:'u@e.com',firstName:'U',lastName:'Ser',image:'',accessToken:'new-access',refreshToken:'new-refresh'});
  let access='old-access';let refresh='old-refresh';
  const authFetch=createAuthFetch({getAccessToken:()=>access,getRefreshToken:()=>refresh,onRefreshed:(a,r)=>{access=a;refresh=r},onAuthFailure:vi.fn()});
  const response=await authFetch('/secure');
  expect(response.status).toBe(200); expect(refreshSession).toHaveBeenCalledWith('old-refresh'); expect(fetchMock).toHaveBeenCalledTimes(2); expect(fetchMock.mock.calls[1]?.[1]?.headers).toMatchObject({Authorization:'Bearer new-access'});
 });
});
