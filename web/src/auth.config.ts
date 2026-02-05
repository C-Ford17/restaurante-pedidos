import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/admin') ||
                nextUrl.pathname.startsWith('/waiter') ||
                nextUrl.pathname.startsWith('/kitchen');

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // If logged in and on login page, redirect to dashboard?
                // Logic can be refined later based on user role
                // return Response.redirect(new URL('/admin/dashboard', nextUrl));
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                // Validamos que user exista y tenga las propiedades antes de asignarlas
                if ('role' in user) token.role = user.role;
                if ('name' in user) token.name = user.name;
                if ('organizationId' in user) token.organizationId = user.organizationId;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                // Aseguramos tipos en la sesión
                session.user.role = token.role as string;
                session.user.name = token.name as string;
                session.user.organizationId = token.organizationId as string | undefined;
            }
            return session;
        }
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
