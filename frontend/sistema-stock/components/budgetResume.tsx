// components/budgetResume.tsx
import React from 'react';
import { Button, Card, CardBody } from "@heroui/react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Image from 'next/image';
interface BudgetResumeProps {
  presupuestoData: {
    numeroPresupuesto: string;
    fecha: string;
    cliente: {
      nombre: string;
      direccion?: string;
      telefono?: string;
      email?: string;
    };
    productos: Array<{
      nombre: string;
      descripcion: string;
      tipoTela?: string;
      precioUnitario: number;
      cantidad: number;
      subtotal: number;
      espacio?: string; // Nuevo campo para el espacio/ambiente
      // Campos específicos para Dunes
      tipoApertura?: string;
      colorSistema?: string;
      ladoComando?: string;
      ladoApertura?: string;
      detalle?: string;
    }>;
    subtotal: number;
    descuento: number;
    total: number;
  };
}

const BudgetResume: React.FC<BudgetResumeProps> = ({ presupuestoData }) => {
  const invoiceRef = React.useRef(null);

  // Agrupar productos por espacio
  const productosPorEspacio = presupuestoData.productos.reduce((acc, producto) => {
    const espacio = producto.espacio || 'Sin especificar';
    if (!acc[espacio]) {
      acc[espacio] = [];
    }
    acc[espacio].push(producto);
    return acc;
  }, {} as Record<string, typeof presupuestoData.productos>);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 1,
        logging: false,
        useCORS: true,
        imageTimeout: 0,
        backgroundColor: null,
        removeContainer: true,
        foreignObjectRendering: false
      });

      const pdf = new jsPDF({
        format: 'a4',
        unit: 'mm',
        compress: true
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = pageWidth * 0.05;
      
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight, undefined, 'FAST');

      // Limpiar el nombre del cliente para usar como nombre de archivo
      const nombreCliente = presupuestoData.cliente.nombre
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remover caracteres especiales
        .replace(/\s+/g, '-') // Reemplazar espacios con guiones
        .toLowerCase();
      
      pdf.save(`Presupuesto-${presupuestoData.numeroPresupuesto}-${nombreCliente}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Hubo un error generando el PDF. Por favor intente nuevamente.');
    }
  };

  const handleSendToClient = async () => {
    // Implementación para enviar por email
    if (presupuestoData.cliente.email) {
      alert(`Se enviará el presupuesto a: ${presupuestoData.cliente.email}`);
    } else {
      alert('El cliente no tiene email registrado');
    }
  };

  const handleSendWhatsApp = async () => {
    if (!invoiceRef.current) return;
    
    try {
      // Generar el PDF
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      const pdf = new jsPDF({
        format: 'a4',
        unit: 'mm'
      });
      
      const imgWidth = 100;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

      // Crear el mensaje para WhatsApp
      const mensaje = `¡Hola ${presupuestoData.cliente.nombre}! Te envío el presupuesto N° ${presupuestoData.numeroPresupuesto}`;
      let telefono = presupuestoData.cliente.telefono?.replace(/\D/g, '') || '';
      
      if (!telefono) {
        alert('El cliente no tiene número de teléfono registrado');
        return;
      }

      // Agregar código de país si no lo tiene
      if (!telefono.startsWith('54')) {
        telefono = `54${telefono}`;
      }

      // Crear URL de WhatsApp
      const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
      
      window.open(whatsappUrl, '_blank');
      
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al intentar enviar el presupuesto. Por favor intente nuevamente.');
    }
  };

  return (
    <Card className="mx-auto max-w-2xl bg-white">
      <CardBody className="p-8">
        <div ref={invoiceRef} className="bg-white">
          <div className="flex justify-between items-start mb-8">
            <div>
              <Image 
                src="/images/logo.jpg"
                alt="Cortinova"
                className="mb-4"
                width={274}
                height={234}
              />
              <h1 className="text-2xl font-bold text-gray-900">
                Presupuesto #{presupuestoData.numeroPresupuesto}
              </h1>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Cliente: {presupuestoData.cliente.nombre}
              </h2>
              <p className="text-gray-600">{presupuestoData.fecha}</p>
            </div>
            <div className="mt-16 text-right">
              <div className="text-gray-600">
                <strong> <p>Cortinova - Cortinas & Deco</p>
                <p>San Martín 269, Río Cuarto</p>
                <p>Tel:3584022890</p> </strong>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-gray-900">Cliente:</h3>
            <div className="text-gray-600">
              <p>{presupuestoData.cliente.nombre}</p>
              {presupuestoData.cliente.direccion && <p>{presupuestoData.cliente.direccion}</p>}
              {presupuestoData.cliente.telefono && <p>Tel: {presupuestoData.cliente.telefono}</p>}
              {presupuestoData.cliente.email && <p>Email: {presupuestoData.cliente.email}</p>}
            </div>
          </div>

          <div className="overflow-x-auto mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 font-semibold text-left text-gray-900">Producto</th>
                  <th className="px-4 py-3 font-semibold text-left text-gray-900">Descripción</th>
                  <th className="px-4 py-3 font-semibold text-left text-gray-900">Precio Unit.</th>
                  <th className="px-4 py-3 font-semibold text-left text-gray-900">Cantidad</th>
                  <th className="px-4 py-3 font-semibold text-left text-gray-900">Subtotal</th>
                </tr>
              </thead>
                              <tbody>
                  {Object.entries(productosPorEspacio).map(([espacio, productos]) => (
                    <React.Fragment key={espacio}>
                      <tr>
                        <td colSpan={5} className="px-4 py-3 font-bold text-left text-gray-900 bg-gray-50">
                          {espacio}
                        </td>
                      </tr>
                      {productos.map((producto, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="px-4 py-3">{producto.nombre}</td>
                          <td className="px-4 py-3">{
                            (() => {
                              // Lógica específica para Dunes
                              if (producto.nombre?.toLowerCase().includes('dunes')) {
                                const detalles = [];
                                
                                // Agregar tipo de apertura
                                if (producto.tipoApertura) {
                                  if (producto.tipoApertura === 'cadena_cordon') {
                                    detalles.push('Apertura con Cadena y Cordón');
                                  } else if (producto.tipoApertura === 'baston') {
                                    detalles.push('Apertura con Bastón');
                                  }
                                }
                                
                                // Agregar color sistema
                                if (producto.colorSistema) {
                                  detalles.push(`Color: ${producto.colorSistema}`);
                                }
                                
                                // Agregar lado comando
                                if (producto.ladoComando) {
                                  detalles.push(`Comando: ${producto.ladoComando}`);
                                }
                                
                                // Agregar lado apertura
                                if (producto.ladoApertura) {
                                  detalles.push(`Apertura: ${producto.ladoApertura}`);
                                }
                                
                              
                                
                                // Agregar detalles adicionales
                                if (producto.detalle && producto.detalle.trim() !== '') {
                                  detalles.push(`Detalles: ${producto.detalle}`);
                                }
                                
                                return detalles.length > 0 ? detalles.join(' | ') : 'Sistema Dunes';
                              }
                              
                              // Para otros sistemas, mantener la lógica original
                              const descripcionLimpia = producto.descripcion.replace(/^\s*\d+\s*cm\s*x\s*\d+\s*cm\s*-\s*/i, '');
                              
                              if (!descripcionLimpia || descripcionLimpia.trim() === '') {
                                return producto.tipoTela || 'Sin descripción';
                              }
                              
                              return descripcionLimpia;
                            })()
                          }</td>
                          <td className="px-4 py-3">${producto.precioUnitario.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                          <td className="px-4 py-3">{producto.cantidad}</td>
                          <td className="px-4 py-3">${producto.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                <tr>
                  <td colSpan={3}></td>
                  <td className="px-4 py-3 font-bold">Subtotal</td>
                  <td className="px-4 py-3">${presupuestoData.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                </tr>
                {presupuestoData.descuento && presupuestoData.descuento > 0 && (
                  <tr>
                    <td colSpan={3}></td>
                    <td className="px-4 py-3 font-bold">Descuento</td>
                    <td className="px-4 py-3">-${presupuestoData.descuento.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3}></td>
                  <td className="px-4 py-3 font-bold">Total</td>
                  <td className="px-4 py-3 font-bold">${presupuestoData.total.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 text-blue-700 bg-blue-50 rounded-md">
            <p>Este presupuesto tiene una validez de 15 días.</p>
          </div>
        </div>

        <div className="flex justify-end mt-8 space-x-4">
          <Button 
            color="primary"
            onClick={handleDownloadPDF}
          >
            Descargar PDF
          </Button>
          <Button
            color="success"
            variant="ghost"
            onClick={handleSendWhatsApp}
          >
            Enviar por WhatsApp
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default BudgetResume;