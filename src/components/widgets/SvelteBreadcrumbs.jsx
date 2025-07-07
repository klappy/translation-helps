import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function SvelteBreadcrumbs(){
  const location = useLocation();
  useEffect(()=>{
    if(!document.querySelector('script[data-svelte-widgets]')){
      const s=document.createElement('script');s.type='module';s.dataset.svelteWidgets='true';s.src='http://localhost:5175/src/main.js';document.body.appendChild(s);
    }
  },[]);
  return <nav-breadcrumbs path={location.pathname} />;
}