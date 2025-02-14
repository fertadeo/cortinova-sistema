"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Divider } from "@nextui-org/react"

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
    <section className="fixed font-sans antialiased">
      <section
        className="flex flex-row w-screen h-full"
        id="view"
      >
        <button
          className="absolute top-0 left-0 p-2 text-gray-500 bg-white rounded-md border-2 border-gray-200 shadow-lg focus:bg-teal-500 focus:outline-none focus:text-white sm:hidden"
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
          className="overflow-x-hidden px-3 h-screen bg-white shadow-xl transition-transform duration-300 ease-in-out md:block w-30 md:w-60 lg:w-60"
          id="sidebar"
        >
          <div className="mt-[50px] space-y-6 md:space-y-10">
            <h1 className="text-sm font-bold text-center md:block md:text-xl">
              Cortinova<span className="text-amber-400">.</span>
            </h1>
            <div id="profile" className="space-y-3">
              {/* <Image
                src="https://images.unsplash.com/photo-1628157588553-5eeea00af15c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
                alt="Avatar user"
                className="mx-auto w-10 rounded-full md:w-16"
                width={150} // Añade las dimensiones
                height={150} // Añade las dimensiones
              /> */}
              <div>
                <h2
                  className="hidden text-xs font-medium text-center text-teal-500 md:text-sm"
                >
                  Eduard Pantazi
                </h2>
                <p className="hidden text-xs text-center text-gray-500">Administrador/Empleado</p>
              </div>
            </div>
            <div id="menu" className="flex flex-col self-end space-y-2">
              <Link
                href="/home"
                className="justify-center px-2 py-2 text-gray-700 align-middle rounded-md transition duration-150 ease-in-out hover:bg-teal-500 hover:text-white hover:text-base"
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
                className="px-2 py-2 text-sm font-medium text-gray-700 rounded-md transition duration-150 ease-in-out hover:bg-teal-500 hover:text-white hover:scale-105"
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
                className="px-2 py-2 text-sm font-medium text-gray-700 rounded-md transition duration-150 ease-in-out hover:bg-teal-500 hover:text-white hover:scale-105"
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
                href="/presupuestos"
                className="px-2 py-2 text-sm font-medium text-gray-700 rounded-md transition duration-150 ease-in-out hover:bg-teal-500 hover:text-white hover:scale-105"
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


              <Divider />







              <Link
                href="/pedidos"
                className="px-2 py-2 text-sm font-medium text-gray-700 rounded-md transition duration-150 ease-in-out hover:bg-slate-500 hover:text-white hover:scale-105"
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
                className="px-2 py-2 text-sm font-medium text-gray-700 rounded-md transition duration-150 ease-in-out hover:bg-slate-500 hover:text-white hover:scale-105"
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
                <span className="justify-center pl-2 align-middle" style={{ fontSize: '1.1rem' }}> Tour  </span>
              </Link>


              <Divider />

              <Link
                href="https://api.whatsapp.com/send?phone=5493517552258"
                className="flex items-center px-2 py-2 text-sm font-medium text-gray-700 rounded-md transition duration-150 ease-in-out hover:bg-teal-500 hover:text-white hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 26 26"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline-block hover:bg-white"
                  style={{ transition: 'fill 0.3s ease-in-out' }}
                >
                  <path
                    d="M22.1058 3.77812C19.6741 1.34062 16.4357 0 12.9942 0C5.89062 0 0.110268 5.78036 0.110268 12.8839C0.110268 15.1531 0.702232 17.3701 1.82812 19.3259L0 26L6.8308 24.2067C8.71116 25.2339 10.8295 25.7737 12.9884 25.7737H12.9942C20.092 25.7737 26 19.9933 26 12.8897C26 9.44821 24.5375 6.21562 22.1058 3.77812ZM12.9942 23.6031C11.0674 23.6031 9.18125 23.0866 7.53884 22.1116L7.15 21.8795L3.09911 22.9415L4.17857 18.9893L3.92321 18.583C2.84955 16.8768 2.28661 14.9094 2.28661 12.8839C2.28661 6.9817 7.09196 2.17634 13 2.17634C15.8612 2.17634 18.5482 3.29062 20.5679 5.31607C22.5875 7.34152 23.8295 10.0286 23.8237 12.8897C23.8237 18.7978 18.8964 23.6031 12.9942 23.6031ZM18.8674 15.5826C18.5482 15.4201 16.9638 14.6424 16.6679 14.5379C16.3719 14.4277 16.1571 14.3754 15.9424 14.7004C15.7277 15.0254 15.1125 15.7451 14.921 15.9656C14.7353 16.1804 14.5437 16.2094 14.2246 16.0469C12.3326 15.1009 11.0906 14.358 9.84286 12.2165C9.51205 11.6478 10.1737 11.6884 10.7888 10.458C10.8933 10.2433 10.8411 10.0576 10.7598 9.89509C10.6786 9.73259 10.0344 8.14821 9.76741 7.50402C9.50625 6.87723 9.23929 6.96429 9.04196 6.95268C8.85625 6.94107 8.64152 6.94107 8.42679 6.94107C8.21205 6.94107 7.86384 7.02232 7.56786 7.34152C7.27187 7.66652 6.44196 8.4442 6.44196 10.0286C6.44196 11.6129 7.59688 13.1451 7.75357 13.3598C7.91607 13.5746 10.0228 16.8246 13.2554 18.2232C15.2982 19.1054 16.0991 19.1808 17.1205 19.0299C17.7415 18.9371 19.0241 18.2522 19.2911 17.4978C19.558 16.7433 19.558 16.0991 19.4768 15.9656C19.4013 15.8205 19.1866 15.7393 18.8674 15.5826Z"
                    fill="#25D366"
                    style={{ transition: 'fill 0.3s ease-in-out' }}
                  />
                </svg>
                <span className="pl-2 text-lg">Contactar a Soporte</span>
              </Link>



              <div className="mt-auto">
                <button
                  onClick={handleLogout}
                  className="flex gap-2 items-center px-4 py-2 text-sm font-medium text-red-700 rounded-md transition duration-150 ease-in-out hover:bg-red-500 hover:text-white hover:scale-105"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 9V5C10 3.89543 10.8954 3 12 3H16C17.1046 3 18 3.89543 18 5V19C18 20.1046 17.1046 21 16 21H12C10.8954 21 10 20.1046 10 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 12H3M3 12L6 9M3 12L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>

                  <span className="pr-10 text-lg">
                    Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}
