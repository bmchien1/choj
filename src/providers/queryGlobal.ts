import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";

const useMutationAction = <TData = unknown, TVariables = void>(
    queryKey: string[],
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: UseMutationOptions<TData, Error, TVariables>
) => {
    const queryClient = useQueryClient();

    return useMutation<TData, Error, TVariables>({
        mutationFn,
        ...options,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey });
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            console.error("Mutation error:", error);
            options?.onError?.(error, variables, context);
        },
    });
};

export default useMutationAction;
