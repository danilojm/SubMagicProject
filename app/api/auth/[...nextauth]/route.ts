
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';


console.log('Fetching NextAuth handler...');
console.log('Auth Options:', authOptions)

const handler = NextAuth(authOptions);

console.log('NextAuth handler initialized.');
console.log('Handler Type:', typeof handler);

export { handler as GET, handler as POST };
