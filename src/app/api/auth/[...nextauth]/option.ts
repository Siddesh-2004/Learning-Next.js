import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnection";
import UserModel from "@/models/user.model";
import { User as UserModelType } from "@/models/user.model";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Enter your email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined,
      
      ) {
        await dbConnect();
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const user: UserModelType | null = await UserModel.findOne({
            $or: [
              { email: credentials.email },
              { username: credentials.email },
            ],
          });

          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your email");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            throw new Error("Password is not correct");
          }

          // Return user object that matches NextAuth's expected format
          return {
            id: user._id?.toString() || user.id?.toString(),
            email: user.email,
            isAcceptingMessage:user.isAcceptingMessage,
            username: user.username,
            isVerified: user.isVerified,
          };
        } catch (err) {
          console.error("Authentication error:",err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id= user.id;
        token.isVerified = user.isVerified;
        token.username = user.username;
        token.isAcceptingMessage=user.isAcceptingMessages
      }
      return token;
    },
    async session({ session, token}) {
      if (token ) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.username = token.username;
        session.user.isAcceptingMessages=token.isAcceptingMessages
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
};