import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
        error: "/login", // Error code passed in url query string as ?error=
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
            const isOnPatientPortal = nextUrl.pathname.startsWith("/patient")
            const isOnAdmin = nextUrl.pathname.startsWith("/admin")
            const isOnAuth = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register")

            if (isOnDashboard) {
                if (isLoggedIn && auth?.user?.role !== "PET_OWNER") return true
                return false // Redirect unauthenticated or pet owners
            } else if (isOnPatientPortal) {
                if (isLoggedIn && auth?.user?.role === "PET_OWNER") return true
                return false // Redirect unauthorized users
            } else if (isOnAdmin) {
                if (isLoggedIn && auth?.user?.role === "SUPER_ADMIN") return true
                return false // Redirect unauthorized users
            } else if (isLoggedIn && isOnAuth) {
                if (auth?.user?.role === "PET_OWNER") {
                    return Response.redirect(new URL("/patient/dashboard", nextUrl))
                }
                return Response.redirect(new URL("/dashboard", nextUrl))
            }
            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id || ""
                token.role = user.role || ""
                token.clinicId = user.clinicId || ""
                token.lastName = (user as any).lastName || ""
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.role = token.role
                session.user.clinicId = token.clinicId
                session.user.lastName = token.lastName as string
            }
            return session
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
