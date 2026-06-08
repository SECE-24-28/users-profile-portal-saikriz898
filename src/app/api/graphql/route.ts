import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '@/lib/graphql/schema';
import { resolvers } from '@/lib/graphql/resolvers';
import { getUserFromRequest } from '@/lib/auth/jwt';
import { NextRequest } from 'next/server';

const server = new ApolloServer({ typeDefs, resolvers });

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => {
    const user = getUserFromRequest(req);
    return { user };
  },
});

export { handler as GET, handler as POST };
