<script>
  import Heading from '../lib/Heading.svelte';
  let email='';
  let password='';
  function login(){ alert(`Pretend login: ${email}`); }
</script>

<section class="auth">
  <Heading level={2} text="Login" />
  <form on:submit|preventDefault={login} class="form">
    <input type="email" placeholder="Email" bind:value={email} required />
    <input type="password" placeholder="Password" bind:value={password} required />
    <button type="submit">Login</button>
  </form>
</section>

<style>
  .auth{padding:2rem 1rem;max-width:400px;margin:0 auto;color:var(--color-text);}
  .form{display:flex;flex-direction:column;gap:1rem;margin-top:1rem;}
  input{padding:0.5rem;border:1px solid #ccc;border-radius:var(--radius-sm);font-size:var(--font-size-base);}  
  button{padding:0.6rem;border:0;background:var(--color-primary);color:#fff;border-radius:var(--radius-md);cursor:pointer;}
  button:hover{opacity:0.85;}
</style>