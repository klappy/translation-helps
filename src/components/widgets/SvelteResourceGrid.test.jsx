import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SvelteResourceGrid from './SvelteResourceGrid';

beforeAll(()=>{
  global.fetch = vi.fn(()=>Promise.resolve({ok:true,text:()=>Promise.resolve('')}));
});

describe('SvelteResourceGrid', ()=>{
  it('mounts grid with items', async ()=>{
    const items=[{title:'A',thumbnail:'/a.png'},{title:'B',thumbnail:'/b.png'}];
    render(<SvelteResourceGrid items={items}/>);
    await waitFor(()=>document.querySelector('resource-grid'));
    expect(document.querySelectorAll('resource-grid')[0]).not.toBeNull();
  });
});