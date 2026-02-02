import { useState, useCallback, useRef } from "react";

export const useCustodyEntry = () => {
    const [formData, setFormData] = useState({
        folio: "",
        origin: {
            plantName: "",
            plantCode: "",
            address: "",
            municipality: "",
            zone: "",
        },
        entryDate: new Date().toISOString().split("T")[0],
        responsibles: {
            deliveredByName: "",
            deliveredByPosition: "",
            transportedByName: "",
            transportedByLicense: "",
            receivedByName: "",
            receivedByPosition: "",
        },
    });

    const [custodyItems, setCustodyItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const formRef = useRef(null);

    // Validación de folio único
    const validateFolio = useCallback(async (folio) => {
        if (!folio.trim()) {
            setError("El folio es requerido");
            return false;
        }
        try {
            const result = await window.custody.checkFolioExists(folio);
            if (result.exists) {
                setError("Este folio ya existe");
                return false;
            }
            setError("");
            return true;
        } catch (err) {
            setError(`Error validando folio: ${err.message}`);
            return false;
        }
    }, []);

    // Actualizar datos del origen
    const updateOrigin = useCallback((data) => {
        setFormData((prev) => ({
            ...prev,
            origin: { ...prev.origin, ...data },
        }));
        setError("");
    }, []);

    // Actualizar responsables
    const updateResponsibles = useCallback((data) => {
        setFormData((prev) => ({
            ...prev,
            responsibles: { ...prev.responsibles, ...data },
        }));
        setError("");
    }, []);

    // Agregar bien al carrito
    const addCustodyItem = useCallback((item) => {
        // Validar inventario# único
        if (custodyItems.some((i) => i.inventoryNumber === item.inventoryNumber)) {
            setError("Este número de inventario ya fue agregado");
            return false;
        }

        // Validar serial# único si existe
        if (item.serialNumber && custodyItems.some((i) => i.serialNumber === item.serialNumber)) {
            setError("Este número de serie ya fue agregado");
            return false;
        }

        setCustodyItems((prev) => [...prev, { ...item, tempId: Date.now() }]);
        setError("");
        return true;
    }, [custodyItems]);

    // Eliminar bien del carrito
    const removeCustodyItem = useCallback((tempId) => {
        setCustodyItems((prev) => prev.filter((item) => item.tempId !== tempId));
    }, []);

    // Validar formulario completo
    const validateForm = useCallback(() => {
        const errors = [];

        // Validar folio
        if (!formData.folio.trim()) {
            errors.push("Folio es requerido");
        }

        // Validar origen
        if (!formData.origin.plantName.trim()) {
            errors.push("Nombre de la planta es requerido");
        }

        // Validar responsables
        if (!formData.responsibles.deliveredByName.trim()) {
            errors.push("Nombre de quien entrega es requerido");
        }
        if (!formData.responsibles.transportedByName.trim()) {
            errors.push("Nombre de quien transporta es requerido");
        }
        if (!formData.responsibles.receivedByName.trim()) {
            errors.push("Nombre de quien recibe es requerido");
        }

        // Validar items
        if (custodyItems.length === 0) {
            errors.push("Debe agregar al menos un bien");
        }

        if (errors.length > 0) {
            setError(errors.join("\n"));
            return false;
        }

        setError("");
        return true;
    }, [formData, custodyItems]);

    // Guardar resguardo
    const saveCustodyEntry = useCallback(async () => {
        if (!validateForm()) {
            return false;
        }

        setLoading(true);
        try {
            const payload = {
                folio: formData.folio,
                origin: formData.origin,
                entryDate: formData.entryDate,
                responsibles: formData.responsibles,
                items: custodyItems,
            };

            const result = await window.custody.createCustodyEntry(payload);

            if (result.success) {
                setSuccess(`Resguardo ${result.folio} registrado exitosamente`);
                // Reset form
                setFormData({
                    folio: "",
                    origin: {
                        plantName: "",
                        plantCode: "",
                        address: "",
                        municipality: "",
                        zone: "",
                    },
                    entryDate: new Date().toISOString().split("T")[0],
                    responsibles: {
                        deliveredByName: "",
                        deliveredByPosition: "",
                        transportedByName: "",
                        transportedByLicense: "",
                        receivedByName: "",
                        receivedByPosition: "",
                    },
                });
                setCustodyItems([]);
                return true;
            } else {
                setError(result.message || "Error guardando resguardo");
                return false;
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    }, [formData, custodyItems, validateForm]);

    // Generar comprobante PDF
    const generateVoucher = useCallback(async (custodyId) => {
        try {
            setLoading(true);
            await window.reports.generateCustodyVoucher(custodyId);
            setSuccess("Comprobante generado exitosamente");
        } catch (err) {
            setError(`Error generando comprobante: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        formData,
        setFormData,
        custodyItems,
        setCustodyItems,
        loading,
        error,
        success,
        formRef,
        validateFolio,
        updateOrigin,
        updateResponsibles,
        addCustodyItem,
        removeCustodyItem,
        validateForm,
        saveCustodyEntry,
        generateVoucher,
        clearMessages: () => {
            setError("");
            setSuccess("");
        },
    };
};
