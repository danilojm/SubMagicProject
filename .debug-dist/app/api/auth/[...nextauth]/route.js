import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
var handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
//# sourceMappingURL=route.js.map