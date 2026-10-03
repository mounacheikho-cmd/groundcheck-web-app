import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../context/ThemeContext';
import type { Decision } from '../domain/types';
import { DecisionCard } from './DecisionCard';

const decision: Decision = {
  task: 'dig',
  state: 'no-go',
  headline: 'Wind is above limit until 12:00.',
  validUntil: '12:00',
  checks: [],
  current: { time: '2026-09-29T09:00', temperature: 23, precipitation: 0, windSpeed: 67, windGusts: 80 },
};

describe('DecisionCard', () => {
  it('shows the task, the state and the reason', () => {
    render(<DecisionCard decision={decision} />, { wrapper: ThemeProvider });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('NO-GO');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Status for Dig');
    expect(screen.getByText('Wind is above limit until 12:00.')).toBeInTheDocument();
  });

  it('refreshes the forecast on request', async () => {
    const onRefresh = vi.fn();
    render(<DecisionCard decision={decision} onRefresh={onRefresh} />, { wrapper: ThemeProvider });
    await userEvent.click(screen.getByRole('button', { name: 'Refresh forecast' }));
    expect(onRefresh).toHaveBeenCalledOnce();
  });
});
