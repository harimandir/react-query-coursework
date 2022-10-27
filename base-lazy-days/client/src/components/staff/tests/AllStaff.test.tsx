import { screen } from '@testing-library/react';
import { rest } from 'msw';

import { server } from '../../../mocks/server';
import { renderWithQueryClient } from '../../../test-utils';
import { AllStaff } from '../AllStaff';

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
