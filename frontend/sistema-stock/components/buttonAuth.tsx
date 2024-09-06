'use client';
import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

function ButtonAuth() {
  const { data: session, status } = useSession();

  // Renderizado condicional según el estado de la sesión
  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <>
      {session ? (
        <>
          Signed in as {session.user?.email} <br />
          <button onClick={() => signOut()} className="bg-primary-50">
            Sign Out
          </button>
        </>
      ) : (
        <>
          <p>You are not signed in</p>
          <button onClick={() => signIn()} className="bg-primary-50">
            Sign In
          </button>
        </>
      )}
    </>
  );
}

export default ButtonAuth;
