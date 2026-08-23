import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pollPosts } from '../../api/notificationService';
import { getInitialNotifications } from '../../api/mockDataService';
import { useNotificationStore } from '../../stores/notificationStore';
import { useToast } from '../../hooks/useToast';

export function NotificationPolling(){
  const [visible,setVisible]=useState(!document.hidden);
  const initialize=useNotificationStore((s)=>s.initialize);
  const addFromPosts=useNotificationStore((s)=>s.addFromPosts);
  const toast=useToast();
  useEffect(()=>{ getInitialNotifications().then(initialize).catch(()=>undefined); },[initialize]);
  useEffect(()=>{ const fn=()=>setVisible(!document.hidden); document.addEventListener('visibilitychange',fn); return()=>document.removeEventListener('visibilitychange',fn);},[]);
  useQuery({queryKey:['notification-poll'],queryFn:async()=>{const posts=await pollPosts(); const fresh=addFromPosts(posts); if(fresh.length) toast(`${fresh.length} new notification${fresh.length>1?'s':''}`,'info'); return posts;},enabled:visible,refetchInterval:15000,refetchIntervalInBackground:false,staleTime:10000});
  return null;
}
