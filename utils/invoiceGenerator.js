// utils/invoiceGenerator.js
import PDFDocument from 'pdfkit';

/**
 * Generate a professional PDF invoice for an order
 */
export const generateInvoice = (order, res) => {
    try {
        // Create a new PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);

        // Pipe the PDF to the response
        doc.pipe(res);

        // Company Header
        doc
            .fontSize(28)
            .font('Helvetica-Bold')
            .fillColor('#6F4E37')
            .text('Rerendet Coffee', 50, 50);

        doc
            .fontSize(10)
            .font('Helvetica')
            .fillColor('#666')
            .text('Premium Ethiopian Coffee', 50, 85)
            .text('Nairobi, Kenya', 50, 100)
            .text('info@rerendetcoffee.com', 50, 115)
            .text('+254 700 123 456', 50, 130);

        // Invoice Title
        doc
            .fontSize(20)
            .font('Helvetica-Bold')
            .fillColor('#222')
            .text('INVOICE', 400, 50, { align: 'right' });

        // Invoice Details (Right side)
        doc
            .fontSize(10)
            .font('Helvetica')
            .fillColor('#666')
            .text(`Invoice #: ${order.orderNumber}`, 400, 85, { align: 'right' })
            .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}`, 400, 100, { align: 'right' })
            .text(`Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`, 400, 115, { align: 'right' });

        // Horizontal line
        doc
            .strokeColor('#ddd')
            .lineWidth(1)
            .moveTo(50, 160)
            .lineTo(550, 160)
            .stroke();

        // Billing Information
        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .fillColor('#222')
            .text('Bill To:', 50, 180);

        doc
            .fontSize(10)
            .font('Helvetica')
            .fillColor('#666')
            .text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`, 50, 200)
            .text(order.shippingAddress.address, 50, 215)
            .text(`${order.shippingAddress.city}, ${order.shippingAddress.county}`, 50, 230)
            .text(order.shippingAddress.country, 50, 245)
            .text(order.shippingAddress.phone, 50, 260)
            .text(order.shippingAddress.email, 50, 275);

        // Payment Information (Right side)
        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .fillColor('#222')
            .text('Payment Details:', 350, 180);

        doc
            .fontSize(10)
            .font('Helvetica')
            .fillColor('#666')
            .text(`Method: ${order.paymentMethod.toUpperCase()}`, 350, 200)
            .text(`Status: ${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}`, 350, 215);

        // Table Header
        const tableTop = 320;
        doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .fillColor('#fff')
            .rect(50, tableTop, 500, 25)
            .fillAndStroke('#6F4E37', '#6F4E37');

        doc
            .fillColor('#fff')
            .text('Item', 60, tableTop + 8)
            .text('Size', 250, tableTop + 8)
            .text('Qty', 320, tableTop + 8)
            .text('Price', 380, tableTop + 8)
            .text('Total', 480, tableTop + 8);

        // Table Rows
        let yPosition = tableTop + 35;
        doc.font('Helvetica').fillColor('#222');

        order.items.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;

            // Alternating row colors
            if (index % 2 === 0) {
                doc
                    .rect(50, yPosition - 5, 500, 20)
                    .fillAndStroke('#f8f9fa', '#f8f9fa');
            }

            doc
                .fillColor('#222')
                .fontSize(9)
                .text(item.name, 60, yPosition, { width: 180 })
                .text(item.size, 250, yPosition)
                .text(item.quantity.toString(), 320, yPosition)
                .text(`KSh ${item.price.toLocaleString()}`, 380, yPosition)
                .text(`KSh ${itemTotal.toLocaleString()}`, 480, yPosition);

            yPosition += 25;
        });

        // Summary Section
        yPosition += 20;

        // Horizontal line before summary
        doc
            .strokeColor('#ddd')
            .lineWidth(1)
            .moveTo(350, yPosition)
            .lineTo(550, yPosition)
            .stroke();

        yPosition += 15;

        // Subtotal
        doc
            .fontSize(10)
            .font('Helvetica')
            .fillColor('#666')
            .text('Subtotal:', 350, yPosition)
            .text(`KSh ${order.subtotal.toLocaleString()}`, 480, yPosition);

        yPosition += 20;

        // Shipping
        doc
            .text('Shipping:', 350, yPosition)
            .text(`KSh ${order.shippingCost.toLocaleString()}`, 480, yPosition);

        yPosition += 20;

        // Tax (if applicable)
        const tax = order.total - order.subtotal - order.shippingCost;
        if (tax > 0) {
            doc
                .text('Tax (VAT):', 350, yPosition)
                .text(`KSh ${tax.toLocaleString()}`, 480, yPosition);
            yPosition += 20;
        }

        // Total
        doc
            .strokeColor('#6F4E37')
            .lineWidth(2)
            .moveTo(350, yPosition)
            .lineTo(550, yPosition)
            .stroke();

        yPosition += 10;

        doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .fillColor('#6F4E37')
            .text('Total Amount:', 350, yPosition)
            .text(`KSh ${order.total.toLocaleString()}`, 480, yPosition);

        // Footer
        const footerY = 750;
        doc
            .fontSize(9)
            .font('Helvetica')
            .fillColor('#999')
            .text('Thank you for your business!', 50, footerY, { align: 'center', width: 500 })
            .text('For any questions, please contact us at info@rerendetcoffee.com', 50, footerY + 15, { align: 'center', width: 500 });

        // Finalize the PDF
        doc.end();

    } catch (error) {
        console.error('Invoice generation error:', error);
        throw error;
    }
};

export default generateInvoice;
