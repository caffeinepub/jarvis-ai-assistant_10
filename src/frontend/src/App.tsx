import React from 'react';
import {
    createRouter,
    createRoute,
    createRootRoute,
    RouterProvider,
    Outlet,
    redirect,
} from '@tanstack/react-router';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TransitionScreen from './pages/TransitionScreen';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';

// Auth guard wrapper component
function AuthGuard({ children }: { children: React.ReactNode }) {
    const { identity, isInitializing } = useInternetIdentity();
    const { data: profile, isLoading, isFetched } = useGetCallerUserProfile();

    if (isInitializing || isLoading) {
        return (
            <div className="min-h-screen bg-jarvis-dark flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-2 border-jarvis-cyan/50 border-t-jarvis-cyan rounded-full animate-spin mx-auto" />
                    <p className="font-orbitron text-xs text-cyan-jarvis tracking-widest">INITIALIZING...</p>
                </div>
            </div>
        );
    }

    if (!identity) {
        window.location.href = '/login';
        return null;
    }

    if (isFetched && profile === null) {
        window.location.href = '/login';
        return null;
    }

    return <>{children}</>;
}

// Root route
const rootRoute = createRootRoute({
    component: () => <Outlet />,
});

// Public routes
const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: LoginPage,
});

const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/register',
    component: RegisterPage,
});

// Protected routes
const transitionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/transition',
    component: () => (
        <AuthGuard>
            <TransitionScreen />
        </AuthGuard>
    ),
});

const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: () => (
        <AuthGuard>
            <DashboardPage />
        </AuthGuard>
    ),
});

const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings',
    component: () => (
        <AuthGuard>
            <SettingsPage />
        </AuthGuard>
    ),
});

// Index route - redirect to login
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    beforeLoad: () => {
        throw redirect({ to: '/login' });
    },
    component: () => null,
});

const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    registerRoute,
    transitionRoute,
    dashboardRoute,
    settingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const App: React.FC = () => {
    return <RouterProvider router={router} />;
};

export default App;
