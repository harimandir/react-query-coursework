import { render, RenderResult, screen } from '@testing-library/react';
import { rest } from 'msw';
import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';

import { server } from '../../../mocks/server';
import { generateQueryClient } from '../../../react-query/queryClient';
import { AllStaff } from '../AllStaff';

setLogger({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
});

const generateTestQueryClient = () => {
  const queryClient = generateQueryClient();
  const options = queryClient.getDefaultOptions();
  options.queries = { ...options.queries, retry: 0 };
  return queryClient;
};

const renderWithQueryClient = (
  ui: ReactElement,
  client?: QueryClient,
): RenderResult => {
  const queryClient = client ?? generateTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

test('renders response from query', async () => {
  renderWithQueryClient(<AllStaff />);
  const staff = await screen.findAllByRole('heading', {
    name: /divya|sandra|michael|mateo/i,
  });
  expect(staff).toHaveLength(4);
});

test('handles query error', async () => {
  server.use(
    rest.get('http://localhost:3030/staff', (req, res, ctx) => {
      return res.once(ctx.status(500));
    }),
  );

  renderWithQueryClient(<AllStaff />);
  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent('Request failed with status code 500');
});
