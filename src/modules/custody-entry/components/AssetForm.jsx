import React, { useState } from "react";

export const AssetForm = ({ onAddItem }) => {
    const [asset, setAsset] = useState({
        quantity: 1,
        inventoryNumber: "",
        description: "",
        brand: "",
        model: "",
        serialNumber: "",
        reason: "RESGUARDO",
        initialCondition: "BUENO",
        notes: "",
    });

    const [errors, setErrors] = useState({});

    const validateAsset = () => {
        const newErrors = {};

        if (!asset.inventoryNumber.trim()) {
            newErrors.inventoryNumber = "Número de inventario requerido";
        }
        if (!asset.description.trim()) {
            newErrors.description = "Descripción requerida";
        }
        if (asset.quantity < 1) {
            newErrors.quantity = "Cantidad debe ser mayor a 0";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateAsset()) {
            onAddItem(asset);
            // Reset form
            setAsset({
                quantity: 1,
                inventoryNumber: "",
                description: "",
                brand: "",
                model: "",
                serialNumber: "",
                reason: "RESGUARDO",
                initialCondition: "BUENO",
                notes: "",
            });
            setErrors({});
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
                Agregar Bien
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Fila 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Número de Inventario *
                        </label>
                        <input
                            type="text"
                            value={asset.inventoryNumber}
                            onChange={(e) => {
                                setAsset({ ...asset, inventoryNumber: e.target.value });
                                if (errors.inventoryNumber) setErrors({ ...errors, inventoryNumber: "" });
                            }}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.inventoryNumber
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-slate-300 focus:ring-blue-500"
                                }`}
                            placeholder="INV-2024-001"
                        />
                        {errors.inventoryNumber && (
                            <p className="text-xs text-red-500 mt-1">{errors.inventoryNumber}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Cantidad *
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={asset.quantity}
                            onChange={(e) => {
                                setAsset({ ...asset, quantity: parseInt(e.target.value) || 1 });
                                if (errors.quantity) setErrors({ ...errors, quantity: "" });
                            }}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.quantity
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-slate-300 focus:ring-blue-500"
                                }`}
                        />
                        {errors.quantity && (
                            <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Motivo *
                        </label>
                        <select
                            value={asset.reason}
                            onChange={(e) => setAsset({ ...asset, reason: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="RESGUARDO">Resguardo</option>
                            <option value="TRASLADO">Traslado</option>
                            <option value="BAJA">Baja</option>
                        </select>
                    </div>
                </div>

                {/* Fila 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Descripción del Bien *
                        </label>
                        <input
                            type="text"
                            value={asset.description}
                            onChange={(e) => {
                                setAsset({ ...asset, description: e.target.value });
                                if (errors.description) setErrors({ ...errors, description: "" });
                            }}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.description
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-slate-300 focus:ring-blue-500"
                                }`}
                            placeholder="Ej: Escritorio de metal"
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500 mt-1">{errors.description}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Marca
                        </label>
                        <input
                            type="text"
                            value={asset.brand}
                            onChange={(e) => setAsset({ ...asset, brand: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Dell"
                        />
                    </div>
                </div>

                {/* Fila 3 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Modelo
                        </label>
                        <input
                            type="text"
                            value={asset.model}
                            onChange={(e) => setAsset({ ...asset, model: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Latitude 5520"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Número de Serie
                        </label>
                        <input
                            type="text"
                            value={asset.serialNumber}
                            onChange={(e) => setAsset({ ...asset, serialNumber: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: ABC123XYZ"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Condición Inicial
                        </label>
                        <select
                            value={asset.initialCondition}
                            onChange={(e) => setAsset({ ...asset, initialCondition: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="BUENO">Bueno</option>
                            <option value="DAÑADO">Dañado</option>
                            <option value="DEFECTUOSO">Defectuoso</option>
                        </select>
                    </div>
                </div>

                {/* Notas */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Notas
                    </label>
                    <textarea
                        value={asset.notes}
                        onChange={(e) => setAsset({ ...asset, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="2"
                        placeholder="Observaciones adicionales..."
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
                >
                    + Agregar Bien al Resguardo
                </button>
            </form>
        </div>
    );
};

AssetForm.displayName = "AssetForm";
