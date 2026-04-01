import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { usersRepository } from "@/repositories/users.repository";
import { loginSchema } from "@/lib/validations/auth.schema";
import type { Role } from "@/lib/validations/roles";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      emailVerified: boolean;
    };
  }
  interface User {
    role: Role;
    emailVerified: boolean;
  }
}

const config = {
  // adapter: DrizzleAdapter(db),

  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await usersRepository.findByEmail(parsed.data.email);
        if (!user || !user.passwordHash) return null;

        if (!user.emailVerified) {
          throw new Error("Please verify your email before signing in");
        }

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) return null;

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role as Role,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],

  session: { strategy: "jwt" as const },

  callbacks: {
    jwt: async ({ token, user }: { token: any; user: any }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    session: async ({ session, token }: { session: any; token: any }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.emailVerified = token.emailVerified as boolean;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
