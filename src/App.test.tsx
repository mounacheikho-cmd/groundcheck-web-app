import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fixture from './api/fixtures/aschaffenburg.json';
import { renderApp } from './test/renderApp';

describe('GroundCheck app', () => {
  beforeEach(() => {
    // 08:20 in Aschaffenburg, matching the recorded forecast.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-29T08:20:00+02:00'));
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(fixture), { status: 200 })),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('goes from the demo login to a decision', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await user.click(screen.getByRole('button', { name: /try the demo/i }));
    expect(await screen.findByRole('heading', { name: 'Hello, Markus' })).toBeInTheDocument();
    expect(await screen.findByText('17')).toBeInTheDocument(); // 16.7 °C, rounded

    await user.click(screen.getByRole('link', { name: 'Spray' }));
    const status = await screen.findByRole('heading', { level: 1, name: /status for spray/i });
    expect(status).toHaveTextContent('NO-GO');
    expect(screen.getByText('Wind is below limit until 10:00.')).toBeInTheDocument();
  });

  it('never shows a status when the forecast fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('oops', { status: 500 })),
    );
    sessionStorage.setItem('gc.user', JSON.stringify({ name: 'Markus', email: 'markus@example.com' }));
    renderApp('/result/dig');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'no status right now',
    );
    expect(screen.queryByText('GO')).not.toBeInTheDocument();
  });

  it('signing out goes to Welcome', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('gc.user', JSON.stringify({ name: 'Markus', email: 'markus@example.com' }));
    renderApp('/home');

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByRole('heading', { name: 'Welcome!' })).toBeInTheDocument();
  });

  it('sends signed-out visitors to Log in', () => {
    renderApp('/home');
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });
});
