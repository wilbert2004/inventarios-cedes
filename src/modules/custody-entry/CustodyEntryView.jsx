import React, { useEffect } from "react";
import { OriginForm } from "./components/OriginForm";
import { DocumentForm } from "./components/DocumentForm";
import { AssetForm } from "./components/AssetForm";
import { AssetCart } from "./components/AssetCart";
import { ResponsiblesForm } from "./components/ResponsiblesForm";
import { SummaryPanel } from "./components/SummaryPanel";
import { useCustodyEntry } from "./hooks/useCustodyEntry";

export default function CustodyEntryView() {
    const {
        formData,
        setFormData,
        custodyItems,
        loading,
        error,
        success,
        validateFolio,
        updateOrigin,
        updateResponsibles,
        addCustodyItem,
        removeCustodyItem,
        saveCustodyEntry,
        generateVoucher,
        clearMessages,
    } = useCustodyEntry();

    // Auto-clear success messages after 5 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(clearMessages, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, clearMessages]);

    return (
        <div className="min-h-screen bg-slate-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Registro de Resguardo de Bienes
                    </h1>
                    <p className="text-slate-600">
                        Centro de Distribución y Resguardo (CEDES) - YUCATAN SEGEY
                    </p>
                </div>

                {/* Formulario */}
                <div className="space-y-6">
                    {/* Sección 1: Documento */}
                    <DocumentForm
                        folio={formData.folio}
                        entryDate={formData.entryDate}
                        onFolioChange={(value) => setFormData({ ...formData, folio: value })}
                        onDateChange={(value) => setFormData({ ...formData, entryDate: value })}
                        onValidateFolio={validateFolio}
                    />

                    {/* Sección 2: Origen */}
                    <OriginForm data={formData.origin} onChange={updateOrigin} />

                    {/* Sección 3: Responsables */}
                    <ResponsiblesForm
                        data={formData.responsibles}
                        onChange={updateResponsibles}
                    />

                    {/* Sección 4: Agregar Bienes */}
                    <AssetForm onAddItem={addCustodyItem} />

                    {/* Sección 5: Carrito de Bienes */}
                    <AssetCart items={custodyItems} onRemove={removeCustodyItem} />

                    {/* Sección 6: Resumen y Acciones */}
                    <SummaryPanel
                        formData={formData}
                        custodyItems={custodyItems}
                        loading={loading}
                        error={error}
                        success={success}
                        onSubmit={saveCustodyEntry}
                        onGenerateVoucher={() => generateVoucher(formData.folio)}
                    />
                </div>

                {/* Ayuda */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <p className="font-medium mb-2">Ayuda:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>El folio debe ser único y en formato: RSG-AAAA-###</li>
                        <li>El número de inventario identifica de forma única cada bien</li>
                        <li>Se puede agregar el número de serie para mayor trazabilidad</li>
                        <li>Todos los responsables deben ser completados</li>
                        <li>El comprobante se genera en PDF con formato oficial</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
