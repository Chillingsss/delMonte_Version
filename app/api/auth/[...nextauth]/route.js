import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const TWO_HOURS = 2 * 60 * 60; // 2 hours in seconds

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        twoFACode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        const url =
          process.env.NEXT_NODE_API_URL || "http://localhost:3002/login";

        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username and password are required");
        }

        const sanitizedUsername = credentials.username.trim();

        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: sanitizedUsername,
              password: credentials.password,
              twoFACode: credentials.twoFACode,
            }),
          });

          const data = await res.json();
          console.log("Backend Response:", data); // Debug log

          // If 2FA is required and no code provided
          if (
            !credentials.twoFACode &&
            data.message === "2FA code sent to your email."
          ) {
            console.log("2FA Required"); // Debug log
            return {
              email: sanitizedUsername,
              twoFA: true,
            };
          }

          // If 2FA code is invalid
          if (credentials.twoFACode && !res.ok) {
            throw new Error(data.error || "Invalid 2FA code");
          }

          // If 2FA is verified or not required
          if (res.ok) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              userLevel: data.user.userLevel,
            };
          }

          throw new Error(data.error || "Authentication failed");
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
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
    maxAge: TWO_HOURS, // Increased to 2 hours
  },
  jwt: {
    maxAge: TWO_HOURS,
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: TWO_HOURS,
        expires: new Date(Date.now() + TWO_HOURS * 1000), // Ensure correct expiration date
      },
    },
  },
});

export { handler as GET, handler as POST };