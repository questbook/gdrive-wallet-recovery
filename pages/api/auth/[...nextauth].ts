import NextAuth from "next-auth";
import Providers from 'next-auth/providers'
import type { User } from "next-auth";


const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/drive.appdata",
    'https://www.googleapis.com/auth/drive.metadata.readonly'
];

const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authorizationUrl.searchParams.set("prompt", "consent");
authorizationUrl.searchParams.set("access_type", "offline");
authorizationUrl.searchParams.set("response_type", "code");

export default NextAuth({
    providers: [
        Providers.Google({
            clientId: String(process.env.GOOGLE_CLIENT_ID),
            clientSecret: String(process.env.GOOGLE_CLIENT_SECRET),
            authorizationUrl: authorizationUrl.toString(),
            scope: scopes.join(" ")
        })
    ],
    secret: process.env.JWT_SECRET,
    callbacks: {
        async jwt(token: any, user: User, account: any): Promise<any> {
          if (account) {
            token.accessToken = account?.accessToken;
            token.refreshToken = account?.refreshToken;
          }
    
          return token;
        },
        async session(session: any, user: any): Promise<any> {
          session.accessToken = user.accessToken;
          // @ts-ignore
          session.refreshToken = user.refreshToken;    
          return session;
        },
      },
})
