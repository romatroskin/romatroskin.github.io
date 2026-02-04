import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import WavyBackground from './WavyBackground';

describe('WavyBackground', () => {
  it('renders without crashing', () => {
    render(
      <WavyBackground
        options={{
          points: 3,
          speed: 0.1,
          amplitude: 10,
          height: 50,
          paused: true // Pause animation for deterministic test
        }}
      />
    );
  });

  it('renders an SVG element', () => {
    const { container } = render(
      <WavyBackground
        options={{
          points: 3,
          speed: 0.1,
          amplitude: 10,
          height: 50,
          paused: true
        }}
      />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with custom id', () => {
    const { container } = render(
      <WavyBackground
        id="test-wave"
        options={{
          points: 3,
          speed: 0.1,
          amplitude: 10,
          height: 50,
          paused: true
        }}
      />
    );
    expect(container.querySelector('#test-wave')).toBeInTheDocument();
  });

  it('renders path element inside SVG', () => {
    const { container } = render(
      <WavyBackground
        options={{
          points: 3,
          speed: 0.1,
          amplitude: 10,
          height: 50,
          paused: true
        }}
      />
    );
    expect(container.querySelector('svg path')).toBeInTheDocument();
  });
});
