import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    mentor: string;
    username: string;
    mode: string;
    password: string;
    email: string;
    language: string;
    wakeWord: string;
    conversationMemory: Array<string>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearConversationMemory(): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversationMemory(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    login(email: string, password: string): Promise<UserProfile>;
    register(username: string, email: string, password: string): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveConversationEntry(entry: string): Promise<string>;
    setLanguage(newLanguage: string): Promise<string>;
    setMentor(newMentor: string): Promise<string>;
    setMode(newMode: string): Promise<string>;
    setWakeWord(newWakeWord: string): Promise<string>;
}
