import React from "react";

export const ResponsiblesForm = ({ data, onChange }) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
                Responsables de Resguardo
            </h3>

            {/* Quien Entrega */}
            <div className="mb-6 pb-6 border-b border-slate-200">
                <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">
                        1
                    </span>
                    Quien Entrega
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nombre Completo *
                        </label>
                        <input
                            type="text"
                            value={data.deliveredByName}
                            onChange={(e) => onChange({ deliveredByName: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Juan García López"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Puesto/Cargo *
                        </label>
                        <input
                            type="text"
                            value={data.deliveredByPosition}
                            onChange={(e) => onChange({ deliveredByPosition: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Encargado de Almacén"
                        />
                    </div>
                </div>
            </div>

            {/* Quien Transporta */}
            <div className="mb-6 pb-6 border-b border-slate-200">
                <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">
                        2
                    </span>
                    Quien Transporta
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nombre Completo *
                        </label>
                        <input
                            type="text"
                            value={data.transportedByName}
                            onChange={(e) => onChange({ transportedByName: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Carlos Mendez López"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Licencia/Credencial
                        </label>
                        <input
                            type="text"
                            value={data.transportedByLicense}
                            onChange={(e) => onChange({ transportedByLicense: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Lic. ABC-123-456"
                        />
                    </div>
                </div>
            </div>

            {/* Quien Recibe */}
            <div>
                <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">
                        3
                    </span>
                    Quien Recibe (en CEDES)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nombre Completo *
                        </label>
                        <input
                            type="text"
                            value={data.receivedByName}
                            onChange={(e) => onChange({ receivedByName: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: María Rodriguez Pérez"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Puesto/Cargo *
                        </label>
                        <input
                            type="text"
                            value={data.receivedByPosition}
                            onChange={(e) => onChange({ receivedByPosition: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Encargada de Resguardo"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

ResponsiblesForm.displayName = "ResponsiblesForm";
