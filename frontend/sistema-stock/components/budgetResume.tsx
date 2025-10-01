// components/budgetResume.tsx
import React from 'react';
import { Button, Card, CardBody } from "@heroui/react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BudgetOption } from '../types/budget';

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
    showMeasuresInPDF?: boolean;
    esEstimativo?: boolean;
    opciones?: BudgetOption[];
    shouldRound?: boolean;
    applyDiscount?: boolean;
    productos: Array<{
      nombre: string;
      descripcion: string;
      tipoTela?: string;
      precioUnitario: number;
      cantidad: number;
      subtotal: number;
      espacio?: string;
      opcion?: string;
      tipoApertura?: string;
      colorSistema?: string;
      ladoComando?: string;
      ladoApertura?: string;
      detalle?: string;
      incluirMotorizacion?: boolean;
      precioMotorizacion?: number;
      ancho?: number;
      alto?: number;
    }>;
    subtotal: number;
    descuento: number;
    total: number;
  };
}

const BudgetResume: React.FC<BudgetResumeProps> = ({ presupuestoData }) => {
  const invoiceRef = React.useRef<HTMLDivElement>(null);

  // Función para redondear al millar más cercano
  const roundToThousand = (num: number): number => {
    return Math.round(num / 1000) * 1000;
  };

  // Agrupar productos según el tipo de presupuesto
  const agruparProductos = () => {
    if (presupuestoData.esEstimativo && presupuestoData.opciones) {
      // Agrupar por opción
      const productosPorOpcion: Record<string, typeof presupuestoData.productos> = {};
      
      presupuestoData.opciones.filter(op => op.activa).forEach(opcion => {
        const productosDeOpcion = presupuestoData.productos.filter(p => p.opcion === opcion.id);
        if (productosDeOpcion.length > 0) {
          productosPorOpcion[opcion.nombre] = productosDeOpcion;
        }
      });
      
      return productosPorOpcion;
    } else {
      // Agrupar por espacio (lógica original)
      return presupuestoData.productos.reduce((acc, producto) => {
        const espacio = producto.espacio || 'Espacio/Ambiente sin especificar';
        const espacioConPrefijo = espacio === 'Espacio/Ambiente sin especificar' 
          ? espacio 
          : `Espacio: ${espacio}`;
        if (!acc[espacioConPrefijo]) {
          acc[espacioConPrefijo] = [];
        }
        acc[espacioConPrefijo].push(producto);
        return acc;
      }, {} as Record<string, typeof presupuestoData.productos>);
    }
  };

  const productosAgrupados = agruparProductos();

  // Calcular totales por grupo (opción o espacio)
  const calcularTotalPorGrupo = (productos: typeof presupuestoData.productos) => {
    const subtotal = productos.reduce((sum, prod) => sum + prod.subtotal, 0);
    
    // Calcular descuento proporcional para este grupo
    let descuentoGrupo = 0;
    if (presupuestoData.applyDiscount && presupuestoData.subtotal > 0) {
      const proporcion = subtotal / presupuestoData.subtotal;
      descuentoGrupo = presupuestoData.descuento * proporcion;
    }
    
    const totalGrupo = subtotal - descuentoGrupo;
    
    // Aplicar redondeo a miles si está activado
    if (presupuestoData.shouldRound && presupuestoData.applyDiscount) {
      return {
        subtotal: subtotal,
        descuento: subtotal - roundToThousand(totalGrupo),
        total: roundToThousand(totalGrupo)
      };
    }
    
    return {
      subtotal: subtotal,
      descuento: descuentoGrupo,
      total: totalGrupo
    };
  };

  // Calcular descuento proporcional para una opción (ya no se usa, se calcula en calcularTotalPorGrupo)
  const calcularDescuentoOpcion = (subtotalOpcion: number) => {
    if (presupuestoData.descuento === 0 || presupuestoData.subtotal === 0) {
      return 0;
    }
    // Calcular el descuento proporcional basado en el porcentaje que representa esta opción
    const proporcion = subtotalOpcion / presupuestoData.subtotal;
    return presupuestoData.descuento * proporcion;
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    
    try {
      const pdf = new jsPDF({
        format: 'a4',
        unit: 'mm',
        compress: true
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      // Obtener el elemento completo
      const fullCanvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        imageTimeout: 15000,
        backgroundColor: '#ffffff',
        removeContainer: true,
        foreignObjectRendering: false,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const images = clonedDoc.querySelectorAll('img');
          images.forEach(img => {
            img.style.display = 'block';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
          });
        }
      });
      

      const imgWidth = contentWidth;
      const imgHeight = (fullCanvas.height * imgWidth) / fullCanvas.width;
      
      // Calcular cuántas páginas necesitamos
      const totalPages = Math.ceil(imgHeight / contentHeight);
      
      console.log('Generando PDF con paginación:', {
        imgHeight,
        contentHeight,
        totalPages
      });
      
      // Generar cada página
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        // Calcular la posición Y para esta página
        const sourceY = page * contentHeight * (fullCanvas.width / imgWidth);
        const sourceHeight = Math.min(
          contentHeight * (fullCanvas.width / imgWidth),
          fullCanvas.height - sourceY
        );
        
        // Crear un canvas temporal para esta página
        const pageCanvas = document.createElement('canvas');
        const ctx = pageCanvas.getContext('2d');
        pageCanvas.width = fullCanvas.width;
        pageCanvas.height = sourceHeight;
        
        // Dibujar la porción correspondiente de la imagen
        ctx?.drawImage(
          fullCanvas,
          0, sourceY, fullCanvas.width, sourceHeight,
          0, 0, fullCanvas.width, sourceHeight
        );
        
        // Convertir a imagen y agregar al PDF
        const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
        pdf.addImage(
          pageImgData, 
          'PNG', 
          margin, 
          margin, 
          imgWidth, 
          Math.min(contentHeight, (sourceHeight * imgWidth) / fullCanvas.width),
          undefined, 
          'FAST'
        );
      }

      // Limpiar el nombre del cliente para usar como nombre de archivo
      const nombreCliente = presupuestoData.cliente.nombre
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();
      
      const tipoPresupuesto = presupuestoData.esEstimativo ? 'Estimativo' : 'Presupuesto';
      pdf.save(`${tipoPresupuesto}-${presupuestoData.numeroPresupuesto}-${nombreCliente}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor intente nuevamente.');
    }
  };

  const handleSendWhatsApp = async () => {
    if (!invoiceRef.current) return;
    
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      // Crear PDF para preview
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm'
      });
      
      const imgWidth = 100;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

      // Crear el mensaje para WhatsApp
      const tipoPresupuesto = presupuestoData.esEstimativo ? 'presupuesto estimativo' : 'presupuesto';
      const mensaje = `¡Hola ${presupuestoData.cliente.nombre}! Te envío el ${tipoPresupuesto} N° ${presupuestoData.numeroPresupuesto}`;
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
        <div ref={invoiceRef} className="bg-white text-gray-900">
          <div className="flex justify-between items-start mb-8">
                         <div>
               <div className="mb-6" style={{ minHeight: '120px', display: 'flex', alignItems: 'center' }}>
                 <img 
                   src="/images/logo.jpg"
                   alt="Cortinova"
                   style={{ 
                     width: '200px', 
                     height: 'auto', 
                     maxHeight: '120px',
                     objectFit: 'contain',
                     display: 'block'
                   }}
                 />
               </div>
                             <h1 className="font-bold text-gray-900">
                 {presupuestoData.esEstimativo ? 'Presupuesto Estimativo' : 'Presupuesto'} # {presupuestoData.numeroPresupuesto}
               </h1>
              <p className="text-gray-600">{presupuestoData.fecha}</p>
            </div>
                         <div className="mt-6 text-right pr-4">
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

          {presupuestoData.esEstimativo ? (
            // Render para presupuesto estimativo con opciones
            <>
              {Object.entries(productosAgrupados).map(([nombreOpcion, productos], opcionIndex) => {
                const datosOpcion = calcularTotalPorGrupo(productos);
                
                return (
                  <div key={nombreOpcion} className="mb-8">
                    <div className="mb-4 p-3 bg-blue-100 rounded">
                      <h2 className="text-xl font-bold text-blue-900">{nombreOpcion}</h2>
                    </div>
                    
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full" style={{ fontSize: '13px' }}>
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="px-2 py-2 font-semibold text-left text-gray-900" style={{ width: '15%' }}>Producto</th>
                            <th className="px-2 py-2 font-semibold text-left text-gray-900" style={{ width: presupuestoData.showMeasuresInPDF ? '30%' : '40%' }}>Descripción</th>
                            {presupuestoData.showMeasuresInPDF && (
                              <th className="px-2 py-2 font-semibold text-left text-gray-900" style={{ width: '15%' }}>Medidas</th>
                            )}
                            <th className="px-2 py-2 font-semibold text-right text-gray-900" style={{ width: '13%' }}>Precio Unit.</th>
                            <th className="px-2 py-2 font-semibold text-center text-gray-900" style={{ width: '10%' }}>Cant.</th>
                            <th className="px-2 py-2 font-semibold text-right text-gray-900" style={{ width: '17%' }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productos.map((producto, index) => (
                            <React.Fragment key={index}>
                              <tr>
                                <td className="px-2 py-2 text-gray-900">{producto.nombre}</td>
                                <td className="px-2 py-2 text-gray-900">{
                                  (() => {
                                    // Lógica específica para Dunes
                                    if (producto.nombre?.toLowerCase().includes('dunes')) {
                                      const detalles = [];
                                      
                                      if (producto.tipoApertura) {
                                        if (producto.tipoApertura === 'cadena_cordon') {
                                          detalles.push('Apertura con Cadena y Cordón');
                                        } else if (producto.tipoApertura === 'baston') {
                                          detalles.push('Apertura con Bastón');
                                        }
                                      }
                                      
                                      if (producto.colorSistema) {
                                        detalles.push(`Color: ${producto.colorSistema}`);
                                      }
                                      
                                      if (producto.ladoComando) {
                                        detalles.push(`Comando: ${producto.ladoComando}`);
                                      }
                                      
                                      if (producto.ladoApertura) {
                                        detalles.push(`Apertura: ${producto.ladoApertura}`);
                                      }
                                      
                                      if (producto.detalle && producto.detalle.trim() !== '') {
                                        detalles.push(`Detalles: ${producto.detalle}`);
                                      }
                                      
                                      return detalles.length > 0 ? detalles.join(' | ') : 'Sistema Dunes';
                                    }
                                    
                                    const descripcionLimpia = producto.descripcion.replace(/^\s*\d+\s*cm\s*x\s*\d+\s*cm\s*-\s*/i, '');
                                    
                                    if (!descripcionLimpia || descripcionLimpia.trim() === '') {
                                      return producto.tipoTela || 'Sin descripción';
                                    }
                                    
                                    return descripcionLimpia;
                                  })()
                                }</td>
                                {presupuestoData.showMeasuresInPDF && (
                                  <td className="px-2 py-2 text-gray-900" style={{ fontSize: '12px', lineHeight: '1.3' }}>
                                    {(() => {
                                      if (producto.ancho && producto.alto) {
                                        return (
                                          <>
                                            <div>Alto: {producto.alto}cm</div>
                                            <div>Ancho: {producto.ancho}cm</div>
                                          </>
                                        );
                                      }
                                      return 'Sin medidas';
                                    })()}
                                  </td>
                                )}
                                <td className="px-2 py-2 text-gray-900 text-right">${producto.precioUnitario.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                                <td className="px-2 py-2 text-gray-900 text-center">{producto.cantidad}</td>
                                <td className="px-2 py-2 text-gray-900 text-right">${producto.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                              </tr>
                              {producto.incluirMotorizacion && (
                                <tr>
                                  <td colSpan={presupuestoData.showMeasuresInPDF ? 5 : 4} className="px-2 py-2 font-bold text-gray-900">Motorización</td>
                                  <td className="px-2 py-2 text-gray-900 text-right">${producto.precioMotorizacion?.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                          {/* Subtotal de la opción */}
                          <tr className="border-t border-gray-300">
                            <td colSpan={presupuestoData.showMeasuresInPDF ? 4 : 3}></td>
                            <td className="px-2 py-2 font-semibold text-gray-900 text-right">Subtotal:</td>
                            <td className="px-2 py-2 font-semibold text-gray-900 text-right">${datosOpcion.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                          </tr>
                          {/* Descuento de la opción */}
                          {datosOpcion.descuento > 0 && (
                            <tr>
                              <td colSpan={presupuestoData.showMeasuresInPDF ? 4 : 3}></td>
                              <td className="px-2 py-2 font-semibold text-green-600 text-right">Descuento:</td>
                              <td className="px-2 py-2 font-semibold text-green-600 text-right">-${datosOpcion.descuento.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                            </tr>
                          )}
                          {/* Total de la opción con descuento */}
                          <tr className="border-t-2 border-blue-300">
                            <td colSpan={presupuestoData.showMeasuresInPDF ? 4 : 3}></td>
                            <td className="px-2 py-3 font-bold text-blue-900 text-right">Total {nombreOpcion}:</td>
                            <td className="px-2 py-3 font-bold text-blue-900 text-right">${datosOpcion.total.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            // Render para presupuesto normal (agrupado por espacio)
            <div className="overflow-x-auto mb-8">
              <table className="w-full" style={{ fontSize: '13px' }}>
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-2 py-2 font-semibold text-left text-gray-900" style={{ width: '15%' }}>Producto</th>
                    <th className="px-2 py-2 font-semibold text-left text-gray-900" style={{ width: presupuestoData.showMeasuresInPDF ? '30%' : '40%' }}>Descripción</th>
                    {presupuestoData.showMeasuresInPDF && (
                      <th className="px-2 py-2 font-semibold text-left text-gray-900" style={{ width: '15%' }}>Medidas</th>
                    )}
                    <th className="px-2 py-2 font-semibold text-right text-gray-900" style={{ width: '13%' }}>Precio Unit.</th>
                    <th className="px-2 py-2 font-semibold text-center text-gray-900" style={{ width: '10%' }}>Cant.</th>
                    <th className="px-2 py-2 font-semibold text-right text-gray-900" style={{ width: '17%' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(productosAgrupados).map(([espacio, productos]) => (
                    <React.Fragment key={espacio}>
                      <tr>
                        <td colSpan={presupuestoData.showMeasuresInPDF ? 6 : 5} className="px-2 py-2 font-bold text-left text-gray-900 bg-gray-50">
                          {espacio}
                        </td>
                      </tr>
                      {productos.map((producto, index) => (
                        <React.Fragment key={index}>
                          <tr>
                            <td className="px-2 py-2 text-gray-900">{producto.nombre}</td>
                            <td className="px-2 py-2 text-gray-900">{
                              (() => {
                                if (producto.nombre?.toLowerCase().includes('dunes')) {
                                  const detalles = [];
                                  
                                  if (producto.tipoApertura) {
                                    if (producto.tipoApertura === 'cadena_cordon') {
                                      detalles.push('Apertura con Cadena y Cordón');
                                    } else if (producto.tipoApertura === 'baston') {
                                      detalles.push('Apertura con Bastón');
                                    }
                                  }
                                  
                                  if (producto.colorSistema) {
                                    detalles.push(`Color: ${producto.colorSistema}`);
                                  }
                                  
                                  if (producto.ladoComando) {
                                    detalles.push(`Comando: ${producto.ladoComando}`);
                                  }
                                  
                                  if (producto.ladoApertura) {
                                    detalles.push(`Apertura: ${producto.ladoApertura}`);
                                  }
                                  
                                  if (producto.detalle && producto.detalle.trim() !== '') {
                                    detalles.push(`Detalles: ${producto.detalle}`);
                                  }
                                  
                                  return detalles.length > 0 ? detalles.join(' | ') : 'Sistema Dunes';
                                }
                                
                                const descripcionLimpia = producto.descripcion.replace(/^\s*\d+\s*cm\s*x\s*\d+\s*cm\s*-\s*/i, '');
                                
                                if (!descripcionLimpia || descripcionLimpia.trim() === '') {
                                  return producto.tipoTela || 'Sin descripción';
                                }
                                
                                return descripcionLimpia;
                              })()
                            }</td>
                            {presupuestoData.showMeasuresInPDF && (
                              <td className="px-2 py-2 text-gray-900" style={{ fontSize: '12px', lineHeight: '1.3' }}>
                                {(() => {
                                  if (producto.ancho && producto.alto) {
                                    return (
                                      <>
                                        <div>Alto: {producto.alto}cm</div>
                                        <div>Ancho: {producto.ancho}cm</div>
                                      </>
                                    );
                                  }
                                  return 'Sin medidas';
                                })()}
                              </td>
                            )}
                            <td className="px-2 py-2 text-gray-900 text-right">${producto.precioUnitario.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                            <td className="px-2 py-2 text-gray-900 text-center">{producto.cantidad}</td>
                            <td className="px-2 py-2 text-gray-900 text-right">${producto.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                          </tr>
                          {producto.incluirMotorizacion && (
                            <tr>
                              <td colSpan={presupuestoData.showMeasuresInPDF ? 5 : 4} className="px-2 py-2 font-bold text-gray-900">Motorización</td>
                              <td className="px-2 py-2 text-gray-900 text-right">${producto.precioMotorizacion?.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
                  <tr>
                    <td colSpan={presupuestoData.showMeasuresInPDF ? 4 : 3}></td>
                    <td className="px-2 py-2 font-bold text-gray-900 text-right">Subtotal</td>
                    <td className="px-2 py-2 text-gray-900 text-right">${presupuestoData.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                  </tr>
                  {presupuestoData.descuento > 0 && (
                    <tr>
                      <td colSpan={presupuestoData.showMeasuresInPDF ? 4 : 3}></td>
                      <td className="px-2 py-2 font-bold text-gray-900 text-right">Descuento</td>
                      <td className="px-2 py-2 text-gray-900 text-right">-${presupuestoData.descuento.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={presupuestoData.showMeasuresInPDF ? 4 : 3}></td>
                    <td className="px-2 py-2 font-bold text-gray-900 text-right">Total</td>
                    <td className="px-2 py-2 font-bold text-gray-900 text-right">${presupuestoData.total.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

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
