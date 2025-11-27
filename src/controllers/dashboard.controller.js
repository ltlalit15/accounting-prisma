import prisma from "../config/db.js";
export const getDashboard = async (req, res) => {
  try {
    const company_id = Number(req.params.company_id);

    // ========== TOP CARDS ==========
    const [
      totalPurchaseDue,
      totalSalesDue,
      totalSaleAmount,
      totalExpense,
      customers,
      vendors,
      purchaseInvoiceCount,
      salesInvoiceCount
    ] = await Promise.all([
      prisma.purchaseorder.aggregate({
        _sum: { balance: true },
        where: { company_id, payment_status: { not: "Paid" } }
      }),

      prisma.salesorder.aggregate({
        _sum: { balance: true },
        where: { company_id, payment_status: { not: "Paid" } }
      }),

      prisma.pos_invoices.aggregate({
        _sum: { total: true },
        where: { company_id }
      }),

      prisma.expensevouchers.aggregate({
        _sum: { total_amount: true },
        where: { company_id }
      }),

      prisma.vendorscustomer.count({
        where: { company_id, type: "customer" }
      }),

      prisma.vendorscustomer.count({
        where: { company_id, type: "vender" }
      }),

      prisma.purchaseorder.count({
        where: { company_id }
      }),

      prisma.salesorder.count({
        where: { company_id }
      })
    ]);

    // ========== SALES & PURCHASE MONTHLY CHART ==========
    const monthlyPurchase = await prisma.purchaseorder.groupBy({
      by: ["created_at"],
      _sum: { total: true },
      where: { company_id }
    });

    const monthlySales = await prisma.pos_invoices.groupBy({
      by: ["created_at"],
      _sum: { total: true },
      where: { company_id }
    });

    // Format Jan–Dec  (chart friendly)
    const salesPurchaseChart = Array.from({ length: 12 }).map((_, i) => ({
      month: new Date(0, i).toLocaleString("en-US", { month: "short" }),
      purchase: monthlyPurchase
        .filter(m => new Date(m.created_at).getMonth() === i)
        .reduce((a, b) => a + Number(b._sum.total || 0), 0),
      sales: monthlySales
        .filter(m => new Date(m.created_at).getMonth() === i)
        .reduce((a, b) => a + Number(b._sum.total || 0), 0)
    }));

    // ========== TOP SELLING PRODUCTS ==========
//     const topProducts = await prisma.pos_invoice_products.groupBy({
//   by: ["product_id"],
//   _sum: { quantity: true },
//   where: {
//     invoice: {    // 👈 filter using related pos_invoices
//       company_id
//     }
//   },
//   orderBy: { _sum: { quantity: "desc" } },
//   take: 5,
// });
const topSelling = await prisma.pos_invoice_products.groupBy({
  by: ["product_id"],
  _sum: { quantity: true, price: true },
  where: {
    invoice: { company_id }
  },
  orderBy: { _sum: { quantity: "desc" } },
  take: 5,
});

const ids = topSelling.map(p => p.product_id);

const productDetails = await prisma.products.findMany({
  where: { id: { in: ids } },
  select: {
    id: true,
    item_name: true,
    image: true,
    sale_price: true
  },
});

const topProducts = topSelling.map(p => {
  const product = productDetails.find(d => d.id === p.product_id);
  return {
    id: p.product_id,
    name: product?.item_name,
    image: product?.image,
    price: product?.sale_price,
    total_sales: Number(p._sum.quantity),
    revenue: Number(p._sum.quantity) * Number(product?.sale_price || 0)
  };
});
   
    // ========== LOW STOCK PRODUCTS ==========
    // const lowStock = await prisma.products.findMany({
    //   where: {
    //     company_id,
    //     total_stock: { lte: prisma.products.fields.min_order_qty }
    //   },
    //   take: 5
    // });
    const lowStockProducts = await prisma.products.findMany({
  where: {
    company_id,
    total_stock: { lte: prisma.products.fields.min_order_qty }
  },
  select: {
    id: true,
    item_name: true,
    sku: true,
    total_stock: true,
    image: true
  },
  take: 5
});

    // ========== RECENT SALES ==========
    // const recentSales = await prisma.pos_invoices.findMany({
    //   where: { company_id },
    //   orderBy: { created_at: "desc" },
    //   take: 5
    // });
    const recentSales = await prisma.pos_invoices.findMany({
  where: { company_id },
  orderBy: { created_at: "desc" },
  take: 5,
  include: {
    products: {
      take: 1,
      include: { product: true }
    },
    customer: true
  }
});
const recentSalesUI = recentSales.map(inv => {
  const item = inv.products[0]?.product;
  return {
    invoice_id: inv.id,
    product_name: item?.item_name,
    product_image: item?.image,
    category: inv.customer?.company_name ?? "General",
    price: Number(inv.total),
    status: inv.payment_status,
    date: inv.created_at
  };
});
   
    // ========== SALES STATISTICS ==========
    const salesStats = salesPurchaseChart.map(d => ({
      month: d.month,
      revenue: d.sales,
      expense: d.purchase
    }));

    // ========== TOP CUSTOMERS ==========
    // const topCustomers = await prisma.pos_invoices.groupBy({
    //   by: ["customer_id"],
    //   _sum: { total: true },
    //   orderBy: { _sum: { total: "desc" } },
    //   take: 5
    // });
    const topCustomerStats = await prisma.pos_invoices.groupBy({
  by: ["customer_id"],
  _sum: { total: true },
  orderBy: { _sum: { total: "desc" } },
  take: 5
});
const customerIds = topCustomerStats.map(c => c.customer_id);

const customerDetails = await prisma.vendorscustomer.findMany({
  where: { id: { in: customerIds } },
  select: {
    id: true,
    name_english: true,
    company_name: true,
    country: true,
    phone: true,
    email: true,
    company:{
        select:{
            profile:true
        }
    }
  }
});
const topCustomers = await Promise.all(
  topCustomerStats.map(async c => {
    const detail = customerDetails.find(x => x.id === c.customer_id);

    const orderCount = await prisma.pos_invoices.count({
      where: { customer_id: c.customer_id }
    });

    return {
      id: c.customer_id,
      name: detail?.name_english,
      company: detail?.company_name,
      country: detail?.country,
      image: detail?.company?.profile,
      orders: orderCount,
      total_sale: Number(c._sum.total)
    };
  })
);



    // ---- SALES STATICS (New Section) ----

// Group purchases (expense)
const monthlyExpense = await prisma.purchaseorder.groupBy({
  by: ["created_at"],
  _sum: { total: true },
  where: { company_id }
});

// Group sales (revenue)
const monthlyRevenue = await prisma.pos_invoices.groupBy({
  by: ["created_at"],
  _sum: { total: true },
  where: { company_id }
});

// => Convert to Jan–Dec format
const salesStaticsChart = Array.from({ length: 12 }).map((_, i) => ({
  month: new Date(0, i).toLocaleString("en-US", { month: "short" }),
  revenue:
    monthlyRevenue
      .filter(m => new Date(m.created_at).getMonth() === i)
      .reduce((a, b) => a + Number(b._sum.total || 0), 0),
  expense:
    monthlyExpense
      .filter(m => new Date(m.created_at).getMonth() === i)
      .reduce((a, b) => a + Number(b._sum.total || 0), 0)
}));

// Total revenue / expense of the year
const totalRevenue = salesStaticsChart.reduce((a, b) => a + b.revenue, 0);
const totalExpense1 = salesStaticsChart.reduce((a, b) => a + b.expense, 0);

// Growth calculation (last month vs previous month)
const currentMonth = new Date().getMonth();
const last = salesStaticsChart[currentMonth];
const prev = salesStaticsChart[currentMonth - 1] ?? { revenue: 0, expense: 0 };

const revenueGrowth =
  prev.revenue === 0 ? 0 : ((last.revenue - prev.revenue) / prev.revenue) * 100;

const expenseGrowth =
  prev.expense === 0 ? 0 : ((last.expense - prev.expense) / prev.expense) * 100;

    // ========== FINAL RESPONSE ==========
    return res.json({
      success: true,
      cards: {
        totalPurchaseDue: totalPurchaseDue._sum.balance || 0,
        totalSalesDue: totalSalesDue._sum.balance || 0,
        totalSaleAmount: totalSaleAmount._sum.total || 0,
        totalExpense: totalExpense._sum.total_amount || 0,
        customers,
        vendors,
        purchaseInvoiceCount,
        salesInvoiceCount
      },
      charts: {
        salesPurchase: salesPurchaseChart,
        salesStats
      },
      widgets: {
        topProducts,
  lowStockProducts,
  recentSales: recentSalesUI,
        topCustomers
      },
      salesStatics: {                  // ⭐ added new widget
      totalRevenue,
      revenueGrowth,
      totalExpense1,
      expenseGrowth,
      chart: salesStaticsChart
    }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server Error", error });
  }
};
