import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const TWELVE_MINUTES = 12 * 60;

// Validate required environment variables
const requiredEnvVars = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXT_NODE_API_URL: process.env.NEXT_NODE_API_URL,
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
  }
});

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username and password are required");
        }

        try {
          const url =
            process.env.NEXT_NODE_API_URL || "http://localhost:3002/login";
          console.log(`Attempting authentication to: ${url}`);

          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
            credentials: "include",
          });

          const data = await res.json();

          // Log response status and data (excluding sensitive info)
          console.log(`Auth response status: ${res.status}`);
          console.log(
            "Auth response headers:",
            Object.fromEntries([...res.headers])
          );

          if (!res.ok) {
            const errorMessage =
              data.error || `HTTP error! status: ${res.status}`;
            console.error("Authentication failed:", errorMessage);
            throw new Error(errorMessage);
          }

          if (!data.user) {
            console.error("Invalid response format: missing user data");
            throw new Error(
              "Invalid response format from authentication server"
            );
          }

          // Successful authentication
          console.log(
            `Successful authentication for user: ${credentials.username}`
          );
          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            userLevel: data.user.userLevel,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login", // Custom error page
  },
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

    async redirect({ url, baseUrl }) {
      // Allows relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: TWELVE_MINUTES,
  },
  jwt: {
    maxAge: TWELVE_MINUTES,
    secret: process.env.NEXTAUTH_SECRET,
  },
  cookies: {
    sessionToken: {
      name: `${
        process.env.NODE_ENV === "production" ? "__Secure-" : ""
      }next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: TWELVE_MINUTES,
        expires: new Date(Date.now() + TWELVE_MINUTES * 1000),
        domain:
          process.env.NODE_ENV === "production" ? ".vercel.app" : "localhost", // Adjust domain as needed
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  site: process.env.NEXTAUTH_URL,
});

export { handler as GET, handler as POST };
