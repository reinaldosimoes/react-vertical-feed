import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { VerticalFeed, VideoItem } from '../VerticalFeed';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe('VerticalFeed', () => {
  const mockItems: VideoItem[] = [
    {
      src: 'test-video-1.mp4',
      id: '1',
      controls: true,
      autoPlay: true,
      muted: true,
      playsInline: true,
    },
    {
      src: 'test-video-2.mp4',
      id: '2',
      controls: true,
      autoPlay: true,
      muted: true,
      playsInline: true,
    },
  ];

  beforeEach(() => {
    // Mock scrollTo method
    Element.prototype.scrollTo = jest.fn();
    // Mock video methods
    HTMLVideoElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    HTMLVideoElement.prototype.pause = jest.fn();
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

  it('renders videos with correct attributes', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const videos = container.querySelectorAll('video');

    videos.forEach((video, index) => {
      expect(video).toHaveAttribute('src', mockItems[index].src);
      expect(video.controls).toBe(true);
      expect(video.autoplay).toBe(true);
      expect(video.muted).toBe(true);
      expect(video.playsInline).toBe(true);
    });
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

  it('renders error component when video fails to load', () => {
    const errorComponent = <div data-testid="error">Error occurred</div>;
    const { container } = render(
      <VerticalFeed items={mockItems} errorComponent={errorComponent} />
    );

    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video).toHaveAttribute('src', 'test-video-1.mp4');

    act(() => {
      fireEvent.error(video);
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

  it('handles video load events correctly', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);

    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video).toHaveAttribute('src', 'test-video-1.mp4');

    act(() => {
      fireEvent.loadedData(video);
    });

    expect(video).toHaveStyle({ display: 'block' });
  });

  it('handles keyboard navigation', () => {
    render(<VerticalFeed items={mockItems} />);
    const feed = screen.getByRole('feed');

    fireEvent.keyDown(feed, { key: 'ArrowDown' });
    expect(Element.prototype.scrollTo).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(feed, { key: 'ArrowUp' });
    expect(Element.prototype.scrollTo).toHaveBeenCalledTimes(2);
  });

  it('plays video when it becomes visible', async () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const video = container.querySelector('video') as HTMLVideoElement;
    const videoContainer = video.parentElement!;

    // Get the callback from the mock
    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    await act(async () => {
      observerCallback([{ isIntersecting: true, target: videoContainer }]);
    });

    expect(video.play).toHaveBeenCalled();
  });

  it('pauses video when it becomes hidden', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const video = container.querySelector('video') as HTMLVideoElement;
    const videoContainer = video.parentElement!;

    // Get the callback from the mock
    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    act(() => {
      observerCallback([{ isIntersecting: false, target: videoContainer }]);
    });

    expect(video.pause).toHaveBeenCalled();
  });
});
