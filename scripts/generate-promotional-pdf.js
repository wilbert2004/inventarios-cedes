const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

/**
 * Genera un PDF promocional desde el archivo TEXTO_PROMOCIONAL.md
 */
function generatePromotionalPDF() {
    try {
        // Leer el archivo markdown
        const markdownPath = path.join(__dirname, '..', 'TEXTO_PROMOCIONAL.md');
        const markdownContent = fs.readFileSync(markdownPath, 'utf-8');

        // Crear documento PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);
        let yPosition = margin;

        // Función para agregar nueva página si es necesario
        const checkPageBreak = (requiredSpace = 10) => {
            if (yPosition + requiredSpace > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
                return true;
            }
            return false;
        };

        // Función para agregar texto con wrap automático
        const addText = (text, fontSize = 12, isBold = false, color = [0, 0, 0], align = 'left') => {
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');
            doc.setTextColor(...color);
            
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach((line) => {
                checkPageBreak(fontSize * 0.5);
                doc.text(line, margin, yPosition, { align });
                yPosition += fontSize * 0.5;
            });
        };

        // Función para remover emojis y markdown básico
        const cleanText = (text) => {
            return text
                .replace(/[#🛒✨🚀📦📊👥🔍💾🖨️🎨🔒🎯💼🎁📞✅]/g, '')
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/\*(.*?)\*/g, '$1')
                .replace(/^#{1,6}\s+/gm, '')
                .replace(/^-\s+/gm, '• ')
                .replace(/^---$/gm, '')
                .trim();
        };

        // Parsear el contenido
        const lines = markdownContent.split('\n');
        let currentSection = '';
        let inList = false;

        // Encabezado principal
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Absolute POS', pageWidth / 2, 25, { align: 'center' });
        doc.setFontSize(14);
        doc.text('Sistema de Punto de Venta', pageWidth / 2, 35, { align: 'center' });
        
        yPosition = 50;
        doc.setTextColor(0, 0, 0);

        // Procesar cada línea
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (!line) {
                if (inList) {
                    yPosition += 5;
                    inList = false;
                } else {
                    yPosition += 8;
                }
                continue;
            }

            // Títulos principales (##)
            if (line.startsWith('## ')) {
                checkPageBreak(20);
                yPosition += 10;
                const title = cleanText(line);
                addText(title, 18, true, [41, 128, 185], 'left');
                yPosition += 5;
                continue;
            }

            // Subtítulos (###)
            if (line.startsWith('### ')) {
                checkPageBreak(15);
                yPosition += 8;
                const subtitle = cleanText(line);
                addText(subtitle, 14, true, [52, 73, 94], 'left');
                yPosition += 3;
                continue;
            }

            // Separadores (---)
            if (line.startsWith('---')) {
                checkPageBreak(10);
                yPosition += 5;
                doc.setDrawColor(200, 200, 200);
                doc.line(margin, yPosition, pageWidth - margin, yPosition);
                yPosition += 10;
                continue;
            }

            // Listas (- o •)
            if (line.startsWith('- ') || line.startsWith('• ')) {
                inList = true;
                const listItem = cleanText(line);
                checkPageBreak(8);
                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(60, 60, 60);
                const lines_wrapped = doc.splitTextToSize('  • ' + listItem, maxWidth - 10);
                lines_wrapped.forEach((itemLine) => {
                    doc.text(itemLine, margin + 5, yPosition, { align: 'left' });
                    yPosition += 6;
                });
                continue;
            }

            // Texto normal
            if (line && !line.startsWith('#')) {
                inList = false;
                const cleanLine = cleanText(line);
                if (cleanLine) {
                    // Detectar texto en negrita para destacar
                    const isBold = line.includes('**');
                    const fontSize = isBold ? 12 : 11;
                    const color = isBold ? [44, 62, 80] : [60, 60, 60];
                    addText(cleanLine, fontSize, isBold, color, 'left');
                    yPosition += 3;
                }
            }
        }

        // Pie de página en cada página
        const totalPages = doc.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Página ${i} de ${totalPages}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
            doc.text(
                'Absolute POS - Sistema de Punto de Venta',
                pageWidth / 2,
                pageHeight - 5,
                { align: 'center' }
            );
        }

        // Guardar el PDF
        const outputPath = path.join(__dirname, '..', 'Absolute-POS-Promocional.pdf');
        doc.save(outputPath);

        console.log('✅ PDF generado exitosamente!');
        console.log(`📄 Ubicación: ${outputPath}`);
        console.log(`📊 Total de páginas: ${totalPages}`);

        return outputPath;
    } catch (error) {
        console.error('❌ Error al generar el PDF:', error);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    generatePromotionalPDF();
}

module.exports = { generatePromotionalPDF };
