// src/lib/withAdminAuth.ts
import { getServerSession, Session as NextAuthSession } from 'next-auth';
import { authOptions } from '@/shared/authOptions';
import { NextRequest, NextResponse } from 'next/server';

// P is the type of `params` that the *original handler* expects in its context.
// Defaults to `undefined` if the handler doesn't expect/use params (e.g., non-dynamic routes).
type OriginalRouteHandler<P = undefined> = (
  request: NextRequest,
  context: { params: P; session: NextAuthSession } // The handler receives params of type P and a session
) => Promise<NextResponse> | NextResponse;

// TNextContextParams is the type of `params` in the context object Next.js provides to the *exported HOC*.
// This generic helps align the types from Next.js's perspective with what the OriginalRouteHandler expects.
export function withAdminAuth<TNextContextParams = undefined>(
  handler: OriginalRouteHandler<TNextContextParams>
) {
  return async (
    request: NextRequest,
    // contextFromNext is what Next.js passes to the *exported* function (the result of withAdminAuth)
    // For dynamic routes, contextFromNext will be { params: TNextContextParams }
    // For non-dynamic routes, contextFromNext might be undefined or an empty object.
    contextFromNext?: { params: TNextContextParams }
  ): Promise<NextResponse> => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Construct the context to be passed to the original handler
    const handlerReceivedContext = {
      // Pass along params if they exist from Next.js's context.
      // The `as TNextContextParams` helps ensure type consistency.
      // If contextFromNext is undefined, params will be undefined.
      // This aligns with P defaulting to `undefined` in OriginalRouteHandler.
      params: (contextFromNext?.params ?? undefined) as TNextContextParams,
      session,
    };

    return handler(request, handlerReceivedContext);
  };
}
