"use client";
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";

import { signOut } from "next-auth/react";
import { signIn } from "next-auth/react";



const Login = () => {
  const router = useRouter();

  async function handleLogin() {
    router.push(false ? "/racktrack/dashboard" : "/landing");  
  }
  return (
    <div>
        <h1>Login Page</h1>
        <Link href="/landing">Log In</Link>
        {/* <Button onClick={ handleLogin }>Sign in</Button> */}
        {/* <Button onClick={ () => signIn("credentials", { callbackUrl: "/landing"}) }>Sign in with Credentials</Button>
        <Button onClick={ () => signIn("github") }>Sign in with Github</Button> */}
        <Button onClick={() => (signOut({ callbackUrl: "/" }))}>
          Logout
        </Button>
    </div>
   
  )
}


export default Login