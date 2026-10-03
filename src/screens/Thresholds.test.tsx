import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderApp } from '../test/renderApp';

describe('Edit thresholds', () => {
  beforeEach(() => {
    sessionStorage.setItem('gc.user', JSON.stringify({ name: 'Markus', email: 'markus@example.com' }));
  });

  it('shows the recommended values with units', () => {
    renderApp('/thresholds');
    const spray = screen.getByRole('group', { name: 'Spray' });
    expect(within(spray).getByLabelText('Max wind for Spray, in km/h')).toHaveValue('15');
    expect(within(spray).getByLabelText('Min rain for Spray, in mm/h')).toHaveValue('');
  });

  it('blocks saving when a minimum is higher than its maximum', async () => {
    renderApp('/thresholds');
    const spray = screen.getByRole('group', { name: 'Spray' });
    await userEvent.selectOptions(within(spray).getByLabelText('Min wind for Spray, in km/h'), '20');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(within(spray).getByRole('alert')).toHaveTextContent('Min wind must not be higher than max wind');
    expect(localStorage.getItem('gc.thresholds')).toBeNull();
  });

  it('saves valid changes', async () => {
    renderApp('/thresholds');
    const dig = screen.getByRole('group', { name: 'Dig' });
    await userEvent.selectOptions(within(dig).getByLabelText('Max wind for Dig, in km/h'), '30');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    const saved = JSON.parse(localStorage.getItem('gc.thresholds') ?? '{}');
    expect(saved.dig.maxWind).toBe(30);
  });
});
