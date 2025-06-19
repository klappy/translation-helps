import React from 'react';

const FontTest = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'var(--font-family-primary)' }}>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '20px' }}>Font Loading Test</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontFamily: 'var(--font-family-primary)', marginBottom: '10px' }}>
          Figtree (Primary Font)
        </h2>
        <p style={{ fontFamily: 'var(--font-family-primary)', fontWeight: '300' }}>
          Light (300): The quick brown fox jumps over the lazy dog
        </p>
        <p style={{ fontFamily: 'var(--font-family-primary)', fontWeight: '400' }}>
          Regular (400): The quick brown fox jumps over the lazy dog
        </p>
        <p style={{ fontFamily: 'var(--font-family-primary)', fontWeight: '500' }}>
          Medium (500): The quick brown fox jumps over the lazy dog
        </p>
        <p style={{ fontFamily: 'var(--font-family-primary)', fontWeight: '600' }}>
          SemiBold (600): The quick brown fox jumps over the lazy dog
        </p>
        <p style={{ fontFamily: 'var(--font-family-primary)', fontWeight: '700' }}>
          Bold (700): The quick brown fox jumps over the lazy dog
        </p>
        <p style={{ fontFamily: 'var(--font-family-primary)', fontWeight: '800' }}>
          ExtraBold (800): The quick brown fox jumps over the lazy dog
        </p>
        <p style={{ fontFamily: 'var(--font-family-primary)', fontWeight: '900' }}>
          Black (900): The quick brown fox jumps over the lazy dog
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontFamily: 'var(--font-family-heading)', marginBottom: '10px' }}>
          Jura (Heading Font)
        </h2>
        <p style={{ fontFamily: 'var(--font-family-heading)', fontWeight: '300' }}>
          Light (300): The quick brown fox jumps over the lazy dog
        </p>
        <p style={{ fontFamily: 'var(--font-family-heading)', fontWeight: '400' }}>
          Regular (400): The quick brown fox jumps over the lazy dog
        </p>
        <p style={{ fontFamily: 'var(--font-family-heading)', fontWeight: '500' }}>
          Medium (500): The quick brown fox jumps over the lazy dog
        </p>
        <p style={{ fontFamily: 'var(--font-family-heading)', fontWeight: '600' }}>
          SemiBold (600): The quick brown fox jumps over the lazy dog
        </p>
        <p style={{ fontFamily: 'var(--font-family-heading)', fontWeight: '700' }}>
          Bold (700): The quick brown fox jumps over the lazy dog
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontFamily: 'var(--font-family-primary)', marginBottom: '10px' }}>
          CSS Utility Classes
        </h2>
        <p className="font-primary">Primary font class: The quick brown fox jumps over the lazy dog</p>
        <p className="font-heading">Heading font class: The quick brown fox jumps over the lazy dog</p>
        <p className="font-body">Body font class: The quick brown fox jumps over the lazy dog</p>
        <p className="font-mono">Mono font class: The quick brown fox jumps over the lazy dog</p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontFamily: 'var(--font-family-heading)', marginBottom: '10px' }}>
          Font Weight Classes
        </h2>
        <p className="font-heading font-light">Light: The quick brown fox jumps over the lazy dog</p>
        <p className="font-heading font-regular">Regular: The quick brown fox jumps over the lazy dog</p>
        <p className="font-heading font-medium">Medium: The quick brown fox jumps over the lazy dog</p>
        <p className="font-heading font-semibold">SemiBold: The quick brown fox jumps over the lazy dog</p>
        <p className="font-heading font-bold">Bold: The quick brown fox jumps over the lazy dog</p>
      </div>

      <div style={{ 
        padding: '15px', 
        backgroundColor: 'var(--color-surface)', 
        border: '1px solid var(--color-border)', 
        borderRadius: 'var(--radius-md)',
        marginTop: '20px'
      }}>
        <h3 style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--color-primary)' }}>
          Font Loading Status
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          If you can see distinct differences between Figtree and Jura fonts above, 
          the local font hosting is working correctly. Jura should appear more geometric 
          and technical compared to Figtree's friendlier appearance.
        </p>
      </div>
    </div>
  );
};

export default FontTest; 