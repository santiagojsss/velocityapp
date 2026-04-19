import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface User { role?: string }
  interface Session { user: { name: string; role: string } }
}

const LOCAL_USERS = [
  { username: "santi",  password: "velocity2026", name: "Santiago", role: "pm"     },
  { username: "teo",    password: "velocity2026", name: "Tadeo",    role: "editor" },
  { username: "nahuel", password: "velocity2026", name: "Nahuel",   role: "admin"  },
  { username: "lucho",  password: "velocity2026", name: "Luciano",  role: "admin"  },
];

const supabaseReady = false; // auth uses local users; Supabase is used for data only

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Usuario" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        // Supabase (producción)
        if (supabaseReady) {
          const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_KEY!
          );
          const { data: user } = await supabase
            .from("users")
            .select("username, password_hash, name, role")
            .eq("username", credentials.username)
            .single();

          if (!user) return null;
          const valid = await bcrypt.compare(credentials.password as string, user.password_hash);
          if (!valid) return null;
          return { id: user.username, name: user.name, role: user.role ?? "editor" };
        }

        // Usuarios locales (desarrollo)
        const user = LOCAL_USERS.find(
          (u) => u.username === credentials.username && u.password === credentials.password
        );
        if (!user) return null;
        return { id: user.username, name: user.name, role: user.role };
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.name = token.name as string;
      session.user.role = (token.role as string) ?? "editor";
      return session;
    },
  },
});
