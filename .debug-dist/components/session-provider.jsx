'use client';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
export function SessionProvider(_a) {
    var children = _a.children;
    return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
//# sourceMappingURL=session-provider.jsx.map