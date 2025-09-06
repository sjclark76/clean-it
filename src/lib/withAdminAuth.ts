// src/lib/withAdminAuth.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/authOptions';
import { NextRequest, NextResponse } from 'next/server';

export type RouteContext = {
  params: Promise<Record<string, string>>;
};
export type RouteHandler = (
  request: NextRequest,
  context: RouteContext
) => Response | NextResponse | Promise<Response | NextResponse>;

export function withAdminAuth(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context) => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return handler(request, context);
  };
}
