import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware({
  // Add public routes that don't require authentication
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};