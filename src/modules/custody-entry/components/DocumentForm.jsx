import React from "react";

export const DocumentForm = ({ folio, entryDate, onFolioChange, onDateChange, onValidateFolio }) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
                Datos del Documento
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Folio (Número de Documento) *
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={folio}
                            onChange={(e) => onFolioChange(e.target.value)}
                            onBlur={() => onValidateFolio(folio)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                            placeholder="RSG-2024-001"
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Formato: RSG-AAAA-###
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Fecha de Entrada *
                    </label>
                    <input
                        type="date"
                        value={entryDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};

DocumentForm.displayName = "DocumentForm";
