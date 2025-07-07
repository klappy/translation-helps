import { useEffect } from 'react';

export default function SvelteVerseTabs({tabs,active,onChange}){
  useEffect(()=>{
    if(!document.querySelector('script[data-svelte-tabs]')){
      const s=document.createElement('script');s.type='module';s.dataset.svelteTabs='true';s.src='http://localhost:5175/src/main.js';document.body.appendChild(s);
    }
  },[]);
  return <verse-tabs tabs={JSON.stringify(tabs)} active={active} onChange={e=>onChange && onChange(e.detail)} />;
}