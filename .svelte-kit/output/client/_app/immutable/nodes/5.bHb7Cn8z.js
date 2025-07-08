import{S as j,i as F,s as G,n as z,d as p,a as W,b as U,c as o,w as h,e as d,f,g as I,h as H,x as N,p as q,j as m,t as A,k as C,H as J,y as K,o as Q,m as X,z as Y,A as Z,B as ee,l as te}from"../chunks/DmYNFpl8.js";import"../chunks/IHki7fMi.js";import{p as ne}from"../chunks/Br4C82LX.js";/* empty css                */function se(a){let e,n,t,s=a[1].title+"",r,g,l,w,S,T,u,P,V=new Date().toLocaleDateString()+"",x,D,_,b,$=a[1].content.replace(/\n/g,"<br>").replace(/##\s+(.+)/g,"<h2>$1</h2>").replace(/#\s+(.+)/g,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")+"",L,v,B='<div class="footer-actions svelte-w3slr5"><button class="feedback-button svelte-w3slr5">💬 Feedback</button> <button class="share-button svelte-w3slr5">🔗 Share Section</button></div>';return{c(){e=m("div"),n=m("header"),t=m("h1"),r=A(s),g=C(),l=m("div"),w=m("span"),S=A(a[0]),T=C(),u=m("span"),P=A("Updated: "),x=A(V),D=C(),_=m("div"),b=new J(!1),L=C(),v=m("footer"),v.innerHTML=B,this.h()},l(c){e=d(c,"DIV",{class:!0});var i=f(e);n=d(i,"HEADER",{class:!0});var y=f(n);t=d(y,"H1",{class:!0});var O=f(t);r=I(O,s),O.forEach(p),g=H(y),l=d(y,"DIV",{class:!0});var E=f(l);w=d(E,"SPAN",{class:!0});var R=f(w);S=I(R,a[0]),R.forEach(p),T=H(E),u=d(E,"SPAN",{class:!0});var M=f(u);P=I(M,"Updated: "),x=I(M,V),M.forEach(p),E.forEach(p),y.forEach(p),D=H(i),_=d(i,"DIV",{class:!0});var k=f(_);b=N(k,!1),k.forEach(p),L=H(i),v=d(i,"FOOTER",{class:!0,"data-svelte-h":!0}),q(v)!=="svelte-1wpf2y7"&&(v.innerHTML=B),i.forEach(p),this.h()},h(){h(t,"class","content-title svelte-w3slr5"),h(w,"class","section-badge svelte-w3slr5"),h(u,"class","last-updated svelte-w3slr5"),h(l,"class","content-meta svelte-w3slr5"),h(n,"class","content-header svelte-w3slr5"),b.a=null,h(_,"class","content-body svelte-w3slr5"),h(v,"class","content-footer svelte-w3slr5"),h(e,"class","content-container svelte-w3slr5")},m(c,i){U(c,e,i),o(e,n),o(n,t),o(t,r),o(n,g),o(n,l),o(l,w),o(w,S),o(l,T),o(l,u),o(u,P),o(u,x),o(e,D),o(e,_),b.m($,_),o(e,L),o(e,v)},p(c,[i]){i&2&&s!==(s=c[1].title+"")&&W(r,s),i&1&&W(S,c[0]),i&2&&$!==($=c[1].content.replace(/\n/g,"<br>").replace(/##\s+(.+)/g,"<h2>$1</h2>").replace(/#\s+(.+)/g,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")+"")&&b.p($)},i:z,o:z,d(c){c&&p(e)}}}function ae(a,e,n){let t,{section:s="overview"}=e;const r={overview:{title:"🚀 Welcome to Translation Helps Showcase",content:`# Welcome to Our Showcase!

This interactive showcase demonstrates the **Translation Helps** application - a powerful platform for Bible translation resources built with modern Svelte architecture.

## 🎯 Purpose

This showcase serves as a comprehensive demonstration of our React to Svelte migration project.

## 🏗️ What We Built

- **Simple Verse-Loading Pattern** - Elegant architecture that scales
- **Self-Activating Panels** - Components that manage their own resources  
- **Cross-Organization Support** - Mix resources from different organizations
- **FIA Integration** - Rich multimedia Bible study resources
- **LLM Chat Integration** - AI-powered assistance
- **Theme System** - Beautiful light/dark mode support

## 💡 Get Inspired!

This is the result of our comprehensive React to Svelte migration. See what we built, understand how we approached challenges, and explore the fully migrated application.`},architecture:{title:"🏗️ Architecture Gallery",content:`# Architecture Gallery

Exploring our design patterns and system architecture.`},components:{title:"🎨 Component Showcase",content:`# Component Showcase

Interactive UI components and examples.`},performance:{title:"⚡ Performance Victories",content:`# Performance Victories

Optimization achievements and metrics.`},innovation:{title:"💡 Innovation Highlights",content:`# Innovation Highlights

Cutting-edge features and capabilities.`},interactive:{title:"🎮 Interactive Experiences",content:`# Interactive Experiences

Hands-on demos and playgrounds.`},metrics:{title:"📊 Metrics & Achievements",content:`# Metrics & Achievements

Project statistics and impact.`}};return a.$$set=g=>{"section"in g&&n(0,s=g.section)},a.$$.update=()=>{a.$$.dirty&1&&n(1,t=r[s]||r.overview)},[s,t]}class oe extends j{constructor(e){super(),F(this,e,ae,se,G,{section:0})}}function re(a){let e,n;return e=new oe({props:{section:a[0]}}),{c(){ee(e.$$.fragment)},l(t){Z(e.$$.fragment,t)},m(t,s){Y(e,t,s),n=!0},p(t,[s]){const r={};s&1&&(r.section=t[0]),e.$set(r)},i(t){n||(X(e.$$.fragment,t),n=!0)},o(t){Q(e.$$.fragment,t),n=!1},d(t){K(e,t)}}}function ie(a,e,n){let t,s;return te(a,ne,r=>n(1,s=r)),a.$$.update=()=>{a.$$.dirty&2&&n(0,t=s.params.section||"overview")},[t,s]}class de extends j{constructor(e){super(),F(this,e,ie,re,G,{})}}export{de as component};
