import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';
import { setItemVisibility, setMediaPaused, setReducedMotion } from './test-setup';

describe('demo application', () => {
  it('renders three distinct local videos with stable feed items', () => {
    const { container } = render(<App />);
    const videos = [...container.querySelectorAll('video')];

    expect(videos).toHaveLength(3);
    expect(videos.map(video => new URL(video.src).pathname)).toEqual([
      '/videos/clouds.mp4',
      '/videos/wind.mp4',
      '/videos/grasshopper.mp4',
    ]);
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  it('exposes named controls and their selected states', () => {
    render(<App />);

    expect(screen.getByRole('tab', { name: 'Sports' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: 'Pause video' })).toBeVisible();
    expect(screen.getByRole('button', { name: /Like, 328\.4K likes/ })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByRole('button', { name: /Bookmark, 42\.1K bookmarks/ })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });

  it('updates the playback control after pointer playback changes', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const video = container.querySelector('video')!;
    setMediaPaused(video, false);
    fireEvent.play(video);

    await user.click(screen.getByRole('button', { name: 'Pause video' }));
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Play video' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Play video' }));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Pause video' })).toBeVisible();
  });

  it('keeps the visible playback control synchronized with the feed Space shortcut', async () => {
    const { container } = render(<App />);
    const feed = screen.getByRole('feed');
    const video = container.querySelector('video')!;
    setMediaPaused(video, false);
    fireEvent.play(video);

    fireEvent.keyDown(feed, { key: ' ' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Play video' })).toBeVisible());

    fireEvent.keyDown(feed, { key: ' ' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Pause video' })).toBeVisible());
  });

  it('keeps playback state synchronized when a feed item owns the Space shortcut', async () => {
    const { container } = render(<App />);
    const article = screen.getAllByRole('article')[0];
    const video = container.querySelector('video')!;
    setMediaPaused(video, false);

    fireEvent.keyDown(article, { key: ' ' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Play video' })).toBeVisible());

    fireEvent.keyDown(article, { key: ' ' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Pause video' })).toBeVisible());
  });

  it('does not show a paused state during an automatic visibility handoff', () => {
    const { container } = render(<App />);
    const video = container.querySelector('video')!;
    setMediaPaused(video, false);
    fireEvent.play(video);

    setMediaPaused(video, true);
    fireEvent.pause(video);

    expect(screen.getByRole('button', { name: 'Pause video' })).toBeVisible();
    expect(container.querySelector('.pause-indicator')).not.toHaveClass('visible');
  });

  it('clears a stale Play state when the same feed item becomes visible again', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const article = screen.getAllByRole('article')[0];
    const video = container.querySelector('video')!;

    setItemVisibility(article, true, 1);
    await user.click(screen.getByRole('button', { name: 'Pause video' }));
    expect(screen.getByRole('button', { name: 'Play video' })).toBeVisible();

    setItemVisibility(article, false, 0);
    setItemVisibility(article, true, 1);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Pause video' })).toBeVisible());
    expect(container.querySelector('.pause-indicator')).not.toHaveClass('visible');
  });

  it('shows the Play state when the video reports a load error', () => {
    const { container } = render(<App />);
    const video = container.querySelector('video')!;

    fireEvent.error(video);

    expect(screen.getByRole('button', { name: 'Play video' })).toBeVisible();
    expect(container.querySelector('.pause-indicator')).toHaveClass('visible');
  });

  it('keeps the paused state when the browser rejects playback', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const video = container.querySelector('video')!;
    setMediaPaused(video, false);
    await user.click(screen.getByRole('button', { name: 'Pause video' }));
    Object.defineProperty(video, 'play', {
      configurable: true,
      value: vi.fn().mockRejectedValue(new Error('Playback blocked')),
    });

    await user.click(screen.getByRole('button', { name: 'Play video' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Play video' })).toBeVisible());
  });

  it('starts videos paused when the user requests reduced motion', () => {
    setReducedMotion(true);
    const { container } = render(<App />);
    const videos = [...container.querySelectorAll('video')];

    expect(videos.every(video => !video.autoplay)).toBe(true);
    expect(screen.getByRole('button', { name: 'Play video' })).toBeVisible();
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(3);
  });

  it('changes categories with native tab buttons', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: 'Gaming' }));

    expect(screen.getByRole('tab', { name: 'Gaming' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Sports' })).toHaveAttribute('aria-selected', 'false');
  });

  it('changes persistent action and navigation states through named buttons', async () => {
    const user = userEvent.setup();
    render(<App />);

    const likeButton = screen.getByRole('button', { name: /Like, 328\.4K likes/ });
    const bookmarkButton = screen.getByRole('button', { name: /Bookmark, 42\.1K bookmarks/ });
    await user.click(likeButton);
    await user.click(bookmarkButton);
    await user.click(screen.getByRole('button', { name: /Friends/ }));

    expect(likeButton).toHaveAttribute('aria-pressed', 'true');
    expect(bookmarkButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Friends/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });
});
