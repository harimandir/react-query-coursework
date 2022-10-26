import jsonpatch from 'fast-json-patch';
import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
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
  const queryClient = useQueryClient();
  const { user, updateUser } = useUser();
  const toast = useCustomToast();

  const { mutate } = useMutation(
    (newData: User | null) => patchUserOnServer(newData, user),
    {
      onMutate: async (updatedUser: User | null) => {
        // cancel any outgoing queries for user data, so old server data
        // doesn't overwrite our optimistic update
        queryClient.cancelQueries(queryKeys.user);
        // take a snapshot of the previous user value
        const previousUserData = queryClient.getQueryData<User>(queryKeys.user);
        // optimistically update the cache with the new user value
        updateUser(updatedUser);
        // return context object with the previous user value
        return { previousUserData };
      },
      onError: (_error, _updatedUser, { previousUserData }) => {
        // roll back cache to previous value
        if (previousUserData) {
          updateUser(previousUserData);
        }
        toast({
          title: 'Update failed, reverting changes',
          status: 'error',
        });
      },
      onSuccess: (updatedUser: User | null) => {
        if (updatedUser) {
          updateUser(updatedUser);
          toast({
            title: 'User updated!',
            status: 'success',
          });
        }
      },
      onSettled: () => {
        // invalidate user query to make sure we're in sync with server data
        queryClient.invalidateQueries(queryKeys.user);
      },
    },
  );

  return mutate;
}
