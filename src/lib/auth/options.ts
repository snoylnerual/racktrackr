import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";
// import GoogleProvider from "next-auth/providers/google";
// import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import { z } from "zod";

const credentialsSchema = z.object({
    username: z.string().email("Must be a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters.")
                        .max(32, "Password must have less than 32 characters."),
})

export const options: NextAuthOptions = {
    // TODO: change deployed url for github app to the vercel deployed url
    // TODO: reimplement GitHub Provider
    providers: [
        // GitHubProvider({
        //     clientId: process.env.GITHUB_ID as string,
        //     clientSecret: process.env.GITHUB_SECRET as string,
        // }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Email", type: "text", placeholder: "your@email.com" },
                password: { label: "Password", type: "password", placeholder: "Password" }
            },
            async authorize(credentials) {
                const parsedCredentials = credentialsSchema.safeParse(credentials);
                if (!parsedCredentials.success) {
                    console.log("credentials schema failed", parsedCredentials.error.flatten());
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: { email: parsedCredentials.data.username },
                });

                // If no error and we have user data, return it
                if (user) {
                    const ok = await bcrypt.compare(parsedCredentials.data.password, user.password);
                    if (ok) return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                    };
                }
                // Return null if user data could not be retrieved
                console.log("bad match")
                return null
            }
        }),
        // TODO: add google provider
        // I have the google app created, just need to figure out setup and follow it
        // GoogleProvider({
        //     clientId: process.env.GOOGLE_CLIENT_ID as string,
        //     clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        // }),
    ],

    // pages: {
    //     signIn: "@/app/auth/login",
    // },

    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            return true;
        },

        // async jwt({ token, user }) {
            // if (user) {
            //     const dbUser = await prisma.user.findUnique({
            //         where: { id: user.id! },
            //         select: { id: true, name: true },
            //     })
            //     token.userId = dbUser?.id;
            //     token.name = dbUser?.name;
            // }
            // token.userId = user.id;

        //     return token;
        // },

        async session({ session, token }) {
            // console.log(token);
            // need the userid,  name
            if (session.user) {
                session.user.id = token.sub as string;
                session.user.name = token.name as string;
            }
            return session;
        },
    },
};
