import jsonpatch from 'fast-json-patch';
import { UseMutateFunction, useMutation } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from './useUser';

async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: { ...getJWTHeader(originalData) },
    },
  );
  return data.user;
}

type PatchUserMutation = UseMutateFunction<User, unknown, User | null, unknown>;

export function usePatchUser(): PatchUserMutation {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();

  const { mutate } = useMutation(
    (newData: User | null) => patchUserOnServer(newData, user),
    {
      onSuccess: (updatedUser: User | null) => {
        if (updatedUser) {
          updateUser(updatedUser);
          toast({
            title: 'User updated!',
            status: 'success',
          });
        }
      },
    },
  );

  return mutate;
}
