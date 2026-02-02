import React from "react";
import { FileText, AlertCircle } from "lucide-react";

export const SummaryPanel = ({ formData, custodyItems, loading, error, success, onSubmit, onGenerateVoucher }) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
                Resumen del Resguardo
            </h3>

            {/* Resumen de datos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Columna izquierda */}
                <div>
                    <h4 className="font-medium text-slate-700 mb-3">Información General</h4>
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-slate-600">Folio:</dt>
                            <dd className="font-mono font-medium text-slate-900">
                                {formData.folio || "N/A"}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-600">Fecha:</dt>
                            <dd className="font-medium text-slate-900">
                                {formData.entryDate}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-600">Planta:</dt>
                            <dd className="font-medium text-slate-900">
                                {formData.origin.plantName || "N/A"}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-600">Municipio:</dt>
                            <dd className="font-medium text-slate-900">
                                {formData.origin.municipality || "N/A"}
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Columna derecha */}
                <div>
                    <h4 className="font-medium text-slate-700 mb-3">Estadísticas</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                            <p className="text-xs text-blue-600 font-medium">Total Bienes</p>
                            <p className="text-2xl font-bold text-blue-900">
                                {custodyItems.length}
                            </p>
                        </div>
                        <div className="bg-green-50 p-3 rounded border border-green-200">
                            <p className="text-xs text-green-600 font-medium">Cantidad Total</p>
                            <p className="text-2xl font-bold text-green-900">
                                {custodyItems.reduce((sum, item) => sum + item.quantity, 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Responsables */}
            <div className="mb-6 pb-6 border-t border-slate-200 pt-6">
                <h4 className="font-medium text-slate-700 mb-3">Responsables</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <p className="text-xs text-slate-600 font-medium mb-1">Entrega</p>
                        <p className="font-medium text-slate-900">
                            {formData.responsibles.deliveredByName || "Pendiente"}
                        </p>
                        <p className="text-xs text-slate-600">
                            {formData.responsibles.deliveredByPosition}
                        </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <p className="text-xs text-slate-600 font-medium mb-1">Transporte</p>
                        <p className="font-medium text-slate-900">
                            {formData.responsibles.transportedByName || "Pendiente"}
                        </p>
                        <p className="text-xs text-slate-600">
                            {formData.responsibles.transportedByLicense}
                        </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <p className="text-xs text-slate-600 font-medium mb-1">Recibe (CEDES)</p>
                        <p className="font-medium text-slate-900">
                            {formData.responsibles.receivedByName || "Pendiente"}
                        </p>
                        <p className="text-xs text-slate-600">
                            {formData.responsibles.receivedByPosition}
                        </p>
                    </div>
                </div>
            </div>

            {/* Mensajes */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700 whitespace-pre-wrap">{error}</div>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-green-700">{success}</p>
                </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3">
                <button
                    onClick={onSubmit}
                    disabled={loading || custodyItems.length === 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                    <span>✓</span>
                    {loading ? "Guardando..." : "Registrar Resguardo"}
                </button>

                <button
                    onClick={onGenerateVoucher}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                    <FileText className="w-4 h-4" />
                    {loading ? "Generando..." : "Generar Comprobante"}
                </button>
            </div>

            <p className="text-xs text-slate-500 mt-3 text-center">
                Asegúrate de completar todos los campos requeridos antes de guardar
            </p>
        </div>
    );
};

SummaryPanel.displayName = "SummaryPanel";
