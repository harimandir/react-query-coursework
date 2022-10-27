import { act, renderHook } from '@testing-library/react-hooks';

import { Staff } from '../../../../../shared/types';
import { createQueryClientWrapper } from '../../../test-utils';
import { useStaff } from '../hooks/useStaff';

test('filter staff', async () => {
  const { result, waitFor } = renderHook(useStaff, {
    wrapper: createQueryClientWrapper(),
  });

  let allStaff: Staff[];

  await waitFor(() => {
    const { staff, filter } = result.current;
    expect(filter).toBe('all');
    allStaff = Object.values(staff).flat();
    expect(allStaff.length).toBeGreaterThan(0);
  });

  const { setFilter } = result.current;
  act(() => setFilter('massage'));

  await waitFor(() => {
    const { staff, filter } = result.current;
    expect(filter).toBe('massage');
    const massageStaff = Object.values(staff).flat();
    expect(massageStaff).not.toEqual(allStaff);
  });
});
