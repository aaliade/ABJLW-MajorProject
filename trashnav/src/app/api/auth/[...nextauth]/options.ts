import type {NextAuthOptions} from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from "next-auth/providers/google";

export const options : NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: String(process.env.AUTH_GITHUB_ID),
      clientSecret: String(process.env.AUTH_GITHUB_SECRET),
    }),

    GoogleProvider({
      clientId: String(process.env.GOOGLE_CLIENT_ID),
      clientSecret: String(process.env.GOOGLE_CLIENT_SECRET),
    }),

    CredentialsProvider({
    // The name to display on the sign in form (e.g. 'Sign in with...')
    name: 'Credentials',
    // The credentials is used to generate a suitable form on the sign in page.
    // You can specify whatever fields you are expecting to be submitted.
    // e.g. domain, username, password, 2FA token, etc.
    // You can pass any HTML attribute to the <input> tag through the object.
    credentials: {
      username: { label: "Username", type: "text", placeholder: "jsmith" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials, req) {
      //This is where you need to retrieve user data to verify with credentials
      // You need to provide your own logic here that takes the credentials
      // submitted and returns either a object representing a user or value
      // that is false/null if the credentials are invalid.
      // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
      // You can also use the `req` object to obtain additional parameters
      // (i.e., the request IP address)
      
      //const res = await fetch("/your/endpoint", {
      //  method: 'POST',
      //  body: JSON.stringify(credentials),
      //  headers: { "Content-Type": "application/json" }
      // })
      //const user = await res.json()


      // If no error and we have user data, return it
      //if (res.ok && user) {
       // return user
      //}

      // Return null if user data could not be retrieved
      //return null
      //
      const user = {id: "42", name:"Dave", password:"nextauth"}

      if (credentials?.username === user.name && credentials?.password === user.password){
        return user
      }else {
        return null
      }
    }

  }) 
  ],

}
