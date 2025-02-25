import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const TWELVE_MINUTES = 12 * 60;

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username and password are required");
        }

        try {
          const url =
            process.env.NEXT_NODE_API_URL || "http://localhost:3002/login";
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (res.ok && data.user) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              userLevel: data.user.userLevel,
            };
          }

          throw new Error(data.error || "Authentication failed");
        } catch (error) {
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.userLevel = user.userLevel;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.userLevel = token.userLevel;
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: TWELVE_MINUTES,
  },
  jwt: {
    maxAge: TWELVE_MINUTES,
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: TWELVE_MINUTES,
        expires: new Date(Date.now() + TWELVE_MINUTES * 1000), // Ensure correct expiration date
      },
    },
  },
});

export { handler as GET, handler as POST };
