import prisma from "../config/db.js";

// Get all payment transactions from sales orders and purchase orders
export const getAllPayments = async (req, res) => {
  try {
    // Get all sales orders with payment information
    const salesOrders = await prisma.salesorder.findMany({
      where: {
        OR: [{ payment_status: { not: null } }, { Payment_no: { not: null } }],
      },
      select: {
        id: true,
        Payment_no: true,
        Manual_payment_no: true,
        payment_date: true,
        payment_status: true,
        amount_received: true,
        payment_note: true,
        total_invoice: true,
        balance: true,
        company_name: true,
        bill_to_customer_name: true,
        bill_to_customer_email: true,
        bill_to_customer_phone: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Get all purchase orders with payment information

    const purchaseOrders = await prisma.purchaseorder.findMany({
      where: {
        OR: [{ payment_status: { not: null } }, { Payment_no: { not: null } }],
      },
      select: {
        id: true,
        Payment_no: true,
        Manual_payment_no: true,
        payment_status: true,
        amount_paid: true,
        payment_note: true,
        total_amount: true,
        balance: true,
        company_name: true,
        bill_to_vendor_name: true,
        bill_to_vendor_email: true,
        bill_to_vendor_phone: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Transform sales order data to match the UI format
    const salesPayments = salesOrders.map((order) => ({
      id: order.id,
      transactionId:
        order.Payment_no || order.Manual_payment_no || `SO-${order.id}`,
      date: order.payment_date || order.created_at.toISOString().split("T")[0],
      customer: order.bill_to_customer_name || order.company_name || "Unknown",
      paymentMethod: "Sales Order",
      amount: order.amount_received || 0,
      status: order.payment_status || "Pending",
      failureReason: null,
      type: "Sales",
      balance: order.balance || 0,
      totalAmount: order.total_invoice || 0,
      note: order.payment_note || "",
      manualRef: order.Manual_payment_no || "",
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    }));

    // Transform purchase order data to match the UI format
    const purchasePayments = purchaseOrders.map((order) => ({
      id: order.id,
      transactionId:
        order.Payment_no || order.Manual_payment_no || `PO-${order.id}`,
      date: order.created_at.toISOString().split("T")[0],
      customer: order.bill_to_vendor_name || order.company_name || "Unknown",
      paymentMethod: "Purchase Order",
      amount: order.amount_paid || 0,
      status: order.payment_status || "Pending",
      failureReason: null,
      type: "Purchase",
      balance: order.balance || 0,
      totalAmount: order.total_amount || 0,
      note: order.payment_note || "",
      manualRef: order.Manual_payment_no || "",
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    }));

    // Combine both payment types
    const allPayments = [...salesPayments, ...purchasePayments];

    // Calculate statistics
    const totalTransactions = allPayments.length;
    const successfulTransactions = allPayments.filter(
      (p) => p.status === "completed" || p.status === "Success"
    ).length;
    const failedTransactions = allPayments.filter(
      (p) => p.status === "failed" || p.status === "Failed"
    ).length;
    const pendingTransactions = allPayments.filter(
      (p) => p.status === "pending" || p.status === "Pending"
    ).length;

    // Calculate total revenue (sum of successful transactions)
    const totalRevenue = allPayments
      .filter((p) => p.status === "completed" || p.status === "Success")
      .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

    // Calculate success rate
    const successRate =
      totalTransactions > 0
        ? ((successfulTransactions / totalTransactions) * 100).toFixed(2)
        : 0;

    // Sort by date (newest first)
    allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      data: {
        transactions: allPayments,
        statistics: {
          totalRevenue,
          successRate: parseFloat(successRate),
          totalTransactions,
          successfulTransactions,
          failedTransactions,
          pendingTransactions,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching payment transactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment transactions",
      error: error.message,
    });
  }
};

// Get a specific payment transaction by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    // First check if it's a sales order
    const salesOrder = await prisma.salesorder.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        Payment_no: true,
        Manual_payment_no: true,
        payment_date: true,
        payment_status: true,
        amount_received: true,
        payment_note: true,
        total_invoice: true,
        balance: true,
        company_name: true,
        bill_to_customer_name: true,
        bill_to_customer_email: true,
        bill_to_customer_phone: true,
        created_at: true,
        updated_at: true,
        salesorderitems: {
          select: {
            item_name: true,
            qty: true,
            rate: true,
            amount: true,
          },
        },
      },
    });

    if (salesOrder) {
      const paymentData = {
        id: salesOrder.id,
        transactionId:
          salesOrder.Payment_no ||
          salesOrder.Manual_payment_no ||
          `SO-${salesOrder.id}`,
        date:
          salesOrder.payment_date ||
          salesOrder.created_at.toISOString().split("T")[0],
        customer:
          salesOrder.bill_to_customer_name ||
          salesOrder.company_name ||
          "Unknown",
        email: salesOrder.bill_to_customer_email || "",
        phone: salesOrder.bill_to_customer_phone || "",
        paymentMethod: "Sales Order",
        amount: salesOrder.amount_received || 0,
        status: salesOrder.payment_status || "Pending",
        failureReason: null,
        type: "Sales",
        balance: salesOrder.balance || 0,
        totalAmount: salesOrder.total_invoice || 0,
        note: salesOrder.payment_note || "",
        manualRef: salesOrder.Manual_payment_no || "",
        createdAt: salesOrder.created_at,
        updatedAt: salesOrder.updated_at,
        items: salesOrder.salesorderitems,
      };

      return res.status(200).json({
        success: true,
        data: paymentData,
      });
    }

    // If not a sales order, check if it's a purchase order
    const purchaseOrder = await prisma.purchaseorder.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        Payment_no: true,
        Manual_payment_no: true,
        payment_status: true,
        amount_paid: true,
        payment_note: true,
        total_amount: true,
        balance: true,
        company_name: true,
        bill_to_vendor_name: true,
        bill_to_vendor_email: true,
        bill_to_vendor_phone: true,
        created_at: true,
        updated_at: true,
        purchaseorderitems: {
          select: {
            item_name: true,
            qty: true,
            rate: true,
            amount: true,
          },
        },
      },
    });

    if (purchaseOrder) {
      const paymentData = {
        id: purchaseOrder.id,
        transactionId:
          purchaseOrder.Payment_no ||
          purchaseOrder.Manual_payment_no ||
          `PO-${purchaseOrder.id}`,
        date: purchaseOrder.created_at.toISOString().split("T")[0],
        customer:
          purchaseOrder.bill_to_vendor_name ||
          purchaseOrder.company_name ||
          "Unknown",
        email: purchaseOrder.bill_to_vendor_email || "",
        phone: purchaseOrder.bill_to_vendor_phone || "",
        paymentMethod: "Purchase Order",
        amount: purchaseOrder.amount_paid || 0,
        status: purchaseOrder.payment_status || "Pending",
        failureReason: null,
        type: "Purchase",
        balance: purchaseOrder.balance || 0,
        totalAmount: purchaseOrder.total_amount || 0,
        note: purchaseOrder.payment_note || "",
        manualRef: purchaseOrder.Manual_payment_no || "",
        createdAt: purchaseOrder.created_at,
        updatedAt: purchaseOrder.updated_at,
        items: purchaseOrder.purchaseorderitems,
      };

      return res.status(200).json({
        success: true,
        data: paymentData,
      });
    }

    // If neither sales nor purchase order found
    return res.status(404).json({
      success: false,
      message: "Payment transaction not found",
    });
  } catch (error) {
    console.error("Error fetching payment transaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment transaction",
      error: error.message,
    });
  }
};

