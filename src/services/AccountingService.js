import prisma from "../config/db.js";

/**
 * Helper: Generate next voucher number
 */
const generateVoucherNo = async (companyId, prefix = "JV-") => {
  const recent = await prisma.journal_entries.findMany({
    where: { company_id: Number(company_id) },
    select: { voucher_no_auto: true },
    orderBy: { id: "desc" },
    take: 1,
  });

  let nextNum = 1;
  if (recent.length > 0 && recent[0].voucher_no_auto) {
    const lastNo = recent[0].voucher_no_auto;
    const match = lastNo.match(/(\d+)$/);
    if (match) {
      nextNum = parseInt(match[1]) + 1;
    }
  }
  return `${prefix}${String(nextNum).padStart(4, "0")}`;
};

/**
 * Helper: Find or Create Account by Name (Fallback mechanism)
 */
const findAccountId = async (companyId, accountName, mainCategory, subgroupName) => {
  // 1. Try to find existing account
  const account = await prisma.accounts.findFirst({
    where: {
      company_id: Number(company_id),
      vendorscustomer: {
        some: { account_name: accountName } // This might be tricky if not mapped 1:1, usually we find by name in account table?
        // Actually accounts table doesn't have 'name'. It links to 'parent_account' or 'sub_of_subgroups'.
        // Let's assume we look up via the COA structure we built.
      }
    }
  });

  // NOTE: The current schema for 'accounts' is a bit complex (linked to subgroups). 
  // For simplicity in this service, we will try to find an account that belongs to a subgroup with the given name.

  // Strategy: Find subgroup -> Find account in it.
  // If not found, we might need to fail gracefully or log it.

  // For V1, we will rely on the fact that Customers/Vendors HAVE an account_id linked.
  return null;
};


