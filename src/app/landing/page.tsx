"use client";
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useRouter } from "next/navigation";

const Landing = () => {

  const [linkToken, setLinkToken] = useState<string | null>(null);
  const ran = useRef(false);  

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    async function createToken() {

      try {
        const res = await fetch("/api/plaid/create-link-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error ?? "Failed to create link token");
        }

        setLinkToken(data.link_token);
      } catch (e: any) {
        console.log(e?.message ?? "Error generating link token");
        setLinkToken(null);
      }
    }


    createToken()
    console.log("LinkToken",linkToken)
  }, []);

  const onSuccess = async (public_token: string) => {
    try {
      console.log("Running exchange")
      await fetch('/api/plaid/exchange-token', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token }),});
      console.log("Finish exchange")
    } catch (error) {
      console.error('Error exchanging public token:', error);
    }
  };
  
  const { open, ready } = usePlaidLink({
    token: linkToken ?? null,
    onSuccess,
  });

  useEffect(() => {
    console.log("LinkToken updated:", linkToken);
  }, [linkToken]);

  return (
    <div>
        <h1>Landing</h1>
        <Link href="/racktrack/budgets">Budgets</Link>
        <Link href="/racktrack/dashboard">Dashboard</Link>
        <Link href="/racktrack/transactions">Transactions</Link>

        <h1>Link your bank</h1>
        <p>Connect a bank account so RackTrack can import your transactions.</p>
        <button
          onClick={() => open()}
          disabled={!ready || !linkToken}
          style={{ padding: "10px 14px" }}
        >
          {ready ? "Connect with Plaid" : "Loading…"}
        </button>
    </div>
  )
}


export default Landing;

// TODO: get rid of landing page

// TODO: add link_token/access_token requests
// the landing page needs to see if we have an access token saved for the current user
// if not, then we need to create a link_token and exchange it with Plaid in order
// to get our access token that we will save for a user

// the landing is meant to be the landing page after you log in. If you already
// have an access token associated, then you will sit here until your data is 
// loaded for the dashboard

// there is a chance we cant load the data from here and we'll need to be in the
// dashboard page, and if that is the case then we will decide whether to go to this
// page after we login or dashboard just based on a conditional whether access_token is 
// null or not

// "use client"
// import { useState, useEffect } from 'react';
// import { usePlaidLink } from 'react-plaid-link';
// import axios from 'axios';
// const PlaidLinkComponent = () => {
//   const [linkToken, setLinkToken] = useState<string | null>(null);
//   useEffect(() => {
//     const createLinkToken = async () => {
//       try {
//         const response = await axios.post('/api/plaid/create-link-token', {
//           client_user_id: 'your-unique-user-id', // Replace with actual user ID
//         });
//         setLinkToken(response.data.link_token);
//       } catch (error) {
//         console.error('Error generating link token:', error);
//       }
//     };
//     createLinkToken();
//   }, []);
//   const onSuccess = async (public_token: string) => {
//     try {
//       const response = await axios.post('/api/plaid/exchange-token', {
//         public_token,
//       });
//       console.log('Access Token:', response.data.access_token);
//     } catch (error) {
//       console.error('Error exchanging public token:', error);
//     }
//   };
//   const { open, ready } = usePlaidLink({
//     token: linkToken!,
//     onSuccess,
//   });
//   return (
//     <div>
//       {linkToken && (
//         <button onClick={open} disabled={!ready}>
//           Connect Bank
//         </button>
//       )}
//     </div>
//   );
// };
// export default PlaidLinkComponent;