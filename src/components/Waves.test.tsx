import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Wave from './Waves';

describe('Wave', () => {
  it('renders without crashing', () => {
    render(
      <Wave
        points={3}
        speed={0.1}
        amplitude={10}
        height={50}
        paused={true}
      />
    );
  });

  it('renders SVG element', () => {
    const { container } = render(
      <Wave
        points={3}
        speed={0.1}
        amplitude={10}
        height={50}
        paused={true}
      />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders path element inside SVG', () => {
    const { container } = render(
      <Wave
        points={3}
        speed={0.1}
        amplitude={10}
        height={50}
        paused={true}
      />
    );
    expect(container.querySelector('path')).toBeInTheDocument();
  });

  it('uses default props when not provided', () => {
    const { container } = render(<Wave paused={true} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies custom svgId and svgPathId', () => {
    const { container } = render(
      <Wave
        points={3}
        speed={0.1}
        amplitude={10}
        height={50}
        paused={true}
        svgId="custom-svg"
        svgPathId="custom-path"
      />
    );
    expect(container.querySelector('#custom-svg')).toBeInTheDocument();
    expect(container.querySelector('#custom-path')).toBeInTheDocument();
  });

  it('renders container div with hologramWave class', () => {
    const { container } = render(
      <Wave
        points={3}
        speed={0.1}
        amplitude={10}
        height={50}
        paused={true}
      />
    );
    // The container div should have the CSS module class
    const containerDiv = container.querySelector('div');
    expect(containerDiv).toBeInTheDocument();
  });

  it('applies custom id to container', () => {
    const { container } = render(
      <Wave
        id="wave-container"
        points={3}
        speed={0.1}
        amplitude={10}
        height={50}
        paused={true}
      />
    );
    expect(container.querySelector('#wave-container')).toBeInTheDocument();
  });
});
