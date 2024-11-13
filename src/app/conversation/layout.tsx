import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'


export default function ConversationLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return <section>
        <ClerkProvider>
          <SignedIn>{children}</SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </ClerkProvider>    
    </section>
  }