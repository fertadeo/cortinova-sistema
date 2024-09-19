"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"

export const SideBar = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Borra el token de localStorage
    localStorage.removeItem("token");

    // Borra el token de las cookies
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    // Redirige al usuario al login u otra página
    router.push("/");
  };


  return (
    <section className="fixed font-sans antialiased ">
      <section
        id="view"
        className="flex flex-row w-screen h-full "
        x-data="{ sidenav: true }"
      >
        <button
          className="absolute top-0 left-0 p-2 text-gray-500 bg-white border-2 border-gray-200 rounded-md shadow-lg focus:bg-teal-500 focus:outline-none focus:text-white sm:hidden"
        >
          <svg
            className="w-5 h-5 fill-current"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        <div
          id="sidebar"
          className="h-screen px-3 overflow-x-hidden transition-transform duration-300 ease-in-out bg-white shadow-xl md:block w-30 md:w-60 lg:w-60 "
          x-show="sidenav"
        >
          <div className="mt-10 space-y-6 md:space-y-10">
            <h1 className="text-4xl font-bold text-center md:hidden">
              D<span className="text-teal-600">.</span>
            </h1>
            <h1 className="hidden text-sm font-bold text-center md:block md:text-xl">
              Cortinova<span className="text-amber-400">.</span>
            </h1>
            <div id="profile" className="space-y-3">
              <img
                src="https://images.unsplash.com/photo-1628157588553-5eeea00af15c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
                alt="Avatar user"
                className="w-10 mx-auto rounded-full md:w-16"
              />
              <div>
                <h2
                  className="text-xs font-medium text-center text-teal-500 md:text-sm"
                >
                  Eduard Pantazi
                </h2>
                <p className="text-xs text-center text-gray-500">Administrator</p>
              </div>
            </div>
            <div id="menu" className="flex flex-col space-y-2">
              <Link
                href="/home"
                className="justify-center px-2 py-2 text-gray-700 align-middle transition duration-150 ease-in-out rounded-md hover:bg-teal-500 hover:text-white hover:text-base"
              >
                <svg
                  className="inline-block w-6 h-6 fill-current"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  ></path>
                </svg>
                <span className="justify-center pl-2 align-middle" style={{ fontSize: '1.1rem' }}>Inicio</span>
              </Link>
              <Link
                href="/clientes"
                className="px-2 py-2 text-sm font-medium text-gray-700 transition duration-150 ease-in-out rounded-md hover:bg-teal-500 hover:text-white hover:scale-105"
              >
                <svg
                  className="inline-block w-6 h-6 fill-current"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
                  ></path>
                </svg>
                <span className="justify-center pl-2 align-middle" style={{ fontSize: '1.1rem' }} >Clientes</span>
              </Link>
              <Link
                href="/productos"
                className="px-2 py-2 text-sm font-medium text-gray-700 transition duration-150 ease-in-out rounded-md hover:bg-teal-500 hover:text-white hover:scale-105"
              >
                <svg
                  className="inline-block w-6 h-6 fill-current"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"
                  ></path>
                </svg>
                <span className="justify-center pl-2 align-middle" style={{ fontSize: '1.1rem' }} >Productos</span>
              </Link>
              <Link
                href="/home"
                className="px-2 py-2 text-sm font-medium text-gray-700 transition duration-150 ease-in-out rounded-md hover:bg-slate-500 hover:text-white hover:scale-105"
              >
                <svg
                  className="inline-block w-6 h-6 fill-current"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"
                  ></path>
                </svg>
                <span className="justify-center pl-2 align-middle" style={{ fontSize: '1.1rem' }}> Presupuestos  </span>
              </Link>

              <Link
                href="/home"
                className="px-2 py-2 text-sm font-medium text-gray-700 transition duration-150 ease-in-out rounded-md hover:bg-slate-500 hover:text-white hover:scale-105"
              >
                <svg
                  className="inline-block w-6 h-6 fill-current"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"
                  ></path>
                </svg>
                <span className="justify-center pl-2 align-middle" style={{ fontSize: '1.1rem' }}> Pedidos  </span>
              </Link>


              
              <Link
                href="/home"
                className="px-2 py-2 text-sm font-medium text-gray-700 transition duration-150 ease-in-out rounded-md hover:bg-slate-500 hover:text-white hover:scale-105"
              >
                <svg
                  className="inline-block w-6 h-6 fill-current"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"
                  ></path>
                </svg>
                <span className="justify-center pl-2 align-middle" style={{ fontSize: '1.1rem' }}> Facturación  </span>
              </Link>
             
             
             
              <div className="mt-auto">
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 transition duration-150 ease-in-out rounded-md hover:bg-red-500 hover:text-white hover:scale-105"
              >
                <svg
                  className="w-6 h-6 fill-current"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 2a1 1 0 00-1 1v14a1 1 0 102 0V3a1 1 0 00-1-1zM14.707 10.293a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L11.586 11H3a1 1 0 010-2h8.586l-1.293-1.293a1 1 0 011.414-1.414l3 3z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="text-lg">Cerrar sesión</span>
              </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}
