// controllers/reportController.js
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import moment from 'moment';

// @desc    Generate order receipt PDF
// @route   GET /api/reports/orders/:id/receipt
// @access  Private/Admin
const generateOrderReceipt = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'firstName lastName email phone');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  try {
    // Simple text receipt for now - you can implement PDF generation later
    const receiptText = `
      RERENDET COFFEE RECEIPT
      Order: ${order.orderNumber}
      Date: ${moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
      Customer: ${order.user.firstName} ${order.user.lastName}
      Email: ${order.user.email}
      Phone: ${order.user.phone}
      
      ITEMS:
      ${order.items.map(item => `
        ${item.name} x${item.quantity} - KES ${item.price} = KES ${item.itemTotal}
      `).join('')}
      
      SUBTOTAL: KES ${order.subtotal}
      SHIPPING: KES ${order.shippingCost}
      TOTAL: KES ${order.total}
      
      Status: ${order.status}
      Payment: ${order.paymentMethod} (${order.paymentStatus})
    `;

    res.set({
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename=receipt-${order.orderNumber}.txt`
    });
    
    res.send(receiptText);
  } catch (error) {
    console.error('Receipt generation error:', error);
    res.status(500);
    throw new Error('Failed to generate receipt');
  }
});

// @desc    Generate monthly sales report
// @route   GET /api/reports/sales/monthly
// @access  Private/Admin
const generateMonthlyReport = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const targetMonth = month || moment().month() + 1;
  const targetYear = year || moment().year();

  const startDate = moment(`${targetYear}-${targetMonth}-01`).startOf('month');
  const endDate = moment(startDate).endOf('month');

  const orders = await Order.find({
    createdAt: {
      $gte: startDate.toDate(),
      $lte: endDate.toDate()
    },
    paymentStatus: 'paid'
  }).populate('user', 'firstName lastName');

  if (orders.length === 0) {
    res.status(404);
    throw new Error('No orders found for the specified period');
  }

  try {
    // Simple CSV report for now
    const csvContent = [
      'Order Number,Customer,Amount,Status,Date',
      ...orders.map(order => 
        `"${order.orderNumber}","${order.user.firstName} ${order.user.lastName}","${order.total}","${order.status}","${moment(order.createdAt).format('DD/MM/YYYY')}"`
      )
    ].join('\n');

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=sales-report-${targetMonth}-${targetYear}.csv`
    });
    
    res.send(csvContent);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500);
    throw new Error('Failed to generate sales report');
  }
});

// @desc    Get sales analytics data
// @route   GET /api/reports/analytics
// @access  Private/Admin
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  
  let startDate;
  const endDate = new Date();

  switch (period) {
    case '7d':
      startDate = moment().subtract(7, 'days').toDate();
      break;
    case '30d':
      startDate = moment().subtract(30, 'days').toDate();
      break;
    case '90d':
      startDate = moment().subtract(90, 'days').toDate();
      break;
    case '1y':
      startDate = moment().subtract(1, 'year').toDate();
      break;
    default:
      startDate = moment().subtract(30, 'days').toDate();
  }

  const orders = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate },
    paymentStatus: 'paid'
  }).populate('items.product');

  // Calculate analytics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Daily revenue breakdown
  const dailyRevenue = {};
  orders.forEach(order => {
    const date = moment(order.createdAt).format('YYYY-MM-DD');
    if (!dailyRevenue[date]) {
      dailyRevenue[date] = 0;
    }
    dailyRevenue[date] += order.total;
  });

  // Top products
  const productSales = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const productName = item.name;
      if (!productSales[productName]) {
        productSales[productName] = {
          quantity: 0,
          revenue: 0
        };
      }
      productSales[productName].quantity += item.quantity;
      productSales[productName].revenue += item.itemTotal;
    });
  });

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10)
    .map(([name, data]) => ({
      name,
      ...data
    }));

  res.json({
    success: true,
    data: {
      summary: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        period: {
          start: startDate,
          end: endDate
        }
      },
      dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({
        date,
        revenue
      })),
      topProducts,
      orderStatus: await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    }
  });
});

// @desc    Export orders to CSV
// @route   GET /api/reports/orders/export
// @access  Private/Admin
const exportOrdersToCSV = asyncHandler(async (req, res) => {
  const { startDate, endDate, status } = req.query;
  
  let filter = {};
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  if (status && status !== 'all') {
    filter.status = status;
  }

  const orders = await Order.find(filter)
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 });

  // Generate CSV
  const headers = [
    'Order Number',
    'Customer',
    'Email',
    'Items',
    'Subtotal',
    'Shipping',
    'Total',
    'Status',
    'Payment Status',
    'Order Date'
  ];

  const csvData = orders.map(order => [
    order.orderNumber,
    `${order.user.firstName} ${order.user.lastName}`,
    order.user.email,
    order.items.map(item => `${item.name} (x${item.quantity})`).join('; '),
    order.subtotal,
    order.shippingCost,
    order.total,
    order.status,
    order.paymentStatus,
    moment(order.createdAt).format('DD/MM/YYYY HH:mm')
  ]);

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');

  res.set({
    'Content-Type': 'text/csv',
    'Content-Disposition': `attachment; filename=orders-export-${moment().format('YYYY-MM-DD')}.csv`
  });

  res.send(csvContent);
});

export {
  generateOrderReceipt,
  generateMonthlyReport,
  getSalesAnalytics,
  exportOrdersToCSV
};