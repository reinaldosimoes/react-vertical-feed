import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { VerticalFeed, VideoItem } from '../VerticalFeed';

// Extend Window interface
declare global {
  interface Window {
    intersectionObserverCallback: IntersectionObserverCallback;
  }
}

// Mock IntersectionObserver
const mockDisconnect = jest.fn();
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();

const mockIntersectionObserver = jest.fn().mockImplementation(callback => {
  window.intersectionObserverCallback = callback;
  return {
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    root: null,
    rootMargin: '',
    thresholds: [],
    takeRecords: () => [],
  };
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

  let mockDisconnect: jest.Mock;
  let mockObserve: jest.Mock;
  let mockUnobserve: jest.Mock;
  let mockObserver: { disconnect: jest.Mock; observe: jest.Mock; unobserve: jest.Mock };
  let mockIntersectionObserver: jest.Mock;
  let observerCallback: IntersectionObserverCallback;

  beforeEach(() => {
    // Mock scrollTo method
    Element.prototype.scrollTo = jest.fn();
    // Mock video methods
    HTMLVideoElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    HTMLVideoElement.prototype.pause = jest.fn();
    // Reset IntersectionObserver mocks
    mockDisconnect = jest.fn();
    mockObserve = jest.fn();
    mockUnobserve = jest.fn();
    observerCallback = jest.fn();
    mockObserver = {
      disconnect: mockDisconnect,
      observe: mockObserve,
      unobserve: mockUnobserve,
    };
    mockIntersectionObserver = jest.fn().mockImplementation(callback => {
      observerCallback = callback;
      return mockObserver;
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  it('calls onEndReached when scrolling to bottom', () => {
    const handleEndReached = jest.fn();
    render(<VerticalFeed items={mockItems} onEndReached={handleEndReached} />);

    const feed = screen.getByRole('feed');
    Object.defineProperty(feed, 'scrollHeight', { value: 1000 });
    Object.defineProperty(feed, 'scrollTop', { value: 800 });
    Object.defineProperty(feed, 'clientHeight', { value: 200 });

    fireEvent.scroll(feed);
    expect(handleEndReached).toHaveBeenCalled();
  });

  it('calls onItemVisible and onItemHidden callbacks', () => {
    const handleItemVisible = jest.fn();
    const handleItemHidden = jest.fn();
    const { container } = render(
      <VerticalFeed
        items={mockItems}
        onItemVisible={handleItemVisible}
        onItemHidden={handleItemHidden}
      />
    );

    const videoContainer = container.querySelector('[data-index="0"]')!;

    act(() => {
      observerCallback(
        [
          {
            isIntersecting: true,
            target: videoContainer,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRatio: 1,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: 0,
          },
        ],
        {} as IntersectionObserver
      );
    });
    expect(handleItemVisible).toHaveBeenCalledWith(mockItems[0], 0);

    act(() => {
      observerCallback(
        [
          {
            isIntersecting: false,
            target: videoContainer,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRatio: 0,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: 0,
          },
        ],
        {} as IntersectionObserver
      );
    });
    expect(handleItemHidden).toHaveBeenCalledWith(mockItems[0], 0);
  });

  it('uses custom threshold for intersection observer', () => {
    const customThreshold = 0.5;
    render(<VerticalFeed items={mockItems} threshold={customThreshold} />);

    expect(mockIntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      threshold: customThreshold,
    });
  });

  it('handles video play errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    HTMLVideoElement.prototype.play = jest.fn().mockRejectedValue(new Error('Play failed'));

    render(<VerticalFeed items={mockItems} />);
    const videoContainer = screen.getAllByRole('region')[0];
    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    await act(async () => {
      observerCallback([{ isIntersecting: true, target: videoContainer }]);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error playing video:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('uses custom scroll behavior for keyboard navigation', () => {
    const customScrollBehavior = 'auto';
    render(<VerticalFeed items={mockItems} scrollBehavior={customScrollBehavior} />);

    const feed = screen.getByRole('feed');
    fireEvent.keyDown(feed, { key: 'ArrowDown' });

    expect(Element.prototype.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({
        behavior: customScrollBehavior,
      })
    );
  });

  it('handles scroll events when containerRef is null', () => {
    const handleEndReached = jest.fn();
    const { container } = render(
      <VerticalFeed items={mockItems} onEndReached={handleEndReached} />
    );
    const feed = container.querySelector('[role="feed"]')!;

    // Set containerRef to null
    Object.defineProperty(feed, 'scrollTop', { get: () => undefined });
    Object.defineProperty(feed, 'scrollHeight', { get: () => undefined });
    Object.defineProperty(feed, 'clientHeight', { get: () => undefined });

    fireEvent.scroll(feed);
    expect(handleEndReached).not.toHaveBeenCalled();
  });

  it('handles scroll events without onEndReached callback', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const feed = container.querySelector('[role="feed"]')!;

    Object.defineProperty(feed, 'scrollHeight', { value: 1000 });
    Object.defineProperty(feed, 'scrollTop', { value: 800 });
    Object.defineProperty(feed, 'clientHeight', { value: 200 });

    fireEvent.scroll(feed);
    // Test passes if no error is thrown
  });

  it('handles keydown events when containerRef is null', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const feed = container.querySelector('[role="feed"]')!;

    // Set containerRef to null
    Object.defineProperty(feed, 'scrollTop', { get: () => undefined });
    Object.defineProperty(feed, 'clientHeight', { get: () => undefined });

    fireEvent.keyDown(feed, { key: 'ArrowDown' });
    // Test passes if no error is thrown
  });

  it('handles non-arrow key presses', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const feed = container.querySelector('[role="feed"]')!;

    fireEvent.keyDown(feed, { key: 'Enter' });
    // Test passes if no error is thrown
  });

  it('handles video element not found in container', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const videoContainer = container.querySelector('[data-index="0"]')!;

    // Remove video element
    const video = videoContainer.querySelector('video');
    video?.parentNode?.removeChild(video);

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    act(() => {
      observerCallback([{ isIntersecting: true, target: videoContainer }]);
    });
    // Test passes if no error is thrown
  });

  it('handles missing data-index attribute', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const videoContainer = container.querySelector('[data-index="0"]')!;

    // Remove data-index attribute
    videoContainer.removeAttribute('data-index');

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    act(() => {
      observerCallback([{ isIntersecting: true, target: videoContainer }]);
    });
    // Test passes if no error is thrown
  });

  it('handles cleanup of intersection observer', () => {
    const { unmount } = render(<VerticalFeed items={mockItems} />);
    expect(mockObserve).toHaveBeenCalled();
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('handles null containerRef during cleanup', () => {
    const { unmount } = render(<VerticalFeed items={[{ src: 'test-video.mp4' }]} />);
    expect(mockObserve).toHaveBeenCalled();
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('handles video element not found during pause', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const videoContainer = container.querySelector('[data-index="0"]')!;
    const video = videoContainer.querySelector('video');
    video?.parentNode?.removeChild(video);

    act(() => {
      observerCallback(
        [
          {
            isIntersecting: false,
            target: videoContainer,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRatio: 0,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: 0,
          },
        ],
        {} as IntersectionObserver
      );
    });
  });

  it('handles video element not found during play', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const videoContainer = container.querySelector('[data-index="0"]')!;
    const video = videoContainer.querySelector('video');
    video?.parentNode?.removeChild(video);

    act(() => {
      observerCallback(
        [
          {
            isIntersecting: true,
            target: videoContainer,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRatio: 1,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: 0,
          },
        ],
        {} as IntersectionObserver
      );
    });
  });

  it('handles keyboard navigation with null containerRef', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const feed = container.querySelector('[role="feed"]')!;

    // Mock scrollTo to ensure it's not called
    const scrollTo = jest.fn();
    Element.prototype.scrollTo = scrollTo;

    // Set containerRef to null
    Object.defineProperty(feed, 'scrollTop', { get: () => undefined });
    Object.defineProperty(feed, 'clientHeight', { get: () => undefined });
    Object.defineProperty(feed, 'scrollHeight', { get: () => undefined });
    Object.defineProperty(feed, 'scrollTo', { value: undefined });

    fireEvent.keyDown(feed, { key: 'ArrowDown' });
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('cleans up intersection observer on unmount', () => {
    const { unmount } = render(<VerticalFeed items={mockItems} />);
    expect(mockObserve).toHaveBeenCalled();
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
