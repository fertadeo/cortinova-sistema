// pages/protected.tsx
import { useSession, signIn } from "next-auth/react";

export default function ProtectedPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    signIn();  // Redirige al usuario a la página de inicio de sesión
    return null;
  }

  return (
    <div>
      <h1>Protected Page</h1>
      <p>Welcome {session.user.email}</p>
    </div>
  );
}
