import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { VerticalFeed, MediaItem } from '../VerticalFeed';

describe('VerticalFeed', () => {
  const mockItems: MediaItem[] = [
    { type: 'image' as const, src: 'test-image.jpg', id: '1' },
    { type: 'video' as const, src: 'test-video.mp4', id: '2' },
  ];

  beforeEach(() => {
    // Mock scrollTo method
    Element.prototype.scrollTo = jest.fn();
  });

  it('renders without crashing', () => {
    render(<VerticalFeed items={mockItems} />);
    expect(screen.getByRole('feed')).toBeInTheDocument();
  });

  it('renders the correct number of items', () => {
    render(<VerticalFeed items={mockItems} />);
    const items = screen.getAllByRole('region');
    expect(items).toHaveLength(mockItems.length);
  });

  it('calls onItemClick when an item is clicked', () => {
    const handleItemClick = jest.fn();
    render(<VerticalFeed items={mockItems} onItemClick={handleItemClick} />);

    const firstItem = screen.getAllByRole('region')[0];
    fireEvent.click(firstItem);

    expect(handleItemClick).toHaveBeenCalledWith(mockItems[0], 0);
  });

  it('renders loading components for each item initially', () => {
    const loadingComponent = <div data-testid="loading">Loading...</div>;
    render(<VerticalFeed items={mockItems} loadingComponent={loadingComponent} />);

    const loadingElements = screen.getAllByTestId('loading');
    expect(loadingElements).toHaveLength(mockItems.length);
  });

  it('renders error component when media fails to load', () => {
    const errorComponent = <div data-testid="error">Error occurred</div>;
    const { container } = render(
      <VerticalFeed items={mockItems} errorComponent={errorComponent} />
    );

    // Find the first image using querySelector
    const image = container.querySelector('img') as HTMLImageElement;
    expect(image).toHaveAttribute('src', 'test-image.jpg');

    // Simulate error
    act(() => {
      fireEvent.error(image);
    });

    expect(screen.getByTestId('error')).toBeInTheDocument();
  });

  it('applies custom className and style', () => {
    const className = 'custom-feed';
    const style = { backgroundColor: 'red' };

    render(<VerticalFeed items={mockItems} className={className} style={style} />);

    const feed = screen.getByRole('feed');
    expect(feed).toHaveClass(className);
    expect(feed).toHaveStyle(style);
  });

  it('handles media load events correctly', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);

    // Find the first image using querySelector
    const image = container.querySelector('img') as HTMLImageElement;
    expect(image).toHaveAttribute('src', 'test-image.jpg');

    act(() => {
      fireEvent.load(image);
    });

    expect(image).toHaveStyle({ display: 'block' });
  });

  it('handles keyboard navigation', () => {
    render(<VerticalFeed items={mockItems} />);
    const feed = screen.getByRole('feed');

    fireEvent.keyDown(feed, { key: 'ArrowDown' });
    expect(Element.prototype.scrollTo).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(feed, { key: 'ArrowUp' });
    expect(Element.prototype.scrollTo).toHaveBeenCalledTimes(2);
  });
});
