'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Input,
  Switch,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  addToast,
  Spinner,
} from '@heroui/react';
import { ReglaNegocio, ReglaNegocioInput } from '@/types/reglasNegocio';

const emptyForm: ReglaNegocioInput = {
  nombreSistema: '',
  matchKey: '',
  areaMinimaM2: 0,
  anchoMinimoCm: 0,
  activo: true,
};

export default function ReglasNegocioManager() {
  const [reglas, setReglas] = useState<ReglaNegocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ReglaNegocio | null>(null);
  const [form, setForm] = useState<ReglaNegocioInput>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<ReglaNegocio | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchReglas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/reglas-negocio`);
      if (!res.ok) throw new Error('No se pudieron cargar las reglas');
      const data = await res.json();
      setReglas(
        Array.isArray(data)
          ? data.map((r: ReglaNegocio) => ({
              ...r,
              areaMinimaM2: Number(r.areaMinimaM2),
              anchoMinimoCm: Number(r.anchoMinimoCm),
            }))
          : []
      );
    } catch (error) {
      console.error(error);
      addToast({ title: 'Error', description: 'No se pudieron cargar las reglas de negocio', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReglas();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (regla: ReglaNegocio) => {
    setEditing(regla);
    setForm({
      nombreSistema: regla.nombreSistema,
      matchKey: regla.matchKey,
      areaMinimaM2: Number(regla.areaMinimaM2),
      anchoMinimoCm: Number(regla.anchoMinimoCm),
      activo: regla.activo,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombreSistema.trim() || !form.matchKey.trim()) {
      addToast({ title: 'Datos incompletos', description: 'Nombre y clave de coincidencia son obligatorios', color: 'warning' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        nombreSistema: form.nombreSistema.trim(),
        matchKey: form.matchKey.trim().toLowerCase(),
        areaMinimaM2: Number(form.areaMinimaM2) || 0,
        anchoMinimoCm: Number(form.anchoMinimoCm) || 0,
      };

      const url = editing ? `${apiUrl}/reglas-negocio/${editing.id}` : `${apiUrl}/reglas-negocio`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al guardar');
      }

      addToast({
        title: editing ? 'Regla actualizada' : 'Regla creada',
        description: `${payload.nombreSistema} guardada correctamente`,
        color: 'success',
      });
      setIsModalOpen(false);
      await fetchReglas();
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar la regla',
        color: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/reglas-negocio/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar');
      addToast({ title: 'Regla eliminada', description: deleteTarget.nombreSistema, color: 'success' });
      setDeleteTarget(null);
      await fetchReglas();
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar',
        color: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text">Reglas de negocio</h1>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
            Mínimos facturables por sistema. Si el área o el ancho pedidos son menores, se presupuesta el mínimo.
          </p>
        </div>
        <Button color="primary" onPress={openCreate}>
          Agregar regla
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner label="Cargando reglas..." />
        </div>
      ) : (
        <Table aria-label="Tabla de reglas de negocio" className="min-h-[200px]">
          <TableHeader>
            <TableColumn>SISTEMA</TableColumn>
            <TableColumn>CLAVE</TableColumn>
            <TableColumn>ÁREA MÍN. (m²)</TableColumn>
            <TableColumn>ANCHO MÍN. (cm)</TableColumn>
            <TableColumn>ACTIVA</TableColumn>
            <TableColumn>ACCIONES</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay reglas configuradas">
            {reglas.map((regla) => (
              <TableRow key={regla.id}>
                <TableCell className="font-medium">{regla.nombreSistema}</TableCell>
                <TableCell>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{regla.matchKey}</code>
                </TableCell>
                <TableCell>{Number(regla.areaMinimaM2).toFixed(2)}</TableCell>
                <TableCell>{Number(regla.anchoMinimoCm).toFixed(0)}</TableCell>
                <TableCell>
                  <span className={regla.activo ? 'text-teal-600' : 'text-gray-400'}>
                    {regla.activo ? 'Sí' : 'No'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="flat" color="primary" onPress={() => openEdit(regla)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="flat" color="danger" onPress={() => setDeleteTarget(regla)}>
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{editing ? 'Editar regla' : 'Nueva regla'}</ModalHeader>
              <ModalBody className="gap-3">
                <Input
                  label="Nombre del sistema"
                  placeholder="Ej: Roller, Dubai, Paneles"
                  value={form.nombreSistema}
                  onValueChange={(v) => setForm((p) => ({ ...p, nombreSistema: v }))}
                />
                <Input
                  label="Clave de coincidencia"
                  description="Se busca dentro del nombre del sistema (ej: roller, dubai, veneciana)"
                  placeholder="ej: roller"
                  value={form.matchKey}
                  onValueChange={(v) => setForm((p) => ({ ...p, matchKey: v }))}
                />
                <Input
                  type="number"
                  label="Área mínima (m²)"
                  description="0 = sin mínimo de área"
                  value={String(form.areaMinimaM2)}
                  onValueChange={(v) => setForm((p) => ({ ...p, areaMinimaM2: Number(v) || 0 }))}
                  min={0}
                  step={0.1}
                />
                <Input
                  type="number"
                  label="Ancho mínimo (cm)"
                  description="0 = sin mínimo de ancho"
                  value={String(form.anchoMinimoCm)}
                  onValueChange={(v) => setForm((p) => ({ ...p, anchoMinimoCm: Number(v) || 0 }))}
                  min={0}
                  step={1}
                />
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-700 dark:text-dark-text">Regla activa</span>
                  <Switch
                    isSelected={form.activo}
                    onValueChange={(v) => setForm((p) => ({ ...p, activo: v }))}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancelar</Button>
                <Button color="primary" isLoading={saving} onPress={handleSave}>
                  Guardar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Eliminar regla</ModalHeader>
              <ModalBody>
                ¿Eliminar la regla de <strong>{deleteTarget?.nombreSistema}</strong>? Los presupuestos usarán el fallback local si no hay regla.
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancelar</Button>
                <Button color="danger" isLoading={saving} onPress={handleDelete}>
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
