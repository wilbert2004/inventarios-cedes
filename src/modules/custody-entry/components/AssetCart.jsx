import React from "react";
import { Trash2, AlertCircle } from "lucide-react";

export const AssetCart = ({ items, onRemove }) => {
    if (items.length === 0) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-blue-900 font-medium">
                            No hay bienes agregados
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                            Agregue al menos un bien para continuar
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
                Bienes en Resguardo ({items.length})
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-slate-700">
                                Inv. #
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-slate-700">
                                Descripción
                            </th>
                            <th className="px-4 py-2 text-center font-medium text-slate-700">
                                Qty
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-slate-700">
                                Serie
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-slate-700">
                                Condición
                            </th>
                            <th className="px-4 py-2 text-center font-medium text-slate-700">
                                Acción
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr
                                key={item.tempId}
                                className="border-b border-slate-100 hover:bg-slate-50"
                            >
                                <td className="px-4 py-3 font-mono text-xs text-slate-900">
                                    {item.inventoryNumber}
                                </td>
                                <td className="px-4 py-3 text-slate-900">
                                    <div>{item.description}</div>
                                    {item.brand && (
                                        <div className="text-xs text-slate-500">
                                            {item.brand}
                                            {item.model && ` / ${item.model}`}
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center text-slate-900">
                                    {item.quantity}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-600">
                                    {item.serialNumber || "-"}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${item.initialCondition === "BUENO"
                                                ? "bg-green-100 text-green-800"
                                                : item.initialCondition === "DAÑADO"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {item.initialCondition}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => onRemove(item.tempId)}
                                        className="p-1 hover:bg-red-50 text-red-600 rounded transition"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-slate-600">Total de Bienes</p>
                        <p className="text-2xl font-bold text-slate-900">{items.length}</p>
                    </div>
                    <div>
                        <p className="text-slate-600">Cantidad Total</p>
                        <p className="text-2xl font-bold text-slate-900">
                            {items.reduce((sum, item) => sum + item.quantity, 0)}
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-600">En Bueno</p>
                        <p className="text-2xl font-bold text-green-600">
                            {items.filter((i) => i.initialCondition === "BUENO").length}
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-600">Con Daños</p>
                        <p className="text-2xl font-bold text-yellow-600">
                            {items.filter(
                                (i) =>
                                    i.initialCondition === "DAÑADO" ||
                                    i.initialCondition === "DEFECTUOSO"
                            ).length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

AssetCart.displayName = "AssetCart";
