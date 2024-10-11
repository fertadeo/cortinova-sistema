import Papa from "papaparse";

// Función para enviar los datos al backend
const sendDataToBackend = async (data: any) => {
  // console.log("Iniciando el envío de datos al backend...");
  // console.log("Datos enviados al backend:", data);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/importar-productos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // console.log("Esperando respuesta del backend...");

    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }

    // const result = await response.json();
    
    // console.log('Respuesta del backend:', result.message);
  } catch (error) {
    // console.error('Error al cargar los productos:', error);
  }
};

// Función para manejar la subida del archivo CSV
const handleFileUpload = (file: File) => {
  // console.log("Iniciando la lectura del archivo CSV...");
  // console.log("Nombre del archivo:", file.name);

  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        // console.log("Archivo CSV parseado correctamente:");
        // console.log("Resultados parseados:", results.data);
        resolve(results.data);

        // console.log("Enviando los datos parseados al backend...");
        await sendDataToBackend(results.data);
      },
      error: (error) => {
        // console.error("Error parsing CSV:", error);
        reject(error);
      },
    });
  });
};

export default handleFileUpload;