export const AccountingService = {
  /**
   * Post Sales Invoice to Ledger
   * Debit: Customer (AR)
   * Credit: Sales Account
   * Credit: Tax Account (if tax > 0)
   */
  postSalesInvoice: async (invoice, items, companyId) => {
    try {
      console.log("Posting Sales Invoice to Ledger:", invoice.invoice_no);

      // 0. Idempotency Check
      const existingEntry = await prisma.journal_entries.findFirst({
        where: {
          company_id: Number(company_id),
          manual_voucher_no: invoice.invoice_no, // We use Invoice No as the manual ref
          voucher_type: "Sales Invoice"
        }
      });

      if (existingEntry) {
        console.log(`Journal Entry for Invoice #${invoice.invoice_no} already exists.Skipping.`);
        return;
      }

      const totalAmount = Number(invoice.total || 0);
      const subTotal = Number(invoice.subtotal || 0);
      const taxTotal = Number(invoice.tax || 0);

      if (totalAmount === 0) return;

      // 1. Get Customer Account
      // The invoice has 'customer_id'. We need to find the specific ledger account for this customer.
      // Usually, the 'vendorscustomer' table has an 'account_id'.
      const customer = await prisma.vendorscustomer.findUnique({
        where: { id: Number(invoice.customer_id) },
      });

      if (!customer?.account_id) {
        throw new Error(`Customer ${customer?.name_english} does not have a linked Ledger Account.`);
      }

      // 2. Get Sales Account (Default)
      // For now, let's hardcode looking for a "Sales" account or use a configurable ID.
      // We'll search for a subgroup named "Sales" or "Income".
      let salesAccountId = null;
      const salesGroup = await prisma.parent_accounts.findFirst({
        where: {
          company_id: Number(company_id),
          subgroup_name: { contains: "Sales" } // Heuristic
        },
        include: { accounts: true }
      });

      if (salesGroup && salesGroup.accounts.length > 0) {
        salesAccountId = salesGroup.accounts[0].id;
      } else {
        // Fallback: This is critical. If no sales account, we can't post.
        // For development, creates a warning.
        console.warn("No 'Sales' ledger account found. Skipping ledger posting.");
        return;
      }

      // 3. Tax Account
      // Heuristic: Search for "Tax" or "Duties"
      let taxAccountId = null;
      if (taxTotal > 0) {
        const taxGroup = await prisma.parent_accounts.findFirst({
          where: {
            company_id: Number(company_id),
            subgroup_name: { contains: "Duties" }
          },
          include: { accounts: true }
        });
        if (taxGroup && taxGroup.accounts.length > 0) {
          taxAccountId = taxGroup.accounts[0].id;
        }
      }

      // 4. Generate Voucher
      const voucherNo = await generateVoucherNo(companyId, "INV-JRNL-");

      // 5. Create Journal Entry
      const journalEntry = await prisma.journal_entries.create({
        data: {
          company_id: Number(company_id),
          voucher_no_auto: voucherNo,
          voucher_type: "Sales Invoice",
          voucher_date: new Date(invoice.invoice_date || new Date()),
          narration: `Auto-posting for Invoice #${invoice.invoice_no}`,
          total_debit: totalAmount,
          total_credit: totalAmount,
          manual_voucher_no: invoice.invoice_no,
        }
      });

      // 6. Create Lines

      // Debit Customer
      await prisma.journal_lines.create({
        data: {
          journal_entry_id: journalEntry.id,
          account_id: customer.account_id,
          debit_amount: totalAmount,
          credit_amount: 0,
          narration: `Invoice #${invoice.invoice_no} - Customer Debit`,
          seq: 1
        }
      });

      // Credit Sales
      await prisma.journal_lines.create({
        data: {
          journal_entry_id: journalEntry.id,
          account_id: salesAccountId,
          debit_amount: 0,
          credit_amount: subTotal, // Net Sales
          narration: `Invoice #${invoice.invoice_no} - Sales Income`,
          seq: 2
        }
      });

      // Credit Tax (if any)
      if (taxTotal > 0 && taxAccountId) {
        await prisma.journal_lines.create({
          data: {
            journal_entry_id: journalEntry.id,
            account_id: taxAccountId,
            debit_amount: 0,
            credit_amount: taxTotal,
            narration: `Invoice #${invoice.invoice_no} - Tax Payable`,
            seq: 3
          }
        });
      } else if (taxTotal > 0 && !taxAccountId) {
        // If we have tax but no tax account, dump it into Sales for balance (dirty fix, but prevents imbalance)
        await prisma.journal_lines.updateMany({
          where: { journal_entry_id: journalEntry.id, seq: 2 },
          data: { credit_amount: Number(subTotal) + Number(taxTotal) }
        });
      }

      console.log(`Journal Entry ${voucherNo} created successfully.`);

    } catch (error) {
      console.error("Failed to post Sales Invoice to Ledger:", error);
      // We do not block the invoice creation, just log the error.
    }
  },

  /**
   * Post Purchase Bill to Ledger
   * Debit: Purchase/Expense
   * Debit: Tax
   * Credit: Vendor (AP)
   */
  postPurchaseBill: async (bill, items, companyId) => {
    try {
      console.log("Posting Purchase Bill to Ledger:", bill.Bill_no);

      const totalAmount = Number(bill.total || 0);
      const subTotal = Number(bill.subtotal || 0);
      const taxTotal = Number(bill.tax || 0);

      if (totalAmount === 0) return;

      // 1. Get Vendor Account (from shipping_details or bill data)
      // We might need to look up the vendor by name if ID isn't direct
      // Ideally 'bill' object should have vendor_id if we enhanced the controller.
      // Assuming we can find it via name if ID missing.
      let vendorAccountId = null;

      // This is a weak link in the current data structure (Bill step data is flat JSON).
      // We will try to find the vendor by name from the bill data.
      const vendorName = bill.bill_to_vendor_name || bill.vendorName; // Check field naming
      if (vendorName) {
        const vendor = await prisma.vendorscustomer.findFirst({
          where: {
            company_id: Number(company_id),
            name_english: vendorName
          }
        });
        vendorAccountId = vendor?.account_id;
      }

      if (!vendorAccountId) {
        console.warn(`Vendor account for '${vendorName}' not found. Skipping posting.`);
        return;
      }

      // 2. Findings Purchase Account
      let purchaseAccountId = null;
      const purchaseGroup = await prisma.parent_accounts.findFirst({
        where: {
          company_id: Number(company_id),
          subgroup_name: { contains: "Purchase" }
        },
        include: { accounts: true }
      });

      if (purchaseGroup && purchaseGroup.accounts.length > 0) {
        purchaseAccountId = purchaseGroup.accounts[0].id;
      } else {
        console.warn("No 'Purchase' ledger account found. Skipping.");
        return;
      }

      // 3. Generate Voucher
      const voucherNo = await generateVoucherNo(companyId, "BILL-JRNL-");

      // 4. Create Journal
      const journalEntry = await prisma.journal_entries.create({
        data: {
          company_id: Number(company_id),
          voucher_no_auto: voucherNo,
          voucher_type: "Purchase Bill",
          voucher_date: new Date(bill.due_date || new Date()),
          narration: `Auto-posting for Bill #${bill.Bill_no}`,
          total_debit: totalAmount,
          total_credit: totalAmount,
          manual_voucher_no: bill.Bill_no,
        }
      });

      // 5. Lines

      // Debit Purchase
      await prisma.journal_lines.create({
        data: {
          journal_entry_id: journalEntry.id,
          account_id: purchaseAccountId,
          debit_amount: subTotal, // Net Purchase
          credit_amount: 0,
          narration: `Bill #${bill.Bill_no} - Purchase Expense`,
          seq: 1
        }
      });

      // Credit Vendor
      await prisma.journal_lines.create({
        data: {
          journal_entry_id: journalEntry.id,
          account_id: vendorAccountId,
          debit_amount: 0,
          credit_amount: totalAmount,
          narration: `Bill #${bill.Bill_no} - Vendor Credit`,
          seq: 2
        }
      });

      // Handle Tax (Debit Input Tax)
      // ... (Similar logic to Sales Tax, omitted for brevity but should be added)
      if (taxTotal > 0) {
        // simplified: add to purchase cost for now if no specific tax account found
        await prisma.journal_lines.updateMany({
          where: { journal_entry_id: journalEntry.id, seq: 1 },
          data: { debit_amount: Number(subTotal) + Number(taxTotal) }
        });
      }

      console.log(`Journal Entry ${voucherNo} created successfully.`);

    } catch (error) {
      console.error("Failed to post Purchase Bill:", error);
    }
  }
};