// Delete a payment transaction
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // First check if it's a sales order
    const salesOrder = await prisma.salesorder.findUnique({
      where: { id: parseInt(id) },
    });

    if (salesOrder) {
      // Update the sales order to clear payment information
      await prisma.salesorder.update({
        where: { id: parseInt(id) },
        data: {
          Payment_no: null,
          Manual_payment_no: null,
          payment_date: null,
          payment_status: null,
          amount_received: 0,
          payment_note: null,
          total_invoice: 0,
          balance: 0,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Sales order payment transaction deleted successfully",
      });
    }

    // If not a sales order, check if it's a purchase order
    const purchaseOrder = await prisma.purchaseorder.findUnique({
      where: { id: parseInt(id) },
    });

    if (purchaseOrder) {
      // Update the purchase order to clear payment information
      await prisma.purchaseorder.update({
        where: { id: parseInt(id) },
        data: {
          Payment_no: null,
          Manual_payment_no: null,
          payment_status: null,
          amount_paid: 0,
          payment_note: null,
          total_amount: 0,
          balance: 0,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Purchase order payment transaction deleted successfully",
      });
    }

    // If neither sales nor purchase order found
    return res.status(404).json({
      success: false,
      message: "Payment transaction not found",
    });
  } catch (error) {
    console.error("Error deleting payment transaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete payment transaction",
      error: error.message,
    });
  }
};
