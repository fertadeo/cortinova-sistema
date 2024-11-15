"use client";
import "../styles/globals.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Spinner } from "@nextui-org/react";
import Link from "next/link";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    setLoading(true);

    // Simula una demora de 2 segundos antes de realizar la petición
    setTimeout(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Credenciales incorrectas. Intenta de nuevo.");
          setLoading(false); // Desactiva el spinner si hay error
        } else {
          localStorage.setItem("token", data.token);
          document.cookie = `token=${data.token}; path=/;`;

          // Mantén el spinner y redirige
          router.push("/home");
        }
      } catch (err) {
        setError("Ocurrió un error. Intenta de nuevo más tarde.");
        setLoading(false); // Desactiva el spinner si hay error
      }
    }, 2000); // Simula la demora de 2 segundos
  };

  return (
    <section className="flex flex-col items-center h-screen font-serif antialiased md:flex-row">
      <div className="relative hidden w-full h-screen lg:block md:w-1/2 xl:w-2/3">
        <Image
          src="/images/Sun_12.jpg"
          alt="Background Image"
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>

      <div className="relative flex flex-col items-center justify-center w-full h-screen px-6 bg-white md:max-w-md lg:max-w-full md:w-1/2 xl:w-1/3 lg:px-16 xl:px-12">
        <div className="absolute transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 left-1/2 top-[16%]">
          <Image
            src="/images/logo-removebg-preview.png"
            alt="Logo"
            layout="fill"
            objectFit="contain"
            priority
          />
        </div>

        <div className="w-full mt-16">
          <h1 className="mt-12 text-2xl font-bold leading-tight text-center">
            Inicia sesión en tu cuenta
          </h1>

          {error && (
            <div className="px-4 py-3 mt-4 text-red-700 bg-red-100 border border-red-400 rounded">
              {error}
            </div>
          )}

          <form className="mt-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-gray-700">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                placeholder="Ingresa tu correo electrónico"
                className="w-full px-4 py-3 mt-2 border rounded-lg focus:border-yellow-500 focus:bg-white focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mt-4">
              <label htmlFor="password" className="block text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                placeholder="Ingresa tu contraseña"
                minLength={6}
                className="w-full px-4 py-3 mt-2 border rounded-lg focus:border-yellow-500 focus:bg-white focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mt-2 text-right">
              <Link
                href="/recuperar-password"
                className="text-sm font-semibold text-gray-700 hover:text-yellow-600"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 mt-6 font-semibold text-white transition duration-300 bg-yellow-600 rounded-lg hover:bg-yellow-500"
              disabled={loading}
            >
              {loading ? <Spinner color="white" size="sm" /> : "Iniciar Sesión"}
            </button>
          </form>

          <hr className="w-full my-6 border-gray-300" />

          <button
            disabled={true} // Deshabilitado
            type="button"
            className="flex items-center justify-center w-full px-4 py-3 font-semibold text-gray-500 transition duration-300 bg-gray-200 border border-gray-300 rounded-lg cursor-not-allowed"
          >
            <svg
              className="w-6 h-6 mr-4"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
                fill="#D1D5DB"
              />
              <path d="M0 11l17 13 7-6.1L48 14V0H0z" fill="#9CA3AF" />
              <path d="M0 37l30-23 7.9 1L48 0v48H0z" fill="#6B7280" />
              <path d="M48 48L17 24l-4-3 35-10z" fill="#4B5563" />
            </svg>
            Iniciar sesión con Google
          </button>

          <p className="mt-8 text-center">
            ¿Necesitas una cuenta?{" "}
            <Link
              href="#"
              className="font-semibold text-yellow-600 hover:text-yellow-500"
            >
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};
