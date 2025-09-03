"use client"
import { useState, useEffect } from "react";
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Divider, Avatar } from "@heroui/react"
import { useProfile } from '@/hooks/useProfile';
import { useAvatarContext } from '@/contexts/AvatarContext';

export const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useProfile();
  const { avatarUpdateTrigger } = useAvatarContext();

  // Cerrar sidebar cuando cambia la ruta
  useEffect(() => {
    if (window.innerWidth < 640) { // Solo en mobile
      setIsOpen(false);
    }
  }, [pathname]); // Se ejecuta cuando cambia la ruta

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/");
  };

  return (
    <section className="font-sans antialiased">
              <div
          className={`
            fixed left-0 overflow-x-hidden px-3 h-screen bg-white dark:bg-dark-card shadow-xl w-60
            transition-transform duration-300 ease-in-out z-40
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0
          `}
          id="sidebar"
        >
        <div className="mt-[50px] space-y-6 md:space-y-10">
          <div className="flex items-center justify-center">
            <h1 className="text-sm font-bold text-center md:block md:text-xl text-gray-900 dark:text-dark-text ml-2.5">
              Cortinova<span className="text-amber-400">.</span>
            </h1>
          </div>
          <div id="profile" className="space-y-3">
            <div className="flex justify-center">
              <Avatar
                key={avatarUpdateTrigger}
                src={profile.avatarUrl || undefined}
                name={profile.name}
                size="lg"
                className="w-12 h-12 md:w-16 md:h-16"
                isBordered
                color="primary"
              />
            </div>
            <div>
              <h2
                className="text-xs font-medium text-center text-teal-500 md:text-sm"
              >
                ¡Hola, {profile.name}!
              </h2>
              <p className="text-xs text-center text-gray-500 dark:text-dark-text-secondary">{profile.role}</p>
            </div>
          </div>
          <div id="menu" className="flex flex-col self-end space-y-2">
            <Link
              href="/home"
              className="justify-center px-2 py-2 text-gray-700 dark:text-dark-text-secondary align-middle rounded-md transition duration-150 ease-in-out hover:bg-teal-500 dark:hover:bg-primary/20 dark:hover:text-primary hover:text-white hover:text-base"
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
            {/* <Link
              href="/metricas"
              className="flex items-center px-2 py-2 text-sm font-medium text-gray-700 rounded-md transition duration-150 ease-in-out hover:bg-teal-500 hover:text-white hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
              </svg>
              <span className="pl-2" style={{ fontSize: '1.1rem' }}>Métricas</span>
            </Link> */}
            <Link
              href="/clientes"
              className="px-2 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary rounded-md transition duration-150 ease-in-out hover:bg-teal-500 dark:hover:bg-primary/20 dark:hover:text-primary hover:text-white hover:scale-105"
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
              className="px-2 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary rounded-md transition duration-150 ease-in-out hover:bg-teal-500 dark:hover:bg-primary/20 dark:hover:text-primary hover:text-white hover:scale-105"
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
              className="flex items-center px-2 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary rounded-md transition duration-150 ease-in-out hover:bg-teal-500 dark:hover:bg-primary/20 dark:hover:text-primary hover:text-white hover:scale-105"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
                <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
              </svg>
              <span className="pl-2 text-lg">Presupuestos</span>
            </Link>

            <Link
              href="/medidas"
              className="flex items-center px-2 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary rounded-md transition duration-150 ease-in-out hover:bg-teal-500 dark:hover:bg-primary/20 dark:hover:text-primary hover:text-white hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
              </svg>


              <span className="justify-center pl-2 align-middle" style={{ fontSize: '1.1rem' }}>Medidas</span>
            </Link>

            <Link
              href="/pedidos"
              className="px-2 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary rounded-md transition duration-150 ease-in-out hover:bg-teal-500 dark:hover:bg-primary/20 dark:hover:text-primary hover:text-white hover:scale-105"
            >

              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="inline-block w-6 h-6 fill-current size-6">
                <path fillRule="evenodd" d="M8.128 9.155a3.751 3.751 0 1 1 .713-1.321l1.136.656a.75.75 0 0 1 .222 1.104l-.006.007a.75.75 0 0 1-1.032.157 1.421 1.421 0 0 0-.113-.072l-.92-.531Zm-4.827-3.53a2.25 2.25 0 0 1 3.994 2.063.756.756 0 0 0-.122.23 2.25 2.25 0 0 1-3.872-2.293ZM13.348 8.272a5.073 5.073 0 0 0-3.428 3.57 5.08 5.08 0 0 0-.165 1.202 1.415 1.415 0 0 1-.707 1.201l-.96.554a3.751 3.751 0 1 0 .734 1.309l13.729-7.926a.75.75 0 0 0-.181-1.374l-.803-.215a5.25 5.25 0 0 0-2.894.05l-5.325 1.629Zm-9.223 7.03a2.25 2.25 0 1 0 2.25 3.897 2.25 2.25 0 0 0-2.25-3.897ZM12 12.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                <path d="M16.372 12.615a.75.75 0 0 1 .75 0l5.43 3.135a.75.75 0 0 1-.182 1.374l-.802.215a5.25 5.25 0 0 1-2.894-.051l-5.147-1.574a.75.75 0 0 1-.156-1.367l3-1.732Z" />
              </svg>

              <span className="justify-center pl-2 align-middle" style={{ fontSize: '1.1rem' }}> Pedidos  </span>
            </Link>

            <Divider />










            {/* <Link
              href="/home"
              className="px-2 py-2 text-sm font-medium text-gray-700 rounded-md transition duration-150 ease-in-out hover:bg-slate-500 hover:text-white hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="inline-block w-6 h-6 fill-current size-6">
                <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.711 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.607 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z" />
                <path d="M4.462 19.462c.42-.419.753-.89 1-1.395.453.214.902.435 1.347.662a6.742 6.742 0 0 1-1.286 1.794.75.75 0 0 1-1.06-1.06Z" />
              </svg>
              <span className="justify-center pl-2 align-middle" style={{ fontSize: '1.1rem' }}> Tour  </span>
            </Link> */}


            {/* <Divider /> */}

            <Link
              href="https://api.whatsapp.com/send?phone=5493517552258"
              className="flex items-center px-2 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary rounded-md transition duration-150 ease-in-out hover:bg-teal-500 dark:hover:bg-primary/20 dark:hover:text-primary hover:text-white hover:scale-105"
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
                className="flex gap-2 items-center px-4 py-2 text-sm font-medium text-red-700 dark:text-white dark:bg-red-500/20 dark:hover:bg-red-500/70 rounded-md transition duration-150 ease-in-out hover:bg-red-500 hover:text-white hover:scale-105"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="dark:text-white">
                  <path d="M10 9V5C10 3.89543 10.8954 3 12 3H16C17.1046 3 18 3.89543 18 5V19C18 20.1046 17.1046 21 16 21H12C10.8954 21 10 20.1046 10 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 12H3M3 12L6 9M3 12L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                <span className="pr-10 text-lg text-red-700 hover:text-white dark:text-white">
                  Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Overlay solo para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity sm:hidden"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}
      {/* Botón de toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-0 left-0 z-50 p-2 text-gray-500 dark:text-dark-text-secondary bg-white dark:bg-dark-card rounded-md border-2 border-gray-200 dark:border-dark-border shadow-lg focus:bg-teal-500 focus:outline-none focus:text-white sm:hidden"
      >
        {isOpen ? (
          // Ícono X para cerrar
          (<svg
            className="w-5 h-5 fill-current"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>)
        ) : (
          // Ícono de menú hamburguesa
          (<svg
            className="w-5 h-5 fill-current"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>)
        )}
      </button>
    </section>
  );
}
