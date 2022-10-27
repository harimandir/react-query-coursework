import { act, renderHook } from '@testing-library/react-hooks';

import { Appointment } from '../../../../../shared/types';
import { createQueryClientWrapper } from '../../../test-utils';
import { useAppointments } from '../hooks/useAppointments';

test('filter appointments by availability', async () => {
  const { result, waitFor } = renderHook(useAppointments, {
    wrapper: createQueryClientWrapper(),
  });

  let filteredAppointments: Appointment[];

  await waitFor(() => {
    const { appointments, showAll } = result.current;
    expect(showAll).toBe(false);
    filteredAppointments = Object.values(appointments).flat();
    expect(filteredAppointments.length).toBeGreaterThan(0);
  });

  const { setShowAll } = result.current;
  act(() => setShowAll(true));

  await waitFor(() => {
    const { appointments, showAll } = result.current;
    expect(showAll).toBe(true);
    const unfilteredAppointments = Object.values(appointments).flat();
    expect(unfilteredAppointments).not.toEqual(filteredAppointments);
  });
});
