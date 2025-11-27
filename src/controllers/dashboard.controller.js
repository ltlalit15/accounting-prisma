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
      salesInvoiceCount,
    ] = await Promise.all([
      prisma.purchaseorder.aggregate({
        _sum: { balance: true },
        where: { company_id, payment_status: { not: "Paid" } },
      }),

      prisma.salesorder.aggregate({
        _sum: { balance: true },
        where: { company_id, payment_status: { not: "Paid" } },
      }),

      prisma.pos_invoices.aggregate({
        _sum: { total: true },
        where: { company_id },
      }),

      prisma.expensevouchers.aggregate({
        _sum: { total_amount: true },
        where: { company_id },
      }),

      prisma.vendorscustomer.count({
        where: { company_id, type: "customer" },
      }),

      prisma.vendorscustomer.count({
        where: { company_id, type: "vender" },
      }),

      prisma.purchaseorder.count({
        where: { company_id },
      }),

      prisma.salesorder.count({
        where: { company_id },
      }),
    ]);

    // ========== SALES & PURCHASE MONTHLY CHART ==========
    const monthlyPurchase = await prisma.purchaseorder.groupBy({
      by: ["created_at"],
      _sum: { total: true },
      where: { company_id },
    });

    const monthlySales = await prisma.pos_invoices.groupBy({
      by: ["created_at"],
      _sum: { total: true },
      where: { company_id },
    });

    // Format Jan–Dec  (chart friendly)
    const salesPurchaseChart = Array.from({ length: 12 }).map((_, i) => ({
      month: new Date(0, i).toLocaleString("en-US", { month: "short" }),
      purchase: monthlyPurchase
        .filter((m) => new Date(m.created_at).getMonth() === i)
        .reduce((a, b) => a + Number(b._sum.total || 0), 0),
      sales: monthlySales
        .filter((m) => new Date(m.created_at).getMonth() === i)
        .reduce((a, b) => a + Number(b._sum.total || 0), 0),
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
        invoice: { company_id },
      },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const ids = topSelling.map((p) => p.product_id);

    const productDetails = await prisma.products.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        item_name: true,
        image: true,
        sale_price: true,
      },
    });

    const topProducts = topSelling.map((p) => {
      const product = productDetails.find((d) => d.id === p.product_id);
      return {
        id: p.product_id,
        name: product?.item_name,
        image: product?.image,
        price: product?.sale_price,
        total_sales: Number(p._sum.quantity),
        revenue: Number(p._sum.quantity) * Number(product?.sale_price || 0),
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
        total_stock: { lte: prisma.products.fields.min_order_qty },
      },
      select: {
        id: true,
        item_name: true,
        sku: true,
        total_stock: true,
        image: true,
      },
      take: 5,
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
          include: { product: true },
        },
        customer: true,
      },
    });
    const recentSalesUI = recentSales.map((inv) => {
      const item = inv.products[0]?.product;
      return {
        invoice_id: inv.id,
        product_name: item?.item_name,
        product_image: item?.image,
        category: inv.customer?.company_name ?? "General",
        price: Number(inv.total),
        status: inv.payment_status,
        date: inv.created_at,
      };
    });

    // ========== SALES STATISTICS ==========
    const salesStats = salesPurchaseChart.map((d) => ({
      month: d.month,
      revenue: d.sales,
      expense: d.purchase,
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
      take: 5,
    });
    const customerIds = topCustomerStats.map((c) => c.customer_id);

    const customerDetails = await prisma.vendorscustomer.findMany({
      where: { id: { in: customerIds } },
      select: {
        id: true,
        name_english: true,
        company_name: true,
        country: true,
        phone: true,
        email: true,
        company: {
          select: {
            profile: true,
          },
        },
      },
    });
    const topCustomers = await Promise.all(
      topCustomerStats.map(async (c) => {
        const detail = customerDetails.find((x) => x.id === c.customer_id);

        const orderCount = await prisma.pos_invoices.count({
          where: { customer_id: c.customer_id },
        });

        return {
          id: c.customer_id,
          name: detail?.name_english,
          company: detail?.company_name,
          country: detail?.country,
          image: detail?.company?.profile,
          orders: orderCount,
          total_sale: Number(c._sum.total),
        };
      })
    );

    // ---- SALES STATICS (New Section) ----

    // Group purchases (expense)
    const monthlyExpense = await prisma.purchaseorder.groupBy({
      by: ["created_at"],
      _sum: { total: true },
      where: { company_id },
    });

    // Group sales (revenue)
    const monthlyRevenue = await prisma.pos_invoices.groupBy({
      by: ["created_at"],
      _sum: { total: true },
      where: { company_id },
    });

    // => Convert to Jan–Dec format
    const salesStaticsChart = Array.from({ length: 12 }).map((_, i) => ({
      month: new Date(0, i).toLocaleString("en-US", { month: "short" }),
      revenue: monthlyRevenue
        .filter((m) => new Date(m.created_at).getMonth() === i)
        .reduce((a, b) => a + Number(b._sum.total || 0), 0),
      expense: monthlyExpense
        .filter((m) => new Date(m.created_at).getMonth() === i)
        .reduce((a, b) => a + Number(b._sum.total || 0), 0),
    }));

    // Total revenue / expense of the year
    const totalRevenue = salesStaticsChart.reduce((a, b) => a + b.revenue, 0);
    const totalExpense1 = salesStaticsChart.reduce((a, b) => a + b.expense, 0);

    // Growth calculation (last month vs previous month)
    const currentMonth = new Date().getMonth();
    const last = salesStaticsChart[currentMonth];
    const prev = salesStaticsChart[currentMonth - 1] ?? {
      revenue: 0,
      expense: 0,
    };

    const revenueGrowth =
      prev.revenue === 0
        ? 0
        : ((last.revenue - prev.revenue) / prev.revenue) * 100;

    const expenseGrowth =
      prev.expense === 0
        ? 0
        : ((last.expense - prev.expense) / prev.expense) * 100;

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
        salesInvoiceCount,
      },
      charts: {
        salesPurchase: salesPurchaseChart,
        salesStats,
      },
      widgets: {
        topProducts,
        lowStockProducts,
        recentSales: recentSalesUI,
        topCustomers,
      },
      salesStatics: {
        // ⭐ added new widget
        totalRevenue,
        revenueGrowth,
        totalExpense1,
        expenseGrowth,
        chart: salesStaticsChart,
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error });
  }
};

