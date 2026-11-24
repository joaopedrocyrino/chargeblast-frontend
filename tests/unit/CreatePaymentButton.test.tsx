import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CreatePaymentButton } from '@/features/payments/components/CreatePaymentButton';

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const capacity = (remaining: number) => ({
  total: 3000 - remaining,
  limit: 3000,
  remaining,
  canCreate: remaining > 0,
});

const created = {
  id: 'pi_abcdefghijklmnopqrstuvwx',
  amountMinor: 4999,
  currency: 'USD',
  status: 'succeeded',
  createdAt: '2026-06-15T12:00:00.000Z',
  customer: {},
  paymentMethod: {},
  events: [],
};

describe('CreatePaymentButton', () => {
  it('does not open the form when the payment limit is reached', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(json(200, capacity(0)));
    render(<CreatePaymentButton onCreated={vi.fn()} />);
    await userEvent.click(screen.getByTestId('create-payment'));

    expect(await screen.findByText('Payment limit reached')).toBeInTheDocument();
    expect(screen.getByText(/holds at most 3,000 payments/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Amount')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/payments/capacity', expect.anything());
  });

  it('validates, then creates the payment and reports it', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json(200, capacity(2100)))
      .mockResolvedValueOnce(json(201, created));
    const onCreated = vi.fn();
    render(<CreatePaymentButton onCreated={onCreated} />);
    await userEvent.click(screen.getByTestId('create-payment'));
    expect(await screen.findByText(/2,100 left/)).toBeInTheDocument();

    const submit = screen.getAllByRole('button', { name: 'Create payment' }).at(-1)!;
    await userEvent.click(submit);
    expect(screen.getByText('Enter an amount.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await userEvent.type(screen.getByLabelText('Amount'), '49.99');
    await userEvent.type(screen.getByLabelText('Email'), 'jenny@example.com');
    await userEvent.type(screen.getByLabelText('Card last 4'), '4242');
    await userEvent.click(submit);

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(created));
    const [url, init] = fetchMock.mock.calls[1]!;
    expect(url).toBe('/api/v1/payments');
    expect(JSON.parse(String(init?.body))).toMatchObject({
      amount: '49.99',
      currency: 'USD',
      customerEmail: 'jenny@example.com',
      method: 'card',
      brand: 'visa',
      last4: '4242',
    });
    expect(screen.queryByLabelText('Amount')).not.toBeInTheDocument();
  });

  it('shows the API’s field errors on the matching inputs', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json(200, capacity(10)))
      .mockResolvedValueOnce(
        json(400, {
          code: 'VALIDATION_FAILED',
          message: 'Request validation failed',
          details: [{ field: 'customerEmail', message: 'must be a valid email address' }],
        }),
      );
    render(<CreatePaymentButton onCreated={vi.fn()} />);
    await userEvent.click(screen.getByTestId('create-payment'));
    await userEvent.type(await screen.findByLabelText('Amount'), '10');
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.co');
    await userEvent.type(screen.getByLabelText('Card last 4'), '1111');
    await userEvent.click(screen.getAllByRole('button', { name: 'Create payment' }).at(-1)!);

    expect(await screen.findByText('Must be a valid email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('switches to the limit message if the cap is hit while the form is open', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json(200, capacity(1)))
      .mockResolvedValueOnce(json(409, { code: 'PAYMENT_LIMIT_REACHED', message: 'limit' }));
    render(<CreatePaymentButton onCreated={vi.fn()} />);
    await userEvent.click(screen.getByTestId('create-payment'));
    await userEvent.type(await screen.findByLabelText('Amount'), '10');
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.co');
    await userEvent.type(screen.getByLabelText('Card last 4'), '1111');
    await userEvent.click(screen.getAllByRole('button', { name: 'Create payment' }).at(-1)!);

    expect(await screen.findByText('Payment limit reached')).toBeInTheDocument();
  });
});
