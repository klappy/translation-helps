import { useEffect } from 'react';

export default function SvelteLanding(){
  useEffect(()=>{
    if(!document.querySelector('script[data-svelte-pages]')){
      const s=document.createElement('script');s.type='module';s.dataset.sveltePages='true';s.src='http://localhost:5175/src/main.js';document.body.appendChild(s);
    }
  },[]);
  return <landing-page />;
}