// pages/recover-password.tsx
'use client'
import '../../styles/globals.css';
import { useState } from 'react';
import { Button, Input, Spacer, Spinner } from '@nextui-org/react'; // Asegúrate de importar Spinner

const RecoverPassword = () => {
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Simulamos una petición de recuperación de contraseña (lógica de backend aquí)
        setTimeout(async () => {
            if (!email) {
                setError('Por favor, ingresa tu correo electrónico.');
                setLoading(false);
                return;
            }

            try {
                // Aquí iría la petición a tu API para recuperar la contraseña
                // console.log('Enviando solicitud de recuperación para:', email);

                // Simulamos éxito en la petición
                setSuccess(true);

                // Espera 2 segundos y redirige a "/home"
                setTimeout(() => {
                    window.location.href = '/home'; // Redirigir a la página principal
                }, 2000);
            } catch (err) {
                setError('Ocurrió un error. Intenta de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        }, 2000); // Simulamos una demora de 2 segundos
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800">
                    Recuperar Contraseña
                </h2>

                <Spacer y={1} />

                {success ? (
                    <h4 className="text-center text-green-600">
                        ¡Correo enviado! Revisa tu bandeja de entrada para recuperar tu contraseña.
                        <br />
                        Redirigiendo a la pagina de acceso...
                    </h4>
                ) : (
                    <>
                        <h5 className="text-center text-gray-600">
                            Ingresa tu correo electrónico para recibir un enlace de recuperación de contraseña.
                        </h5>

                        <Spacer y={1} />

                        {error && (
                            <p className="text-center text-red-500">
                                {error}
                            </p>
                        )}

                               <Spacer y={6} />
                        <form onSubmit={handleSubmit}>
                            <Input
                                fullWidth
                                color="primary"
                                size="lg"
                                placeholder="Correo Electrónico"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="shadow-sm"
                            />

                            <Spacer y={6} />

                            <Button
                                type="submit"
                                color="primary"
                                size="lg"
                                fullWidth
                                disabled={loading}
                                className="transition duration-300 bg-blue-600 hover:bg-blue-500"
                            >
                                {loading ? <Spinner color="white" size="sm" /> : 'Enviar Enlace de Recuperación'}
                            </Button>
                        </form>
                    </>
                )}

                <Spacer y={2} />

                {/* <Button
          color="secondary"
          className="w-full"
          onClick={() => window.location.href = '/'} // redirige a la página de login
        >
          Volver a Iniciar Sesión
        </Button> */}
            </div>
        </div>
    );
};

export default RecoverPassword;
