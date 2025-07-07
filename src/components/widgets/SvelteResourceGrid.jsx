import { useEffect } from 'react';

export default function SvelteResourceGrid({ items }){
  useEffect(()=>{
    if(!document.querySelector('script[data-svelte-grid]')){
      const s=document.createElement('script');s.type='module';s.dataset.svelteGrid='true';s.src='http://localhost:5175/src/main.js';document.body.appendChild(s);
    }
  },[]);
  return <resource-grid items={JSON.stringify(items)} />;
}