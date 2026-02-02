import * as React from 'react';

export function MovementsTable({ movements }) {
    return (
        <div className="overflow-auto border rounded">
            <table className="w-full text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">Fecha</th>
                        <th className="p-2 text-left">Producto</th>
                        <th className="p-2 text-left">Código</th>
                        <th className="p-2 text-left">Tipo</th>
                        <th className="p-2 text-right">Cantidad</th>
                        <th className="p-2 text-left">Folio/Ref</th>
                        <th className="p-2 text-left">Usuario</th>
                    </tr>
                </thead>
                <tbody>
                    {movements.map((m) => (
                        <tr key={m.id} className="border-t">
                            <td className="p-2">{new Date(m.created_at).toLocaleString('es-ES')}</td>
                            <td className="p-2">{m.product_name}</td>
                            <td className="p-2">{m.product_barcode}</td>
                            <td className="p-2">{m.type}</td>
                            <td className="p-2 text-right">{m.quantity}</td>
                            <td className="p-2">{m.reference}</td>
                            <td className="p-2">{m.user_name}</td>
                        </tr>
                    ))}
                    {movements.length === 0 && (
                        <tr>
                            <td className="p-3 text-center" colSpan={7}>Sin registros</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
