import React from 'react';
import { Button, Card, CardBody } from "@nextui-org/react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Invoice = () => {
  const invoiceRef = React.useRef(null);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    
    try {
      // Create canvas from the invoice component
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      // Initialize PDF document
      const pdf = new jsPDF({
        format: 'a4',
        unit: 'mm'
      });


      
      // Calculate dimensions
      const imgWidth = 190; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Download PDF
      pdf.save('Invoice-203483.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    }
  };

  const handleSendToClient = async () => {
    // Implementación futura para enviar por email
    alert('This feature will be available soon!');
  };

  return (
    <Card className="max-w-2xl mx-auto bg-white">
      <CardBody className="p-8">
        {/* Contenido de la factura */}
        <div ref={invoiceRef} className="bg-white">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoice #203483</h1>
              <p className="text-gray-600">January 1, 2024</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-900">Onedoc</h2>
              <div className="text-gray-600">
                <p>OneDoc, Inc.</p>
                <p>1600 Pennsylvania Avenue NW,</p>
                <p>Washington, DC 20500</p>
                <p>United States of America</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-gray-900">Bill to:</h3>
            <div className="text-gray-600">
              <p>Titouan LAUNAY</p>
              <p>72 Faxcol D: Gotham City,</p>
              <p>NJ 12345,</p>
              <p>United States of America</p>
            </div>
          </div>

          <p className="mb-8 text-gray-700">
            All items below correspond to work completed in the month of January 2024. 
            Payment is due within 15 days of receipt of this invoice.<sup>1</sup>
          </p>

          <div className="mb-8 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 font-semibold text-left text-gray-900">Item</th>
                  <th className="px-4 py-3 font-semibold text-left text-gray-900">Description</th>
                  <th className="px-4 py-3 font-semibold text-left text-gray-900">Unit price</th>
                  <th className="px-4 py-3 font-semibold text-left text-gray-900">Quantity</th>
                  <th className="px-4 py-3 font-semibold text-left text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3">1</td>
                  <td className="px-4 py-3">Onedoc subscription</td>
                  <td className="px-4 py-3">$10.00</td>
                  <td className="px-4 py-3">1</td>
                  <td className="px-4 py-3">$10.00</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3">2</td>
                  <td className="px-4 py-3">Onedoc support</td>
                  <td className="px-4 py-3">$5.00</td>
                  <td className="px-4 py-3">1</td>
                  <td className="px-4 py-3">$5.00</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 font-bold">Total</td>
                  <td className="px-4 py-3 font-bold">$15.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 text-blue-700 rounded-md bg-blue-50">
            <p>On January 1st 2024, Onedoc users will be upgraded free of charge to our new cloud offering</p>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            <sup>1</sup> This includes non-business days.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end mt-8 space-x-4">
          <Button 
            color="default"
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Download PDF
          </Button>
          <Button
            variant="ghost"
            onClick={handleSendToClient}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            Send to Client
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default Invoice;