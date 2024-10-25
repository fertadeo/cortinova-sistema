// PresupuestosTable.tsx
'use client'; // Asegúrate de que esto esté aquí si estás usando hooks

import { useEffect, useState } from 'react';

interface Cliente {
    nombre: string;
    email: string;
}

interface Presupuesto {
    id: number;
    fecha: string;
    estado: "Pagado" | "Pendiente" | "Cancelado";
    cliente: Cliente;
    descripcion: string;
    contactoCliente: string;
}

const PresupuestosTable = () => {
    const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPresupuestos = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/presupuestos`);
                if (!response.ok) throw new Error('Este servicio está en proceso de implementación');
                const data: Presupuesto[] = await response.json();
                setPresupuestos(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPresupuestos();
    }, []);

    return (
        <div>
            {loading && <p>Cargando presupuestos...</p>}

            {error && (
                <div
                    className="relative px-4 py-3 text-teal-700 bg-teal-200 border border-teal-500 rounded bg-opacity-30 border-opacity-30"
                    role="alert"
                >
                    <strong className="font-bold">Proximamente</strong> {error}
                </div>
            )}

            {presupuestos.length === 0 && !loading && !error && (
                <div
                    className="relative px-4 py-3 text-teal-700 bg-teal-200 border border-teal-500 rounded bg-opacity-30 border-opacity-30"
                    role="alert"
                >
                    <strong className="font-bold">Aún no hay presupuestos cargados!</strong>
                </div>
            )}

            {/* Aquí puedes agregar el código para renderizar la tabla de presupuestos */}
            {presupuestos.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Cliente</th>
                            <th>Descripción</th>
                            <th>Contacto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {presupuestos.map((presupuesto) => (
                            <tr key={presupuesto.id}>
                                <td>{presupuesto.id}</td>
                                <td>{presupuesto.fecha}</td>
                                <td>{presupuesto.estado}</td>
                                <td>{presupuesto.cliente.nombre}</td>
                                <td>{presupuesto.descripcion}</td>
                                <td>{presupuesto.contactoCliente}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PresupuestosTable;
