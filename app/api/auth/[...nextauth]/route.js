import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const TWELVE_MINUTES = 12 * 60;

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://delmonte-careers-api.vercel.app"
    : "http://localhost:3002";

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
          const res = await fetch(`${API_URL}/login`, {
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
});

export { handler as GET, handler as POST };