// Get Admin dashboard data
export const getAdminDashboardData = async (req, res) => {
  try {
    // Get current date and previous month date for comparison
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);
    const previousMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const previousMonthEnd = new Date(currentYear, currentMonth, 0);
    const threeMonthsAgoStart = new Date(currentYear, currentMonth - 3, 1);
    const threeMonthsAgoEnd = new Date(currentYear, currentMonth - 2, 0);

    // Get all company user IDs for filtering
    // Note: In your DB, a user with role "COMPANY" represents a registered company
    const allCompanyUsers = await prisma.users.findMany({
      where: {
        role: "COMPANY",
      },
      select: {
        id: true,
        email: true,
        created_at: true,
        name: true,
      },
    });

    const companyIds = allCompanyUsers.map((company) => company.id);

    // 1. Total Company count (users with role "COMPANY")
    const totalCompanies = await prisma.users.count({
      where: {
        role: "COMPANY",
      },
    });

    // 2. Total Request count (all plan requests)
    const totalRequests = await prisma.plan_requests.count();

    // 3. Revenue calculation - separated by type
    // Recurring revenue from active plans
    const activePlans = await prisma.user_plans.findMany({
      where: {
        status: "Active",
      },
      include: {
        plan: true,
      },
    });

    let monthlyRecurringRevenue = 0;
    let yearlyRecurringRevenue = 0;

    activePlans.forEach((userPlan) => {
      if (userPlan.planType === "Monthly") {
        monthlyRecurringRevenue += Number(userPlan.plan.base_price);
      } else if (userPlan.planType === "Yearly") {
        yearlyRecurringRevenue += Number(userPlan.plan.base_price);
      }
    });

    // Convert yearly to monthly equivalent for MRR calculation
    const monthlyRecurringEquivalent =
      monthlyRecurringRevenue + yearlyRecurringRevenue / 12;
    const annualRecurringRevenue =
      monthlyRecurringRevenue * 12 + yearlyRecurringRevenue;

    // Transactional revenue from invoices and sales
    const posInvoices = await prisma.pos_invoices.aggregate({
      where: {
        company_id: {
          in: companyIds,
        },
      },
      _sum: {
        total: true,
      },
    });

    const salesOrders = await prisma.salesorder.aggregate({
      where: {
        company_id: {
          in: companyIds,
        },
      },
      _sum: {
        total: true,
      },
    });

    const transactionalRevenue =
      Number(posInvoices._sum.total || 0) + Number(salesOrders._sum.total || 0);

    // Total revenue
    const totalRevenue = annualRecurringRevenue + transactionalRevenue;

    // 4. New Company Signups (current month)
    // New companies registered this month (users with role "COMPANY")
    const newSignupsCompany = await prisma.users.count({
      where: {
        role: "COMPANY",
        created_at: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
    });

    // 5. Calculate growth percentages with professional logic
    // Get data for current month
    const currentMonthCompanies = await prisma.users.count({
      where: {
        role: "COMPANY",
        created_at: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
    });

    const currentMonthRequests = await prisma.plan_requests.count({
      where: {
        request_date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
    });

    const currentMonthPosInvoices = await prisma.pos_invoices.aggregate({
      where: {
        company_id: {
          in: companyIds,
        },
        created_at: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        total: true,
      },
    });

    const currentMonthSalesOrders = await prisma.salesorder.aggregate({
      where: {
        company_id: {
          in: companyIds,
        },
        created_at: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        total: true,
      },
    });

    const currentMonthRevenue =
      Number(currentMonthPosInvoices._sum.total || 0) +
      Number(currentMonthSalesOrders._sum.total || 0);

    // Get data for previous month
    const previousMonthCompanies = await prisma.users.count({
      where: {
        role: "COMPANY",
        created_at: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
    });

    const previousMonthRequests = await prisma.plan_requests.count({
      where: {
        request_date: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
    });

    const previousMonthPosInvoices = await prisma.pos_invoices.aggregate({
      where: {
        company_id: {
          in: companyIds,
        },
        created_at: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
      _sum: {
        total: true,
      },
    });

    const previousMonthSalesOrders = await prisma.salesorder.aggregate({
      where: {
        company_id: {
          in: companyIds,
        },
        created_at: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
      _sum: {
        total: true,
      },
    });

    const previousMonthRevenue =
      Number(previousMonthPosInvoices._sum.total || 0) +
      Number(previousMonthSalesOrders._sum.total || 0);

    // Get data from 3 months ago for better baseline
    const threeMonthsAgoCompanies = await prisma.users.count({
      where: {
        role: "COMPANY",
        created_at: {
          gte: threeMonthsAgoStart,
          lte: threeMonthsAgoEnd,
        },
      },
    });

    const threeMonthsAgoRequests = await prisma.plan_requests.count({
      where: {
        request_date: {
          gte: threeMonthsAgoStart,
          lte: threeMonthsAgoEnd,
        },
      },
    });

    const threeMonthsAgoPosInvoices = await prisma.pos_invoices.aggregate({
      where: {
        company_id: {
          in: companyIds,
        },
        created_at: {
          gte: threeMonthsAgoStart,
          lte: threeMonthsAgoEnd,
        },
      },
      _sum: {
        total: true,
      },
    });

    const threeMonthsAgoSalesOrders = await prisma.salesorder.aggregate({
      where: {
        company_id: {
          in: companyIds,
        },
        created_at: {
          gte: threeMonthsAgoStart,
          lte: threeMonthsAgoEnd,
        },
      },
      _sum: {
        total: true,
      },
    });

    const threeMonthsAgoRevenue =
      Number(threeMonthsAgoPosInvoices._sum.total || 0) +
      Number(threeMonthsAgoSalesOrders._sum.total || 0);

    // Mathematical growth calculation function
    const calculateGrowth = (current, previous, baseline) => {
      // If we have previous data, use it
      if (previous > 0) {
        return (((current - previous) / previous) * 100).toFixed(1);
      }

      // If previous is 0 but we have a baseline, use baseline
      if (baseline > 0) {
        return (((current - baseline) / baseline) * 100).toFixed(1);
      }

      // If both previous and baseline are 0, use magnitude-based estimation
      if (current > 0) {
        // Logarithmic scaling: growth = log10(current + 1) * scalingFactor
        // This creates a smooth curve where:
        // - Very small values get higher growth percentages
        // - Larger values get lower growth percentages
        // - No discrete thresholds

        // For revenue, we expect higher numbers (100-100000)
        const growth = Math.log10(current + 1) * 15;
        return growth.toFixed(1);
      }

      return "0";
    };

    const companyGrowth = calculateGrowth(
      currentMonthCompanies,
      previousMonthCompanies,
      threeMonthsAgoCompanies
    );
    const requestGrowth = calculateGrowth(
      currentMonthRequests,
      previousMonthRequests,
      threeMonthsAgoRequests
    );
    const revenueGrowth = calculateGrowth(
      currentMonthRevenue,
      previousMonthRevenue,
      threeMonthsAgoRevenue
    );

    // 6. Total Growth chart data (January to December) - showing month-over-month growth
    // const growthChartData = [];

    // // First, collect all monthly revenue data
    // const monthlyRevenueData = [];
    // for (let month = 0; month < 12; month++) {
    //   const monthStart = new Date(currentYear, month, 1);
    //   const monthEnd = new Date(currentYear, month + 1, 0);

    //   const monthRevenue = await prisma.pos_invoices.aggregate({
    //     where: {
    //       company_id: {
    //         in: companyIds,
    //       },
    //       created_at: {
    //         gte: monthStart,
    //         lte: monthEnd,
    //       },
    //     },
    //     _sum: {
    //       total: true,
    //     },
    //   });

    //   const monthSalesRevenue = await prisma.salesorder.aggregate({
    //     where: {
    //       company_id: {
    //         in: companyIds,
    //       },
    //       created_at: {
    //         gte: monthStart,
    //         lte: monthEnd,
    //       },
    //     },
    //     _sum: {
    //       total: true,
    //     },
    //   });

    //   const monthTotal =
    //     Number(monthRevenue._sum.total || 0) +
    //     Number(monthSalesRevenue._sum.total || 0);

    //   monthlyRevenueData.push(monthTotal);
    // }

    // // Now calculate growth for each month
    // for (let i = 0; i < monthlyRevenueData.length; i++) {
    //   const currentMonthRevenue = monthlyRevenueData[i];
    //   let growthPercentage = 0;

    //   if (i > 0) {
    //     const previousMonthRevenue = monthlyRevenueData[i - 1];

    //     // Use the same calculateGrowth logic for consistency
    //     if (previousMonthRevenue > 0) {
    //       growthPercentage =
    //         ((currentMonthRevenue - previousMonthRevenue) /
    //           previousMonthRevenue) *
    //         100;
    //     } else if (currentMonthRevenue > 0) {
    //       // Previous month was 0, use logarithmic scaling
    //       growthPercentage = Math.log10(currentMonthRevenue + 1) * 15;
    //     }
    //     // If both are 0, growth remains 0
    //   }

    //   growthChartData.push({
    //     month: new Date(currentYear, i, 1).toLocaleString("default", {
    //       month: "short",
    //     }),
    //     growth: parseFloat(growthPercentage.toFixed(1)),
    //   });
    // }

    // const growthChartData = [];

    // // First, collect all monthly revenue data
    // const monthlyRevenueData = [];
    // for (let month = 0; month < 12; month++) {
    //   const monthStart = new Date(currentYear, month, 1);
    //   const monthEnd = new Date(currentYear, month + 1, 0);

    //   const monthRevenue = await prisma.pos_invoices.aggregate({
    //     where: {
    //       company_id: {
    //         in: companyIds,
    //       },
    //       created_at: {
    //         gte: monthStart,
    //         lte: monthEnd,
    //       },
    //     },
    //     _sum: {
    //       total: true,
    //     },
    //   });

    //   const monthSalesRevenue = await prisma.salesorder.aggregate({
    //     where: {
    //       company_id: {
    //         in: companyIds,
    //       },
    //       created_at: {
    //         gte: monthStart,
    //         lte: monthEnd,
    //       },
    //     },
    //     _sum: {
    //       total: true,
    //     },
    //   });

    //   const monthTotal =
    //     Number(monthRevenue._sum.total || 0) +
    //     Number(monthSalesRevenue._sum.total || 0);

    //   monthlyRevenueData.push(monthTotal);
    // }

    // // Now calculate growth for each month
    // // Now calculate growth for each month
    // for (let i = 0; i < monthlyRevenueData.length; i++) {
    //   const currentMonthRevenue = monthlyRevenueData[i];
    //   let growthPercentage = 0;

    //   if (i > 0) {
    //     const previousMonthRevenue = monthlyRevenueData[i - 1];

    //     // Don't calculate growth for current incomplete month
    //     if (i === currentMonth && currentDate.getDate() < 25) {
    //       growthPercentage = 0; // Show 0 for current month
    //     } else if (previousMonthRevenue > 0) {
    //       growthPercentage =
    //         ((currentMonthRevenue - previousMonthRevenue) /
    //           previousMonthRevenue) *
    //         100;
    //     } else if (currentMonthRevenue > 0) {
    //       // Previous month was 0, use logarithmic scaling
    //       growthPercentage = Math.log10(currentMonthRevenue + 1) * 15;
    //     }
    //     // If both are 0, growth remains 0
    //   }

    //   // Fixed isComplete logic:
    //   // - Past months (i < currentMonth): complete
    //   // - Current month (i === currentMonth): complete only if date >= 25
    //   // - Future months (i > currentMonth): not complete
    //   // const isComplete =
    //   //   i < currentMonth || (i === currentMonth && currentDate.getDate() >= 25);
    //   const isComplete =
    //     i < currentMonth || (i === currentMonth && currentDate.getDate() >= 25);
    //   growthChartData.push({
    //     month: new Date(currentYear, i, 1).toLocaleString("default", {
    //       month: "short",
    //     }),
    //     growth: parseFloat(growthPercentage.toFixed(1)),
    //     isCurrentMonth: i === currentMonth,
    //     isComplete: isComplete,
    //   });
    // }

    const growthChartData = [];

    // First, collect all monthly revenue data (including recurring)
    const monthlyRevenueData = [];
    for (let month = 0; month <= currentMonth; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0);

      // Revenue from pos_invoices
      const monthRevenue = await prisma.pos_invoices.aggregate({
        where: {
          company_id: {
            in: companyIds,
          },
          created_at: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          total: true,
        },
      });

      // Revenue from salesorder
      const monthSalesRevenue = await prisma.salesorder.aggregate({
        where: {
          company_id: {
            in: companyIds,
          },
          created_at: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          total: true,
        },
      });

      // Revenue from user_plans (active plans for that month)
      const activePlansForMonth = await prisma.user_plans.findMany({
        where: {
          status: "Active",
          created_at: {
            lte: monthEnd,
          },
        },
        include: {
          plan: true,
        },
      });

      let planRevenueForMonth = 0;
      activePlansForMonth.forEach((userPlan) => {
        if (userPlan.planType === "Monthly") {
          planRevenueForMonth += Number(userPlan.plan.base_price);
        } else if (userPlan.planType === "Yearly") {
          // For yearly plans, we distribute the cost across 12 months
          planRevenueForMonth += Number(userPlan.plan.base_price) / 12;
        }
      });

      // Total monthly revenue (transactional + recurring)
      const monthTotal =
        Number(monthRevenue._sum.total || 0) +
        Number(monthSalesRevenue._sum.total || 0) +
        planRevenueForMonth;

      monthlyRevenueData.push(monthTotal);
    }

    // Now calculate growth for each month
    for (let i = 0; i < monthlyRevenueData.length; i++) {
      const currentMonthRevenue = monthlyRevenueData[i];
      let growthPercentage = 0;

      if (i > 0) {
        const previousMonthRevenue = monthlyRevenueData[i - 1];

        // Don't calculate growth for current incomplete month
        if (i === currentMonth && currentDate.getDate() < 25) {
          growthPercentage = 0; // Show 0 for current month
        } else if (previousMonthRevenue > 0) {
          growthPercentage =
            ((currentMonthRevenue - previousMonthRevenue) /
              previousMonthRevenue) *
            100;
        } else if (currentMonthRevenue > 0) {
          // Previous month was 0, use logarithmic scaling
          growthPercentage = Math.log10(currentMonthRevenue + 1) * 15;
        }
        // If both are 0, growth remains 0
      }

      // Fixed isComplete logic:
      // - Past months (i < currentMonth): complete
      // - Current month (i === currentMonth): complete only if date >= 25
      // - Future months (i > currentMonth): not complete
      const isComplete =
        i < currentMonth || (i === currentMonth && currentDate.getDate() >= 25);

      growthChartData.push({
        month: new Date(currentYear, i, 1).toLocaleString("default", {
          month: "short",
        }),
        growth: parseFloat(growthPercentage.toFixed(1)),
        isCurrentMonth: i === currentMonth,
        isComplete: isComplete,
      });
    }

    // 7. Company Signup chart data (January to December)
    const signupChartData = [];
    for (let month = 0; month <= currentMonth; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0);

      const monthSignups = await prisma.users.count({
        where: {
          role: "COMPANY", // Counting new company registrations
          created_at: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      signupChartData.push({
        month: new Date(currentYear, month, 1).toLocaleString("default", {
          month: "short",
        }),
        signups: monthSignups,
      });
    }

    // 8. Revenue Trends chart data (January to December)
    const revenueTrendsData = [];
    for (let month = 0; month <= currentMonth; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0);

      // Revenue from pos_invoices
      const posInvoiceRevenue = await prisma.pos_invoices.aggregate({
        where: {
          company_id: {
            in: companyIds,
          },
          created_at: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          total: true,
        },
      });

      // Revenue from salesorder
      const salesOrderRevenue = await prisma.salesorder.aggregate({
        where: {
          company_id: {
            in: companyIds,
          },
          created_at: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          total: true,
        },
      });

      // Revenue from user_plans (active plans for that month)
      const activePlansForMonth = await prisma.user_plans.findMany({
        where: {
          status: "Active",
          created_at: {
            lte: monthEnd,
          },
        },
        include: {
          plan: true,
        },
      });

      let planRevenueForMonth = 0;
      activePlansForMonth.forEach((userPlan) => {
        if (userPlan.planType === "Monthly") {
          planRevenueForMonth += Number(userPlan.plan.base_price);
        } else if (userPlan.planType === "Yearly") {
          // For yearly plans, we distribute the cost across 12 months
          planRevenueForMonth += Number(userPlan.plan.base_price) / 12;
        }
      });

      // Total monthly revenue
      const totalMonthRevenue =
        Number(posInvoiceRevenue._sum.total || 0) +
        Number(salesOrderRevenue._sum.total || 0) +
        planRevenueForMonth;

      revenueTrendsData.push({
        month: new Date(currentYear, month, 1).toLocaleString("default", {
          month: "short",
        }),
        revenue: totalMonthRevenue,
      });
    }

    // Additional company metrics
    const activeCompanies = await prisma.users.count({
      where: {
        role: "COMPANY",
        // Add any additional criteria for active companies if needed
        // e.g., last_login_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
    });

    const companiesWithPlans = await prisma.user_plans.groupBy({
      by: ["user_id"],
      where: {
        status: "Active",
      },
    });

    // Format response with comprehensive metrics
    const dashboardData = {
      totalCompanies: {
        value: totalCompanies,
        growth: companyGrowth,
      },
      totalRequests: {
        value: totalRequests,
        growth: requestGrowth,
      },
      totalRevenue: {
        value: totalRevenue,
        growth: revenueGrowth,
      },
      newSignupsCompany: {
        value: newSignupsCompany,
      },
      growthChartData,
      signupChartData,
      revenueTrendsData,
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// export const getAdminDashboardData = async (req, res) => {
//   try {
//     // Get current date and previous month date for comparison
//     const currentDate = new Date();
//     const currentYear = currentDate.getFullYear();
//     const currentMonth = currentDate.getMonth();
//     const currentMonthStart = new Date(currentYear, currentMonth, 1);
//     const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);
//     const previousMonthStart = new Date(currentYear, currentMonth - 1, 1);
//     const previousMonthEnd = new Date(currentYear, currentMonth, 0);
//     const threeMonthsAgoStart = new Date(currentYear, currentMonth - 3, 1);
//     const threeMonthsAgoEnd = new Date(currentYear, currentMonth - 2, 0);

//     // Get all company user IDs for filtering
//     const allCompanyUsers = await prisma.users.findMany({
//       where: {
//         role: "COMPANY",
//       },
//       select: {
//         id: true,
//         email: true,
//         created_at: true,
//         name: true,
//       },
//     });

//     const companyIds = allCompanyUsers.map((company) => company.id);

//     // Helper function to get active plans and calculate recurring revenue
//     const getActivePlansRevenue = async () => {
//       const activePlans = await prisma.user_plans.findMany({
//         where: {
//           status: "Active",
//         },
//         include: {
//           plan: true,
//         },
//       });

//       let monthlyRecurringRevenue = 0;
//       let yearlyRecurringRevenue = 0;

//       activePlans.forEach((userPlan) => {
//         if (userPlan.planType === "Monthly") {
//           monthlyRecurringRevenue += Number(userPlan.plan.base_price);
//         } else if (userPlan.planType === "Yearly") {
//           yearlyRecurringRevenue += Number(userPlan.plan.base_price);
//         }
//       });

//       return {
//         activePlans,
//         monthlyRecurringRevenue,
//         yearlyRecurringRevenue,
//         monthlyRecurringEquivalent:
//           monthlyRecurringRevenue + yearlyRecurringRevenue / 12,
//         annualRecurringRevenue:
//           monthlyRecurringRevenue * 12 + yearlyRecurringRevenue,
//       };
//     };

//     // Helper function to get transactional revenue for a date range
//     const getTransactionalRevenue = async (startDate, endDate) => {
//       const posInvoices = await prisma.pos_invoices.aggregate({
//         where: {
//           company_id: {
//             in: companyIds,
//           },
//           created_at: {
//             gte: startDate,
//             lte: endDate,
//           },
//         },
//         _sum: {
//           total: true,
//         },
//       });

//       const salesOrders = await prisma.salesorder.aggregate({
//         where: {
//           company_id: {
//             in: companyIds,
//           },
//           created_at: {
//             gte: startDate,
//             lte: endDate,
//           },
//         },
//         _sum: {
//           total: true,
//         },
//       });

//       return (
//         Number(posInvoices._sum.total || 0) +
//         Number(salesOrders._sum.total || 0)
//       );
//     };

//     // Helper function to get monthly recurring revenue for a specific month
//     const getMonthlyRecurringRevenue = async (monthEnd) => {
//       const activePlansForMonth = await prisma.user_plans.findMany({
//         where: {
//           status: "Active",
//           created_at: {
//             lte: monthEnd,
//           },
//         },
//         include: {
//           plan: true,
//         },
//       });

//       let planRevenueForMonth = 0;
//       activePlansForMonth.forEach((userPlan) => {
//         if (userPlan.planType === "Monthly") {
//           planRevenueForMonth += Number(userPlan.plan.base_price);
//         } else if (userPlan.planType === "Yearly") {
//           // For yearly plans, we distribute the cost across 12 months
//           planRevenueForMonth += Number(userPlan.plan.base_price) / 12;
//         }
//       });

//       return planRevenueForMonth;
//     };

//     // Helper function to get total revenue for a specific month
//     const getMonthlyTotalRevenue = async (monthStart, monthEnd) => {
//       const transactionalRevenue = await getTransactionalRevenue(
//         monthStart,
//         monthEnd
//       );
//       const recurringRevenue = await getMonthlyRecurringRevenue(monthEnd);
//       return transactionalRevenue + recurringRevenue;
//     };

//     // Mathematical growth calculation function
//     const calculateGrowth = (current, previous, baseline) => {
//       // If we have previous data, use it
//       if (previous > 0) {
//         return (((current - previous) / previous) * 100).toFixed(1);
//       }

//       // If previous is 0 but we have a baseline, use baseline
//       if (baseline > 0) {
//         return (((current - baseline) / baseline) * 100).toFixed(1);
//       }

//       // If both previous and baseline are 0, but current > 0
//       if (current > 0) {
//         // For new businesses with no previous data, we can use a standard growth indicator
//         return "100.0"; // Indicating growth from zero
//       }

//       return "0";
//     };

//     // 1. Total Company count (users with role "COMPANY")
//     const totalCompanies = await prisma.users.count({
//       where: {
//         role: "COMPANY",
//       },
//     });

//     // 2. Total Request count (all plan requests)
//     const totalRequests = await prisma.plan_requests.count();

//     // 3. Revenue calculation
//     const {
//       activePlans,
//       monthlyRecurringRevenue,
//       yearlyRecurringRevenue,
//       monthlyRecurringEquivalent,
//       annualRecurringRevenue,
//     } = await getActivePlansRevenue();

//     const transactionalRevenue = await getTransactionalRevenue(
//       new Date(currentYear, 0, 1), // Start of the year
//       currentMonthEnd // Current month end
//     );

//     // Total revenue
//     const totalRevenue = annualRecurringRevenue + transactionalRevenue;

//     // 4. New Company Signups (current month)
//     const newSignupsCompany = await prisma.users.count({
//       where: {
//         role: "COMPANY",
//         created_at: {
//           gte: currentMonthStart,
//           lte: currentMonthEnd,
//         },
//       },
//     });

//     // 5. Calculate growth percentages
//     // Get data for current month
//     const currentMonthCompanies = await prisma.users.count({
//       where: {
//         role: "COMPANY",
//         created_at: {
//           gte: currentMonthStart,
//           lte: currentMonthEnd,
//         },
//       },
//     });

//     const currentMonthRequests = await prisma.plan_requests.count({
//       where: {
//         request_date: {
//           gte: currentMonthStart,
//           lte: currentMonthEnd,
//         },
//       },
//     });

//     const currentMonthRevenue = await getMonthlyTotalRevenue(
//       currentMonthStart,
//       currentMonthEnd
//     );

//     // Get data for previous month
//     const previousMonthCompanies = await prisma.users.count({
//       where: {
//         role: "COMPANY",
//         created_at: {
//           gte: previousMonthStart,
//           lte: previousMonthEnd,
//         },
//       },
//     });

//     const previousMonthRequests = await prisma.plan_requests.count({
//       where: {
//         request_date: {
//           gte: previousMonthStart,
//           lte: previousMonthEnd,
//         },
//       },
//     });

//     const previousMonthRevenue = await getMonthlyTotalRevenue(
//       previousMonthStart,
//       previousMonthEnd
//     );

//     // Get data from 3 months ago for better baseline
//     const threeMonthsAgoCompanies = await prisma.users.count({
//       where: {
//         role: "COMPANY",
//         created_at: {
//           gte: threeMonthsAgoStart,
//           lte: threeMonthsAgoEnd,
//         },
//       },
//     });

//     const threeMonthsAgoRequests = await prisma.plan_requests.count({
//       where: {
//         request_date: {
//           gte: threeMonthsAgoStart,
//           lte: threeMonthsAgoEnd,
//         },
//       },
//     });

//     const threeMonthsAgoRevenue = await getMonthlyTotalRevenue(
//       threeMonthsAgoStart,
//       threeMonthsAgoEnd
//     );

//     const companyGrowth = calculateGrowth(
//       currentMonthCompanies,
//       previousMonthCompanies,
//       threeMonthsAgoCompanies
//     );
//     const requestGrowth = calculateGrowth(
//       currentMonthRequests,
//       previousMonthRequests,
//       threeMonthsAgoRequests
//     );
//     const revenueGrowth = calculateGrowth(
//       currentMonthRevenue,
//       previousMonthRevenue,
//       threeMonthsAgoRevenue
//     );

//     // 6. Total Growth chart data (January to December)
//     const growthChartData = [];
//     const monthlyRevenueData = [];

//     // First, collect all monthly revenue data
//     for (let month = 0; month < 12; month++) {
//       const monthStart = new Date(currentYear, month, 1);
//       const monthEnd = new Date(currentYear, month + 1, 0);
//       const monthTotal = await getMonthlyTotalRevenue(monthStart, monthEnd);
//       monthlyRevenueData.push(monthTotal);
//     }

//     // Now calculate growth for each month
//     for (let i = 0; i < monthlyRevenueData.length; i++) {
//       const currentMonthRevenue = monthlyRevenueData[i];
//       let growthPercentage = 0;

//       if (i > 0) {
//         const previousMonthRevenue = monthlyRevenueData[i - 1];

//         // Don't calculate growth for current incomplete month
//         if (i === currentMonth && currentDate.getDate() < 25) {
//           growthPercentage = 0; // Show 0 for current month
//         } else if (previousMonthRevenue > 0) {
//           growthPercentage =
//             ((currentMonthRevenue - previousMonthRevenue) /
//               previousMonthRevenue) *
//             100;
//         } else if (currentMonthRevenue > 0) {
//           // Previous month was 0, use a standard growth indicator
//           growthPercentage = 100.0;
//         }
//         // If both are 0, growth remains 0
//       }

//       // Fixed isComplete logic:
//       // - Past months (i < currentMonth): complete
//       // - Current month (i === currentMonth): complete only if date >= 25
//       // - Future months (i > currentMonth): not complete
//       const isComplete =
//         i < currentMonth || (i === currentMonth && currentDate.getDate() >= 25);

//       growthChartData.push({
//         month: new Date(currentYear, i, 1).toLocaleString("default", {
//           month: "short",
//         }),
//         growth: parseFloat(growthPercentage.toFixed(1)),
//         isCurrentMonth: i === currentMonth,
//         isComplete: isComplete,
//       });
//     }

//     // 7. Company Signup chart data (January to December)
//     const signupChartData = [];
//     for (let month = 0; month < 12; month++) {
//       const monthStart = new Date(currentYear, month, 1);
//       const monthEnd = new Date(currentYear, month + 1, 0);

//       const monthSignups = await prisma.users.count({
//         where: {
//           role: "COMPANY",
//           created_at: {
//             gte: monthStart,
//             lte: monthEnd,
//           },
//         },
//       });

//       signupChartData.push({
//         month: new Date(currentYear, month, 1).toLocaleString("default", {
//           month: "short",
//         }),
//         signups: monthSignups,
//       });
//     }

//     // 8. Revenue Trends chart data (January to December)
//     const revenueTrendsData = [];
//     for (let month = 0; month < 12; month++) {
//       const monthStart = new Date(currentYear, month, 1);
//       const monthEnd = new Date(currentYear, month + 1, 0);
//       const totalMonthRevenue = await getMonthlyTotalRevenue(
//         monthStart,
//         monthEnd
//       );

//       revenueTrendsData.push({
//         month: new Date(currentYear, month, 1).toLocaleString("default", {
//           month: "short",
//         }),
//         revenue: totalMonthRevenue,
//       });
//     }

//     // Additional company metrics
//     const activeCompanies = await prisma.users.count({
//       where: {
//         role: "COMPANY",
//         // Add any additional criteria for active companies if needed
//         // e.g., last_login_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
//       },
//     });

//     const companiesWithPlans = await prisma.user_plans.groupBy({
//       by: ["user_id"],
//       where: {
//         status: "Active",
//       },
//     });

//     // Format response with comprehensive metrics
//     const dashboardData = {
//       totalCompanies: {
//         value: totalCompanies,
//         growth: companyGrowth,
//         active: activeCompanies,
//         withPlans: companiesWithPlans.length,
//       },
//       totalRequests: {
//         value: totalRequests,
//         growth: requestGrowth,
//       },
//       totalRevenue: {
//         value: totalRevenue,
//         growth: revenueGrowth,
//         breakdown: {
//           recurring: annualRecurringRevenue,
//           transactional: transactionalRevenue,
//           mrr: monthlyRecurringEquivalent,
//         },
//       },
//       newSignupsCompany: {
//         value: newSignupsCompany,
//       },
//       growthChartData,
//       signupChartData,
//       revenueTrendsData,
//     };

//     res.status(200).json(dashboardData);
//   } catch (error) {
//     console.error("Error fetching dashboard data:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
