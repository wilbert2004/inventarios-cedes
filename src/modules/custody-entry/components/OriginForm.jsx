import React from "react";

export const OriginForm = ({ data, onChange }) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
                Datos del Origen (Planta/Centro)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nombre de la Planta *
                    </label>
                    <input
                        type="text"
                        value={data.plantName}
                        onChange={(e) => onChange({ plantName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: CEDES Central"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Código de Planta
                    </label>
                    <input
                        type="text"
                        value={data.plantCode}
                        onChange={(e) => onChange({ plantCode: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: CD-001"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Dirección
                    </label>
                    <input
                        type="text"
                        value={data.address}
                        onChange={(e) => onChange({ address: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Calle, número, etc."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Municipio
                    </label>
                    <input
                        type="text"
                        value={data.municipality}
                        onChange={(e) => onChange({ municipality: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Mérida"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Zona/Sector
                    </label>
                    <input
                        type="text"
                        value={data.zone}
                        onChange={(e) => onChange({ zone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Zona Norte"
                    />
                </div>
            </div>
        </div>
    );
};

OriginForm.displayName = "OriginForm";
