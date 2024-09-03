'use client'
import { pedidosData } from '../components/utils/pedidosData';

export const PedidosTable = () => {
    return (
        <section className="container px-4 mx-auto">
            <div className="flex flex-col">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th scope="col" className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-x-3">
                                                    <span>N° Presupuesto </span>
                                            </div>
                                        </th>
                                        <th scope="col" className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                            Fecha
                                        </th>
                                        <th scope="col" className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                            Estado
                                        </th>
                                        <th scope="col" className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                            Cliente
                                        </th>
                                        <th scope="col" className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                            Descripcion de Consulta
                                        </th>
                                        <th scope="col" className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                            Contacto Cliente
                                        </th>
                                        <th scope="col" className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                            Descargar Presupuesto
                                        </th>
                                        <th scope="col" className="relative py-3.5 px-4">
                                            <span className="sr-only">Opciones</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                                    {pedidosData.map((pedido, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-4 text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                                                <div className="inline-flex items-center gap-x-3">
                                                    <span>{pedido.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">{pedido.fecha}</td>
                                            <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full gap-x-2 ${pedido.estado === "Pagado" ? "text-emerald-500 bg-emerald-100/60 dark:bg-gray-800" : "text-red-500 bg-red-100/60 dark:bg-gray-800"
                                                    }`}>
                                                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M16 10L12 14L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <h2 className="text-sm font-normal">{pedido.estado}</h2>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                                                <div className="inline-flex items-center gap-x-3">
                                                    <div className="flex-col items-center gap-x-2">
                                                        <h2 className="font-medium text-gray-800 dark:text-white ">{pedido.cliente.nombre}</h2>
                                                        <p className="text-sm font-normal text-gray-600 dark:text-gray-400">{pedido.cliente.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">{pedido.descripcion}</td>
                                            <td className="px-4 py-4 text-sm whitespace-nowrap">
                                                <button className="px-1 py-1 text-gray-500 transition-colors duration-200 rounded-lg dark:text-gray-300 hover:bg-gray-100">
                                                <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M14.5 5.87768C9.79397 5.87768 5.9683 9.70335 5.96183 14.4094C5.96183 16.0212 6.41496 17.5942 7.26942 18.9471L7.47009 19.2708L6.60915 22.4167L9.83929 21.5688L10.15 21.7565C11.4576 22.5333 12.9594 22.9475 14.4935 22.9475H14.5C19.1996 22.9475 23.1288 19.1219 23.1288 14.4158C23.1288 12.1373 22.1449 9.99464 20.533 8.38281C18.9147 6.76451 16.7786 5.87768 14.5 5.87768ZM19.5167 18.0732C19.3031 18.6752 18.2804 19.219 17.7884 19.2902C16.9728 19.4132 16.3384 19.3484 14.7136 18.6493C12.1438 17.5359 10.4607 14.9467 10.3313 14.7783C10.2018 14.61 9.28259 13.3866 9.28259 12.1243C9.28259 10.8621 9.94286 10.2406 10.1824 9.9817C10.4154 9.72277 10.6937 9.65804 10.8685 9.65804C11.0368 9.65804 11.2116 9.65804 11.3605 9.66451C11.5158 9.67098 11.7295 9.60625 11.9366 10.1047C12.1502 10.6161 12.6616 11.8783 12.7263 12.0078C12.7911 12.1373 12.8364 12.2862 12.7458 12.4545C12.2538 13.4384 11.7295 13.3996 11.9949 13.8527C12.9853 15.5551 13.9757 16.1442 15.4839 16.9016C15.7429 17.031 15.8917 17.0116 16.0406 16.8368C16.1895 16.6685 16.6815 16.0859 16.8498 15.8335C17.0181 15.5746 17.1929 15.6199 17.4259 15.704C17.6589 15.7882 18.9212 16.4096 19.1801 16.5391C19.4391 16.6685 19.6074 16.7333 19.6721 16.8368C19.7304 16.9598 19.7304 17.4777 19.5167 18.0732ZM25.8929 0H3.10714C1.39174 0 0 1.39174 0 3.10714V25.8929C0 27.6083 1.39174 29 3.10714 29H25.8929C27.6083 29 29 27.6083 29 25.8929V3.10714C29 1.39174 27.6083 0 25.8929 0ZM14.4935 24.6759C12.7717 24.6759 11.0821 24.2422 9.58683 23.4266L4.14286 24.8571L5.59933 19.5362C4.69955 17.9826 4.22701 16.2154 4.22701 14.4029C4.23348 8.74531 8.83594 4.14286 14.4935 4.14286C17.2382 4.14286 19.8145 5.21094 21.7565 7.1529C23.692 9.09487 24.8571 11.6712 24.8571 14.4158C24.8571 20.0734 20.1511 24.6759 14.4935 24.6759Z" fill="#42A832" />
                                                    </svg>
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 text-sm whitespace-nowrap">
                                                <button className="px-1 py-1 text-gray-500 transition-colors duration-200 rounded-lg dark:text-gray-300 hover:bg-gray-100">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <g clipPath="url(#clip0_259_353)">
                                                            <path d="M18.9999 20V18L4.99988 18V20L18.9999 20ZM18.9999 10L14.9999 10L14.9999 4L8.99988 4L8.99988 10L4.99988 10L11.9999 17L18.9999 10Z" fill="black" fill-opacity="0.54" />
                                                        </g>
                                                        <defs>
                                                            <clipPath id="clip0_259_353">
                                                                <rect width="24" height="24" fill="white" transform="matrix(-1 0 0 -1 23.9999 24)" />
                                                            </clipPath>
                                                        </defs>
                                                    </svg>
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
