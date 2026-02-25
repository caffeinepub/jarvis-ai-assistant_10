import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile } from '../backend';

// ── Profile ──────────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
    const { actor, isFetching: actorFetching } = useActor();

    const query = useQuery<UserProfile | null>({
        queryKey: ['currentUserProfile'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getCallerUserProfile();
        },
        enabled: !!actor && !actorFetching,
        retry: false,
    });

    return {
        ...query,
        isLoading: actorFetching || query.isLoading,
        isFetched: !!actor && query.isFetched,
    };
}

export function useSaveCallerUserProfile() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (profile: UserProfile) => {
            if (!actor) throw new Error('Actor not available');
            return actor.saveCallerUserProfile(profile);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        },
    });
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export function useRegister() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ username, email, password }: { username: string; email: string; password: string }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.register(username, email, password);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        },
    });
}

export function useLogin() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.login(email, password);
        },
        onSuccess: (profile) => {
            queryClient.setQueryData(['currentUserProfile'], profile);
        },
    });
}

// ── Settings ──────────────────────────────────────────────────────────────────

export function useSetWakeWord() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (wakeWord: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.setWakeWord(wakeWord);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        },
    });
}

export function useSetLanguage() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (language: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.setLanguage(language);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        },
    });
}

export function useSetMode() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (mode: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.setMode(mode);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        },
    });
}

export function useSetMentor() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (mentor: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.setMentor(mentor);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        },
    });
}

// ── Memory ────────────────────────────────────────────────────────────────────

export function useGetConversationMemory() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<string[]>({
        queryKey: ['conversationMemory'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getConversationMemory();
        },
        enabled: !!actor && !actorFetching,
    });
}

export function useSaveConversationEntry() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (entry: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.saveConversationEntry(entry);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversationMemory'] });
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        },
    });
}

export function useClearConversationMemory() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.clearConversationMemory();
        },
        onSuccess: () => {
            queryClient.setQueryData(['conversationMemory'], []);
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        },
    });
}
