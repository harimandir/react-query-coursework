import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';

import { Appointment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';

async function removeAppointmentUser(appointment: Appointment): Promise<void> {
  const patchData = [{ op: 'remove', path: '/userId' }];
  await axiosInstance.patch(`/appointment/${appointment.id}`, {
    data: patchData,
  });
}

type CancelAppointmentMutation = UseMutateFunction<
  void,
  unknown,
  Appointment,
  unknown
>;

export function useCancelAppointment(): CancelAppointmentMutation {
  const queryClient = useQueryClient();
  const toast = useCustomToast();

  const { mutate } = useMutation(removeAppointmentUser, {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.appointments]);
      toast({
        title: 'You have cancelled the appointment!',
        status: 'success',
      });
    },
  });

  return mutate;
}
