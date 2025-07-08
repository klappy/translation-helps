<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';

  const dispatch = createEventDispatcher();

  export let onComplete = null;

  // Slide content - proving "overlooked" concepts
  const slides = [
    {
      id: 'welcome',
      type: 'hero',
      content: {
        logo: 'TH',
        title: 'Translation Helps',
        subtitle: 'ETEN Innovation Lab',
        tagline: 'Proving "Overlooked" Concepts in Bible Translation Technology',
        cta: 'Begin Journey'
      }
    },
    {
      id: 'proof-of-concept',
      type: 'feature',
      content: {
        icon: '🚀',
        title: 'Aquifer Reference Implementation',
        points: [
          'Proof of concept for Aquifer content on GitHub',
          'Showcasing future architecture possibilities',
          'Reference implementation for the Lab\'s vision',
          'Breaking barriers others said couldn\'t be broken'
        ],
        quote: 'What if flat files could be as powerful as databases?'
      }
    },
    {
      id: 'flat-files',
      type: 'breakthrough',
      content: {
        icon: '📁',
        title: 'They Said Flat Files Were Dead',
        subtitle: 'We Proved Them Wrong',
        achievements: [
          { icon: '⚡', text: 'Lightning-fast performance' },
          { icon: '🔗', text: 'Fully interlinkable content' },
          { icon: '🌐', text: 'Dynamic cross-references' },
          { icon: '📊', text: 'Real-time data access' }
        ],
        impact: 'Flat files can be fast, dynamic, and interconnected!'
      }
    },
    {
      id: 'multi-org',
      type: 'feature',
      content: {
        icon: '🤝',
        title: 'Cross-Organization Magic',
        points: [
          'Mix resources from unfoldingWord, Door43, and more',
          'Seamless integration across organizational boundaries',
          'Unified experience from distributed sources',
          'Breaking down silos in Bible translation'
        ],
        visual: 'orgLogos'
      }
    },
    {
      id: 'ai-revolution',
      type: 'showcase',
      content: {
        icon: '🤖',
        title: 'AI That Actually Works',
        subtitle: 'On a Shoestring Budget!',
        features: [
          { emoji: '🎯', title: 'Accurate Quotes', desc: 'AI quotes scripture precisely' },
          { emoji: '🤔', title: 'Honest Limitations', desc: 'Admits when it doesn\'t know' },
          { emoji: '💰', title: 'Budget-Friendly', desc: 'No expensive retraining needed' },
          { emoji: '📚', title: 'Dynamic Learning', desc: 'Reads flat files on-the-fly' }
        ]
      }
    },
    {
      id: 'no-servers',
      type: 'breakthrough',
      content: {
        icon: '☁️',
        title: 'Serverless Architecture',
        subtitle: 'They Said We Needed Complex Infrastructure',
        achievements: [
          { icon: '🚫', text: 'No extra servers running' },
          { icon: '💸', text: 'Minimal operational costs' },
          { icon: '🔧', text: 'Simple deployment' },
          { icon: '♾️', text: 'Infinite scalability' }
        ],
        impact: 'All powered by static files and edge functions!'
      }
    },
    {
      id: 'multimedia',
      type: 'showcase',
      content: {
        icon: '🎨',
        title: 'Rich Multimedia Experience',
        features: [
          { emoji: '🗺️', title: 'FIA Maps', desc: 'Interactive biblical geography' },
          { emoji: '🖼️', title: 'FIA Images', desc: 'Visual context for scripture' },
          { emoji: '📖', title: 'Scripture Text', desc: 'Multiple translations side-by-side' },
          { emoji: '💬', title: 'AI Context', desc: 'Intelligent assistance on demand' }
        ],
        highlight: 'Bringing the Bible to life with rich media!'
      }
    },
    {
      id: 'limitations',
      type: 'honest',
      content: {
        icon: '⚖️',
        title: 'Honest About Limitations',
        subtitle: 'This Won\'t Solve Everything, But...',
        points: [
          'Not for every use case - and that\'s okay',
          'Proves architectural approaches work',
          'Opens doors for future innovation',
          'Shows what\'s possible with creativity'
        ],
        message: 'Sometimes proving it\'s possible is the first step to making it practical.'
      }
    },
    {
      id: 'get-started',
      type: 'cta',
      content: {
        icon: '🎯',
        title: 'Ready to Explore?',
        subtitle: 'See These Innovations in Action',
        features: [
          '📖 Browse Scripture',
          '📝 Access Translation Notes',
          '❓ Explore Translation Questions',
          '🔤 Study Translation Words',
          '🗺️ View Biblical Maps',
          '💬 Chat with AI Assistant'
        ],
        cta: 'Start Exploring',
        skip: 'Skip to App'
      }
    }
  ];

  let currentSlide = 0;
  let animationPhase = 'entering';
  let slideDirection = 'forward';

  // Handle keyboard navigation
  onMount(() => {
    if (browser) {
      const handleKeyPress = (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          handleNext();
        } else if (e.key === 'ArrowLeft') {
          handlePrevious();
        } else if (e.key === 'Escape') {
          handleComplete();
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  });

  function handleNext() {
    if (currentSlide < slides.length - 1) {
      slideDirection = 'forward';
      animationPhase = 'exiting';
      setTimeout(() => {
        currentSlide = currentSlide + 1;
        animationPhase = 'entering';
      }, 300);
    } else {
      handleComplete();
    }
  }

  function handlePrevious() {
    if (currentSlide > 0) {
      slideDirection = 'backward';
      animationPhase = 'exiting';
      setTimeout(() => {
        currentSlide = currentSlide - 1;
        animationPhase = 'entering';
      }, 300);
    }
  }

  function handleComplete() {
    animationPhase = 'exiting';
    setTimeout(() => {
      if (onComplete) onComplete();
      dispatch('complete');
    }, 500);
  }

  function goToSlide(index) {
    slideDirection = index > currentSlide ? 'forward' : 'backward';
    animationPhase = 'exiting';
    setTimeout(() => {
      currentSlide = index;
      animationPhase = 'entering';
    }, 300);
  }
</script>

<div class="splash-container {animationPhase}">
  <!-- Background animation -->
  <div class="background-pattern">
    <div class="floating-element-1"></div>
    <div class="floating-element-2"></div>
    <div class="floating-element-3"></div>
  </div>

  <!-- Slide content -->
  <div class="slide-container {slideDirection}">
    {#if slides[currentSlide].type === 'hero'}
      <div class="hero-slide">
        <div class="logo-container">
          <div class="logo">
            <span class="logo-text">{slides[currentSlide].content.logo}</span>
          </div>
        </div>
        <h1 class="title">{slides[currentSlide].content.title}</h1>
        <div class="subtitle">{slides[currentSlide].content.subtitle}</div>
        <p class="tagline">{slides[currentSlide].content.tagline}</p>
        <button class="cta-button" on:click={handleNext}>
          {slides[currentSlide].content.cta}
          <svg class="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    {:else if slides[currentSlide].type === 'feature'}
      <div class="feature-slide">
        <div class="feature-icon">{slides[currentSlide].content.icon}</div>
        <h2 class="feature-title">{slides[currentSlide].content.title}</h2>
        <ul class="feature-points">
          {#each slides[currentSlide].content.points as point}
            <li class="feature-point">
              <span class="checkmark">✓</span>
              {point}
            </li>
          {/each}
        </ul>
        {#if slides[currentSlide].content.quote}
          <p class="feature-quote">"{slides[currentSlide].content.quote}"</p>
        {/if}
      </div>
    {:else if slides[currentSlide].type === 'breakthrough'}
      <div class="breakthrough-slide">
        <div class="breakthrough-icon">{slides[currentSlide].content.icon}</div>
        <h2 class="breakthrough-title">{slides[currentSlide].content.title}</h2>
        {#if slides[currentSlide].content.subtitle}
          <p class="breakthrough-subtitle">{slides[currentSlide].content.subtitle}</p>
        {/if}
        <div class="achievements-grid">
          {#each slides[currentSlide].content.achievements as achievement}
            <div class="achievement-card">
              <span class="achievement-icon">{achievement.icon}</span>
              <span class="achievement-text">{achievement.text}</span>
            </div>
          {/each}
        </div>
        {#if slides[currentSlide].content.impact}
          <p class="impact-statement">{slides[currentSlide].content.impact}</p>
        {/if}
      </div>
    {:else if slides[currentSlide].type === 'showcase'}
      <div class="showcase-slide">
        <div class="showcase-icon">{slides[currentSlide].content.icon}</div>
        <h2 class="showcase-title">{slides[currentSlide].content.title}</h2>
        {#if slides[currentSlide].content.subtitle}
          <p class="showcase-subtitle">{slides[currentSlide].content.subtitle}</p>
        {/if}
        <div class="showcase-grid">
          {#each slides[currentSlide].content.features as feature}
            <div class="showcase-card">
              <div class="showcase-emoji">{feature.emoji}</div>
              <h3 class="showcase-feature-title">{feature.title}</h3>
              <p class="showcase-feature-desc">{feature.desc}</p>
            </div>
          {/each}
        </div>
        {#if slides[currentSlide].content.highlight}
          <p class="highlight-text">{slides[currentSlide].content.highlight}</p>
        {/if}
      </div>
    {:else if slides[currentSlide].type === 'honest'}
      <div class="honest-slide">
        <div class="honest-icon">{slides[currentSlide].content.icon}</div>
        <h2 class="honest-title">{slides[currentSlide].content.title}</h2>
        <p class="honest-subtitle">{slides[currentSlide].content.subtitle}</p>
        <ul class="honest-points">
          {#each slides[currentSlide].content.points as point}
            <li class="honest-point">{point}</li>
          {/each}
        </ul>
        <p class="honest-message">{slides[currentSlide].content.message}</p>
      </div>
    {:else if slides[currentSlide].type === 'cta'}
      <div class="cta-slide">
        <div class="cta-icon">{slides[currentSlide].content.icon}</div>
        <h2 class="cta-title">{slides[currentSlide].content.title}</h2>
        <p class="cta-subtitle">{slides[currentSlide].content.subtitle}</p>
        <div class="cta-features">
          {#each slides[currentSlide].content.features as feature}
            <div class="cta-feature">{feature}</div>
          {/each}
        </div>
        <div class="cta-buttons">
          <button class="primary-cta" on:click={handleComplete}>
            {slides[currentSlide].content.cta}
          </button>
          <button class="secondary-cta" on:click={handleComplete}>
            {slides[currentSlide].content.skip}
          </button>
        </div>
      </div>
    {/if}
  </div>

  <!-- Navigation -->
  <div class="navigation">
    {#if currentSlide > 0}
      <button class="nav-button" on:click={handlePrevious} aria-label="Previous slide">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    {/if}
    
    <div class="slide-indicators">
      {#each slides as _, index}
        <button
          class="indicator {index === currentSlide ? 'active' : ''}"
          on:click={() => goToSlide(index)}
          aria-label="Go to slide {index + 1}"
        />
      {/each}
    </div>

    {#if currentSlide < slides.length - 1}
      <button class="nav-button" on:click={handleNext} aria-label="Next slide">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    {/if}
  </div>

  <!-- Skip button -->
  <button 
    class="skip-button"
    on:click={handleComplete}
    aria-label="Skip presentation"
  >
    Skip presentation
  </button>

  <!-- Keyboard hints -->
  <div class="keyboard-hints">
    <span>←→ Navigate</span>
    <span>Space Next</span>
    <span>Esc Skip</span>
  </div>
</div>

<style>
  /* Base container styles */
  .splash-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, var(--color-primary, #3B82F6) 0%, var(--color-secondary, #8B5CF6) 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    overflow: hidden;
    transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
  }

  .splash-container.entering {
    opacity: 1;
    transform: scale(1);
  }

  .splash-container.exiting {
    opacity: 0;
    transform: scale(0.95);
  }

  /* Background animation */
  .background-pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }

  .floating-element-1,
  .floating-element-2,
  .floating-element-3 {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 20s infinite linear;
  }

  .floating-element-1 {
    width: 100px;
    height: 100px;
    top: 20%;
    left: 10%;
    animation-delay: 0s;
  }

  .floating-element-2 {
    width: 150px;
    height: 150px;
    top: 60%;
    right: 15%;
    animation-delay: -7s;
  }

  .floating-element-3 {
    width: 80px;
    height: 80px;
    bottom: 20%;
    left: 60%;
    animation-delay: -14s;
  }

  @keyframes float {
    0% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
    100% { transform: translateY(0) rotate(360deg); }
  }

  /* Slide container */
  .slide-container {
    max-width: 900px;
    width: 90%;
    padding: 2rem;
    text-align: center;
    color: white;
    transition: transform 0.3s ease-in-out;
  }

  .slide-container.forward {
    transform: translateX(0);
  }

  .slide-container.backward {
    transform: translateX(0);
  }

  /* Hero slide styles */
  .hero-slide {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .logo-container {
    margin-bottom: 1rem;
  }

  .logo {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
  }

  .logo-text {
    font-size: 3rem;
    font-weight: bold;
    color: white;
  }

  .title {
    font-size: 4rem;
    font-weight: bold;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .subtitle {
    font-size: 1.5rem;
    opacity: 0.9;
    font-weight: 300;
  }

  .tagline {
    font-size: 1.2rem;
    opacity: 0.8;
    max-width: 600px;
    line-height: 1.6;
  }

  .cta-button {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .cta-button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }

  .cta-arrow {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
  }

  .cta-button:hover .cta-arrow {
    transform: translateX(5px);
  }

  /* Feature slide styles */
  .feature-slide {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .feature-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .feature-title {
    font-size: 2.5rem;
    font-weight: bold;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .feature-points {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 600px;
  }

  .feature-point {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.1rem;
    text-align: left;
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 12px;
    backdrop-filter: blur(10px);
  }

  .checkmark {
    color: #10B981;
    font-weight: bold;
    font-size: 1.2rem;
    background: rgba(16, 185, 129, 0.2);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .feature-quote {
    font-style: italic;
    font-size: 1.3rem;
    opacity: 0.9;
    margin-top: 1rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  }

  /* Breakthrough slide styles */
  .breakthrough-slide {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .breakthrough-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .breakthrough-title {
    font-size: 2.5rem;
    font-weight: bold;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .breakthrough-subtitle {
    font-size: 1.3rem;
    opacity: 0.9;
    margin: 0;
  }

  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    width: 100%;
    max-width: 800px;
  }

  .achievement-card {
    background: rgba(255, 255, 255, 0.1);
    padding: 1.5rem;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .achievement-icon {
    font-size: 2rem;
  }

  .achievement-text {
    font-size: 1rem;
    text-align: center;
    font-weight: 500;
  }

  .impact-statement {
    font-size: 1.4rem;
    font-weight: 600;
    color: #FCD34D;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    margin: 0;
  }

  /* Showcase slide styles */
  .showcase-slide {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .showcase-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .showcase-title {
    font-size: 2.5rem;
    font-weight: bold;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .showcase-subtitle {
    font-size: 1.3rem;
    opacity: 0.9;
    margin: 0;
  }

  .showcase-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    width: 100%;
    max-width: 800px;
  }

  .showcase-card {
    background: rgba(255, 255, 255, 0.1);
    padding: 1.5rem;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .showcase-emoji {
    font-size: 2.5rem;
  }

  .showcase-feature-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }

  .showcase-feature-desc {
    font-size: 0.9rem;
    opacity: 0.9;
    text-align: center;
    margin: 0;
  }

  .highlight-text {
    font-size: 1.4rem;
    font-weight: 600;
    color: #FCD34D;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    margin: 0;
  }

  /* Honest slide styles */
  .honest-slide {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    max-width: 700px;
  }

  .honest-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .honest-title {
    font-size: 2.5rem;
    font-weight: bold;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .honest-subtitle {
    font-size: 1.3rem;
    opacity: 0.9;
    margin: 0;
  }

  .honest-points {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .honest-point {
    font-size: 1.1rem;
    text-align: left;
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 12px;
    backdrop-filter: blur(10px);
  }

  .honest-message {
    font-style: italic;
    font-size: 1.2rem;
    opacity: 0.9;
    text-align: center;
    margin: 0;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  }

  /* CTA slide styles */
  .cta-slide {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .cta-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .cta-title {
    font-size: 2.5rem;
    font-weight: bold;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .cta-subtitle {
    font-size: 1.3rem;
    opacity: 0.9;
    margin: 0;
  }

  .cta-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    width: 100%;
    max-width: 600px;
  }

  .cta-feature {
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 12px;
    font-size: 1rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .cta-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .primary-cta,
  .secondary-cta {
    padding: 1rem 2rem;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    border: 2px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .primary-cta {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .secondary-cta {
    background: transparent;
    color: white;
  }

  .primary-cta:hover,
  .secondary-cta:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }

  /* Navigation styles */
  .navigation {
    position: absolute;
    bottom: 4rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-button {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 0.8rem;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .nav-button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  .nav-button svg {
    width: 24px;
    height: 24px;
  }

  .slide-indicators {
    display: flex;
    gap: 0.5rem;
  }

  .indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.5);
    background: transparent;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .indicator.active {
    background: white;
    border-color: white;
  }

  .indicator:hover {
    border-color: white;
    transform: scale(1.2);
  }

  /* Skip button */
  .skip-button {
    position: absolute;
    top: 2rem;
    right: 2rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 0.8rem 1.5rem;
    border-radius: 25px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .skip-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  /* Keyboard hints */
  .keyboard-hints {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .keyboard-hints span {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.3rem 0.6rem;
    border-radius: 15px;
    backdrop-filter: blur(10px);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .slide-container {
      width: 95%;
      padding: 1rem;
    }

    .title {
      font-size: 2.5rem;
    }

    .feature-title,
    .breakthrough-title,
    .showcase-title,
    .honest-title,
    .cta-title {
      font-size: 2rem;
    }

    .achievements-grid,
    .showcase-grid {
      grid-template-columns: 1fr;
    }

    .cta-buttons {
      flex-direction: column;
      align-items: center;
    }

    .navigation {
      bottom: 6rem;
    }

    .keyboard-hints {
      display: none;
    }
  }
</style>