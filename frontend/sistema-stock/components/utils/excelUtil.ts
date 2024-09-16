import Papa from "papaparse";

 const handleFileUpload = (file: File) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log("Parsed results:", results.data);
        resolve(results.data); // Retorna los datos parseados
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        reject(error);
      },
    });
  });
};
 
export default handleFileUpload