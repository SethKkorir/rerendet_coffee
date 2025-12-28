// utils/invoiceGenerator.js
import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a professional PDF invoice for an order
 * @param {Object} order - The order object
 * @param {Object} [res] - Optional response object to stream PDF to. If null, returns a Promise<Buffer>
 * @returns {Promise<Buffer>|void}
 */
export const generateInvoice = (order, res = null) => {
    return new Promise((resolve, reject) => {
        try {
            // Create a new PDF document
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                bufferPages: true
            });

            const buffers = [];

            // Output Handling
            if (res) {
                // Stream to response (Download)
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
                doc.pipe(res);
            } else {
                // Buffer for Email Attachment
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });
            }



            // --- Colors & Fonts ---
            const primaryColor = '#6F4E37'; // Rerendet Coffee Brown
            const secondaryColor = '#8D6E63';
            const lightBg = '#F8F9FA';
            const darkText = '#2D3436';
            const lightText = '#636E72';

            // --- Header Section ---
            // Logo
            const logoPath = path.join(__dirname, '../client/public/rerendet-logo.png');
            try {
                doc.image(logoPath, 50, 45, { width: 80 });
            } catch (e) {
                console.error("Logo not found, skipping", e);
                // Fallback text if logo missing
                doc
                    .fontSize(20)
                    .font('Helvetica-Bold')
                    .fillColor(primaryColor)
                    .text('R', 50, 45);
            }

            // Company Info (Right Aligned Header)
            doc
                .fontSize(20)
                .font('Helvetica-Bold')
                .fillColor(primaryColor)
                .text('Rerendet Coffee', 0, 50, { align: 'right', indent: 50 }); // align right doesn't use x, but bounds.

            // Reset position for company details
            doc
                .fontSize(9)
                .font('Helvetica')
                .fillColor(lightText)
                .text('Premium Ethiopian Coffee', 400, 80, { align: 'right' })
                .text('Nairobi, Kenya', 400, 95, { align: 'right' })
                .text('info@rerendetcoffee.com', 400, 110, { align: 'right' })
                .text('+254 700 123 456', 400, 125, { align: 'right' });


            // --- Invoice Badge & Status ---
            // Draw a colored background for the invoice info
            const invoiceInfoTop = 160;

            doc
                .save()
                .roundedRect(50, invoiceInfoTop, 500, 70, 5)
                .fill(lightBg)
                .restore();

            // Left side of box: Invoice #
            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .fillColor(primaryColor)
                .text('INVOICE NUMBER', 70, invoiceInfoTop + 15)
                .fontSize(14)
                .font('Helvetica-Bold')
                .fillColor(darkText)
                .text(`#${order.orderNumber}`, 70, invoiceInfoTop + 35);

            // Middle of box: Date
            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .fillColor(primaryColor)
                .text('DATE MARKED', 250, invoiceInfoTop + 15)
                .fontSize(12)
                .font('Helvetica')
                .fillColor(darkText)
                .text(new Date(order.createdAt).toLocaleDateString('en-GB', {
                    year: 'numeric', month: 'long', day: 'numeric'
                }), 250, invoiceInfoTop + 35);

            // Right side of box: Total Amount
            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .fillColor(primaryColor)
                .text('TOTAL AMOUNT', 430, invoiceInfoTop + 15)
                .fontSize(14)
                .font('Helvetica-Bold')
                .fillColor(primaryColor)
                .text(`KSh ${order.total.toLocaleString()}`, 430, invoiceInfoTop + 35);


            // --- Bill To / Ship To Section ---
            const addressTop = 260;

            // Bill To
            doc
                .fontSize(11)
                .font('Helvetica-Bold')
                .fillColor(darkText)
                .text('Billed To:', 50, addressTop);

            doc
                .fontSize(10)
                .font('Helvetica')
                .fillColor(lightText)
                .text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`, 50, addressTop + 20)
                .text(order.shippingAddress.email, 50, addressTop + 35)
                .text(order.shippingAddress.phone, 50, addressTop + 50);

            // Ship To (if different? Assuming same for now but styled separately)
            doc
                .fontSize(11)
                .font('Helvetica-Bold')
                .fillColor(darkText)
                .text('Shipped To:', 300, addressTop);

            doc
                .fontSize(10)
                .font('Helvetica')
                .fillColor(lightText)
                .text(order.shippingAddress.address, 300, addressTop + 20)
                .text(`${order.shippingAddress.city}, ${order.shippingAddress.county}`, 300, addressTop + 35)
                .text(order.shippingAddress.country, 300, addressTop + 50);


            // --- Items Table ---
            const tableTop = 350;

            // Table Header
            doc
                .rect(50, tableTop, 500, 30)
                .fill(primaryColor);

            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .fillColor('#FFFFFF')
                .text('Item Request', 65, tableTop + 10)
                .text('Size', 280, tableTop + 10)
                .text('Qty', 350, tableTop + 10)
                .text('Price Check', 420, tableTop + 10)
                .text('Total', 490, tableTop + 10);

            // Table Rows
            let y = tableTop + 40;
            doc.font('Helvetica').fontSize(10);

            order.items.forEach((item, i) => {
                const isLast = i === order.items.length - 1;
                const itemTotal = item.price * item.quantity;

                // Zebra striping (optional, let's keep it clean white with border)
                // Bottom border
                doc
                    .moveTo(50, y + 20)
                    .lineTo(550, y + 20)
                    .strokeColor('#EEEEEE')
                    .lineWidth(1)
                    .stroke();

                doc
                    .fillColor(darkText)
                    .text(item.name, 65, y - 5)
                    .text(item.size, 280, y - 5)
                    .text(item.quantity.toString(), 350, y - 5)
                    .text(item.price.toLocaleString(), 420, y - 5)
                    .font('Helvetica-Bold') // Bold total
                    .text(itemTotal.toLocaleString(), 490, y - 5)
                    .font('Helvetica'); // Reset font

                y += 35;
            });

            // --- Totals Section ---
            const footerStart = y + 20;

            // Summary Box (Right Aligned)
            const summaryX = 350;

            doc
                .fontSize(10)
                .font('Helvetica')
                .fillColor(lightText)
                .text('Subtotal:', summaryX, footerStart)
                .text(`KSh ${order.subtotal.toLocaleString()}`, 490, footerStart, { align: 'left' });

            doc
                .text('Shipping:', summaryX, footerStart + 20)
                .text(`KSh ${order.shippingCost.toLocaleString()}`, 490, footerStart + 20, { align: 'left' });

            const tax = order.total - order.subtotal - order.shippingCost;
            if (tax > 0) {
                doc
                    .text('VAT (16%):', summaryX, footerStart + 40)
                    .text(`KSh ${tax.toLocaleString()}`, 490, footerStart + 40, { align: 'left' });
            }

            // Grand Total Highlight
            const grandTotalY = footerStart + 65;
            doc
                .rect(summaryX - 10, grandTotalY - 10, 210, 40)
                .fill(lightBg);

            doc
                .fontSize(12)
                .font('Helvetica-Bold')
                .fillColor(primaryColor)
                .text('Grand Total:', summaryX, grandTotalY)
                .fontSize(14)
                .text(`KSh ${order.total.toLocaleString()}`, 490, grandTotalY - 2, { align: 'left' });


            // --- Footer ---
            const pageHeight = 841.89; // A4 height in points

            doc
                .fontSize(9)
                .font('Helvetica')
                .fillColor('#999')
                .text('Thank you for choosing Rerendet Coffee.', 50, pageHeight - 70, { align: 'center', width: 500 })
                .text('Payment Status: ' + order.paymentStatus.toUpperCase(), 50, pageHeight - 55, { align: 'center', width: 500 });

            // Finalize
            doc.end();

        } catch (error) {
            console.error('Invoice generation error:', error);
            if (res && !res.headersSent) {
                res.status(500).send('Error generating invoice');
            }
            if (!res) {
                reject(error);
            }
        }
    }); // End Promise
};

export default generateInvoice;
