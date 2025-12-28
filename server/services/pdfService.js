// services/pdfService.js
import PDFDocument from 'pdfkit';
import moment from 'moment';

class PDFService {
  // Generate order receipt/invoice
  static generateOrderReceipt(order) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        this.addHeader(doc, order);
        
        // Order Information
        this.addOrderInfo(doc, order);
        
        // Customer Information
        this.addCustomerInfo(doc, order);
        
        // Order Items Table
        this.addOrderItems(doc, order);
        
        // Order Summary
        this.addOrderSummary(doc, order);
        
        // Footer
        this.addFooter(doc);
        
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate monthly sales report
  static generateMonthlyReport(orders, month, year) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Report Header
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .fillColor('#2c5530')
           .text('RERENDET COFFEE', 50, 50, { align: 'center' });
        
        doc.fontSize(16)
           .fillColor('#666')
           .text('Monthly Sales Report', 50, 80, { align: 'center' });
        
        doc.fontSize(12)
           .fillColor('#333')
           .text(`Period: ${month}/${year}`, 50, 110, { align: 'center' });

        // Sales Summary
        let yPosition = 150;
        this.addSalesSummary(doc, orders, yPosition);
        
        // Top Products
        yPosition += 120;
        this.addTopProducts(doc, orders, yPosition);
        
        // Order Statistics
        yPosition += 120;
        this.addOrderStats(doc, orders, yPosition);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  static addHeader(doc, order) {
    // Company Header
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#2c5530')
       .text('RERENDET COFFEE', 50, 50);
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666')
       .text('Premium Coffee Roasters', 50, 75)
       .text('Nairobi, Kenya', 50, 90);
    
    // Invoice Title
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#333')
       .text('INVOICE', 400, 50, { align: 'right' });
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666')
       .text(`#${order.orderNumber}`, 400, 70, { align: 'right' });
  }

  static addOrderInfo(doc, order) {
    const yPosition = 130;
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#333')
       .text('Order Date:', 50, yPosition)
       .text('Order Status:', 50, yPosition + 15)
       .text('Payment Status:', 50, yPosition + 30);
    
    doc.font('Helvetica')
       .fillColor('#666')
       .text(moment(order.createdAt).format('DD/MM/YYYY HH:mm'), 120, yPosition)
       .text(this.formatStatus(order.status), 120, yPosition + 15)
       .text(this.formatPaymentStatus(order.paymentStatus), 120, yPosition + 30);
  }

  static addCustomerInfo(doc, order) {
    const yPosition = 180;
    const { shippingAddress } = order;
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333')
       .text('SHIPPING ADDRESS', 50, yPosition);
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666')
       .text(`${shippingAddress.firstName} ${shippingAddress.lastName}`, 50, yPosition + 20)
       .text(shippingAddress.email, 50, yPosition + 35)
       .text(shippingAddress.phone, 50, yPosition + 50)
       .text(shippingAddress.address, 50, yPosition + 65)
       .text(`${shippingAddress.city}, ${shippingAddress.country}`, 50, yPosition + 80);
  }

  static addOrderItems(doc, order) {
    let yPosition = 280;
    
    // Table Header
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#fff')
       .rect(50, yPosition, 500, 20)
       .fill('#2c5530');
    
    doc.text('Product', 60, yPosition + 5)
       .text('Price', 300, yPosition + 5)
       .text('Qty', 380, yPosition + 5)
       .text('Total', 450, yPosition + 5);
    
    yPosition += 25;

    // Order Items
    order.items.forEach((item, index) => {
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }
      
      const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
      doc.fillColor(bgColor)
         .rect(50, yPosition, 500, 20)
         .fill();
      
      doc.fillColor('#333')
         .font('Helvetica')
         .text(item.name, 60, yPosition + 5, { width: 230 })
         .text(`KES ${item.price.toLocaleString()}`, 300, yPosition + 5)
         .text(item.quantity.toString(), 380, yPosition + 5)
         .text(`KES ${item.itemTotal.toLocaleString()}`, 450, yPosition + 5);
      
      yPosition += 20;
    });
    
    return yPosition + 10;
  }

  static addOrderSummary(doc, order) {
    const yPosition = 500;
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#333')
       .text('Subtotal:', 400, yPosition)
       .text('Shipping:', 400, yPosition + 15)
       .text('Total:', 400, yPosition + 30);
    
    doc.font('Helvetica')
       .fillColor('#666')
       .text(`KES ${order.subtotal.toLocaleString()}`, 480, yPosition, { align: 'right' })
       .text(`KES ${order.shippingCost.toLocaleString()}`, 480, yPosition + 15, { align: 'right' })
       .text(`KES ${order.total.toLocaleString()}`, 480, yPosition + 30, { align: 'right' });
  }

  static addFooter(doc) {
    const yPosition = 750;
    
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#666')
       .text('Thank you for your business!', 50, yPosition, { align: 'center' })
       .text('Rerendet Coffee - Premium Coffee Roasters', 50, yPosition + 12, { align: 'center' })
       .text('Contact: info@rerendetcoffee.com | +254 700 000 000', 50, yPosition + 24, { align: 'center' });
  }

  static addSalesSummary(doc, orders, yPosition) {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalRevenue / totalOrders;
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#333')
       .text('SALES SUMMARY', 50, yPosition);
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666')
       .text(`Total Revenue: KES ${totalRevenue.toLocaleString()}`, 70, yPosition + 25)
       .text(`Total Orders: ${totalOrders}`, 70, yPosition + 40)
       .text(`Average Order Value: KES ${avgOrderValue.toFixed(2)}`, 70, yPosition + 55)
       .text(`Period: ${moment(orders[0]?.createdAt).format('MMMM YYYY')}`, 70, yPosition + 70);
  }

  static addTopProducts(doc, orders, yPosition) {
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = { quantity: 0, revenue: 0 };
        }
        productSales[item.name].quantity += item.quantity;
        productSales[item.name].revenue += item.itemTotal;
      });
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5);

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#333')
       .text('TOP PRODUCTS', 50, yPosition);

    let currentY = yPosition + 25;
    topProducts.forEach(([product, data], index) => {
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666')
         .text(`${index + 1}. ${product}`, 70, currentY)
         .text(`Sold: ${data.quantity} | Revenue: KES ${data.revenue.toLocaleString()}`, 250, currentY);
      currentY += 15;
    });
  }

  static addOrderStats(doc, orders, yPosition) {
    const statusCount = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      statusCount[order.status]++;
    });

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#333')
       .text('ORDER STATISTICS', 50, yPosition);

    let currentY = yPosition + 25;
    Object.entries(statusCount).forEach(([status, count]) => {
      if (count > 0) {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#666')
           .text(`${this.formatStatus(status)}: ${count}`, 70, currentY);
        currentY += 15;
      }
    });
  }

  static formatStatus(status) {
    const statusMap = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  }

  static formatPaymentStatus(status) {
    const statusMap = {
      pending: 'Pending',
      paid: 'Paid',
      failed: 'Failed',
      refunded: 'Refunded'
    };
    return statusMap[status] || status;
  }
}

export default PDFService;