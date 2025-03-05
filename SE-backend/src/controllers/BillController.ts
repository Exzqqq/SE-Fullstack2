import { Request, Response } from "express";
import { mainDb, drugDb } from "../config/database"; // Use two databases

/**
 * 📌 Create a Bill (Fetches stocks & drugs from `drugDb`, stores bills in `mainDb`)
 */
export const createBill = async (req: Request, res: Response) => {
  const mainClient = await mainDb.connect();
  const drugClient = await drugDb.connect();

  try {
    await mainClient.query("BEGIN");

    const { items } = req.body;

    for (const item of items) {
      const { stock_id, quantity, price, customPrice, service } = item;

      let billItemPrice = price;
      let serviceName = service || null;
      let drugName = null;

      if (service) {
        billItemPrice = customPrice || price;
      } else {
        if (!stock_id) {
          throw new Error("Product stock ID is required.");
        }

        // Fetch stock details from `drugDb`
        const stockQuery = `SELECT unit_price, amount, drug_id FROM stocks WHERE stock_id = $1`;
        const stockResult = await drugClient.query(stockQuery, [stock_id]);

        if (stockResult.rows.length === 0) {
          throw new Error(`Stock with ID ${stock_id} not found`);
        }

        const { unit_price, amount, drug_id } = stockResult.rows[0];

        if (amount < quantity) {
          throw new Error(
            `Insufficient stock for ID ${stock_id}. Available: ${amount}`
          );
        }

        billItemPrice = unit_price;

        // Fetch drug name from `drugDb`
        const drugQuery = `SELECT name FROM drugs WHERE drug_id = $1`;
        const drugResult = await drugClient.query(drugQuery, [drug_id]);

        if (drugResult.rows.length === 0) {
          throw new Error(`Drug with ID ${drug_id} not found`);
        }

        drugName = drugResult.rows[0].name;

        // Deduct stock from `drugDb`
        await drugClient.query(
          `UPDATE stocks SET amount = amount - $1 WHERE stock_id = $2`,
          [quantity, stock_id]
        );
      }

      // Insert bill item into `mainDb`
      await mainClient.query(
        `INSERT INTO bill_items (bill_id, stock_id, quantity, subtotal, service, custom_price, drug_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          null,
          service ? null : stock_id,
          quantity,
          billItemPrice * quantity,
          serviceName,
          customPrice,
          drugName,
        ]
      );
    }

    await mainClient.query("COMMIT");

    res.status(201).json({ message: "Bill items added successfully" });
  } catch (error: any) {
    await mainClient.query("ROLLBACK");
    res
      .status(500)
      .json({ error: "Failed to add bill items", details: error.message });
  } finally {
    mainClient.release();
    drugClient.release();
  }
};

/**
 * 📌 List All Pending Bills
 */
export const listBills = async (req: Request, res: Response): Promise<void> => {
  const client = await mainDb.connect();

  try {
    const result = await client.query(`
      SELECT 
        bi.bill_item_id,
        bi.stock_id,
        bi.quantity,
        bi.subtotal,
        bi.service,
        bi.custom_price,
        bi.drug_name
      FROM bill_items bi
      WHERE bi.status = 'pending'
      ORDER BY bi.bill_item_id ASC
    `);

    res.status(200).json(result.rows);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch bill items", message: error.message });
  } finally {
    client.release();
  }
};

/**
 * 📌 Remove a Bill Item
 */
export const removeBillItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const client = await mainDb.connect();
  const drugClient = await drugDb.connect();
  const billItemId = parseInt(req.params.id, 10);

  if (isNaN(billItemId)) {
    res.status(400).json({ error: "Invalid bill_item_id" });
    return;
  }

  try {
    await client.query("BEGIN");

    // Get bill item details
    const billItemResult = await client.query(
      "SELECT stock_id, quantity FROM bill_items WHERE bill_item_id = $1",
      [billItemId]
    );

    if (billItemResult.rows.length === 0) {
      throw new Error(`Bill item with ID ${billItemId} not found`);
    }

    const { stock_id, quantity } = billItemResult.rows[0];

    await client.query("DELETE FROM bill_items WHERE bill_item_id = $1", [
      billItemId,
    ]);

    if (stock_id) {
      await drugClient.query(
        "UPDATE stocks SET amount = amount + $1 WHERE stock_id = $2",
        [quantity, stock_id]
      );
    }

    await client.query("COMMIT");

    res
      .status(200)
      .json({ message: `Bill item ${billItemId} removed and stock updated` });
  } catch (error: any) {
    await client.query("ROLLBACK");
    res
      .status(500)
      .json({ error: "Failed to remove bill item", message: error.message });
  } finally {
    client.release();
    drugClient.release();
  }
};

/**
 * 📌 Confirm a Bill
 */
export const confirm = async (req: Request, res: Response): Promise<void> => {
  const client = await mainDb.connect();

  try {
    await client.query("BEGIN");

    const { discount } = req.body;

    const billItemsResult = await client.query(`
      SELECT bi.bill_item_id, bi.subtotal
      FROM bill_items bi
      WHERE bi.status = 'pending'
    `);

    if (billItemsResult.rows.length === 0) {
      throw new Error("No pending bill items found to confirm");
    }

    const totalAmount = billItemsResult.rows.reduce(
      (sum, item) => sum + parseFloat(item.subtotal),
      0
    );

    const discountedAmount = totalAmount - (totalAmount * discount) / 100;

    const billResult = await client.query(
      `INSERT INTO bills (total_amount, discount, created_at)
       VALUES ($1, $2, NOW()) RETURNING bill_id`,
      [discountedAmount, discount]
    );

    const newBillId = billResult.rows[0].bill_id;

    await client.query(
      `UPDATE bill_items SET bill_id = $1, status = 'confirmed' WHERE status = 'pending'`,
      [newBillId]
    );

    await client.query("COMMIT");

    res
      .status(201)
      .json({ message: "Bill confirmed successfully", bill_id: newBillId });
  } catch (error: any) {
    await client.query("ROLLBACK");
    res
      .status(500)
      .json({ error: "Failed to confirm bill", message: error.message });
  } finally {
    client.release();
  }
};

export const history = async (req: Request, res: Response) => {
  const client = await mainDb.connect();
  const { page = 1, searchQuery = "" } = req.query;

  const itemsPerPage = 10;
  const offset = (Number(page) - 1) * itemsPerPage;

  try {
    const searchString = Array.isArray(searchQuery)
      ? searchQuery.join(" ")
      : String(searchQuery);

    const historyQuery = `
      SELECT 
        b.bill_id,
        b.customer_name,
        b.total_amount,
        b.created_at,
        COUNT(bi.bill_item_id) AS item_count
      FROM bills b
      LEFT JOIN bill_items bi ON b.bill_id = bi.bill_id
      WHERE LOWER(b.bill_id::text) LIKE $1
        OR LOWER(b.created_at::text) LIKE $2
      GROUP BY b.bill_id
      ORDER BY b.created_at DESC
      LIMIT $3 OFFSET $4
    `;

    const searchPattern = `%${searchString.toLowerCase()}%`;

    const historyResult = await client.query(historyQuery, [
      searchPattern,
      searchPattern,
      itemsPerPage,
      offset,
    ]);

    const countQuery =
      "SELECT COUNT(*) FROM bills WHERE LOWER(bill_id::text) LIKE $1 OR LOWER(created_at::text) LIKE $2";
    const countResult = await client.query(countQuery, [
      searchPattern,
      searchPattern,
    ]);

    const totalRows = parseInt(countResult.rows[0].count, 10);
    const totalPage = Math.ceil(totalRows / itemsPerPage);

    res.status(200).json({
      bills: historyResult.rows,
      totalRows,
      totalPage,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch bill history", details: error.message });
  } finally {
    client.release();
  }
};

export const dashboard = async (req: Request, res: Response) => {
  const client = await mainDb.connect();
  const { year } = req.params;

  try {
    await client.query("BEGIN");

    const dashboardQuery = `
      SELECT
        EXTRACT(MONTH FROM created_at) AS month,
        SUM(total_amount) AS total_sales
      FROM bills
      WHERE EXTRACT(YEAR FROM created_at) = $1
      GROUP BY month
      ORDER BY month;
    `;
    const dashboardResult = await client.query(dashboardQuery, [year]);

    const expensesQuery = `
      SELECT
        EXTRACT(MONTH FROM datetime) AS month,
        SUM(totalprice) AS total_expenses
      FROM expense
      WHERE EXTRACT(YEAR FROM datetime) = $1
      GROUP BY month
      ORDER BY month;
    `;
    const expensesResult = await client.query(expensesQuery, [year]);

    const monthlyData = dashboardResult.rows.map((row) => {
      const expenseData = expensesResult.rows.find(
        (expense) => expense.month === row.month
      );
      return {
        month: row.month,
        income: row.total_sales || 0,
        expense: expenseData ? expenseData.total_expenses : 0,
      };
    });

    const totalSales = monthlyData.reduce(
      (total, data) => total + parseFloat(data.income || "0"),
      0
    );

    const totalExpenses = monthlyData.reduce(
      (total, data) => total + parseFloat(data.expense || "0"),
      0
    );

    const netProfit = totalSales - totalExpenses;

    const totalSalesAllYearsQuery = `
      SELECT
        SUM(total_amount) AS total_sales_all_years
      FROM bills;
    `;
    const totalSalesAllYearsResult = await client.query(
      totalSalesAllYearsQuery
    );

    const totalExpensesAllYearsQuery = `
      SELECT
        SUM(totalprice) AS total_expenses_all_years
      FROM expense;
    `;
    const totalExpensesAllYearsResult = await client.query(
      totalExpensesAllYearsQuery
    );

    const totalSalesAllYears =
      totalSalesAllYearsResult.rows[0].total_sales_all_years || 0;
    const totalExpensesAllYears =
      totalExpensesAllYearsResult.rows[0].total_expenses_all_years || 0;
    const netProfitAllYears = totalSalesAllYears - totalExpensesAllYears;

    const finalMonthlyData = monthlyData;

    res.status(200).json({
      monthlyData: finalMonthlyData,
      totalSales: parseFloat(totalSales.toString()),
      totalExpenses: parseFloat(totalExpenses.toString()),
      netProfit: parseFloat(netProfit.toString()),
      totalSalesAllYears: parseFloat(totalSalesAllYears.toString()),
      totalExpensesAllYears: parseFloat(totalExpensesAllYears.toString()),
      netProfitAllYears: parseFloat(netProfitAllYears.toString()),
    });

    await client.query("COMMIT");
  } catch (error: any) {
    await client.query("ROLLBACK");
    res.status(500).json({
      error: "Failed to fetch dashboard data",
      details: error.message,
    });
  } finally {
    client.release();
  }
};

export const getBillInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  const client = await mainDb.connect();
  const { bill_id } = req.params;

  // Validate bill_id (check if it's a valid integer)
  if (!bill_id || isNaN(Number(bill_id))) {
    res.status(400).json({ error: "Invalid or missing bill_id" });
    return; // Ensure no further code execution
  }

  try {
    const billQuery = `
      SELECT 
        b.bill_id, 
        b.total_amount, 
        b.discount,
        b.created_at, 
        json_agg(
          json_build_object(
            'stock_id', bi.stock_id,      
            'drug_name', 
              CASE
                WHEN bi.service IS NOT NULL THEN bi.service
                ELSE d.name
              END,
            'quantity', bi.quantity,
            'unit_price', s.unit_price,
            'subtotal', bi.subtotal
          ) ORDER BY bi.stock_id ASC    
        ) AS treatments
      FROM bills b
      JOIN bill_items bi ON b.bill_id = bi.bill_id
      LEFT JOIN stocks s ON bi.stock_id = s.stock_id
      LEFT JOIN drugs d ON s.drug_id = d.drug_id
      WHERE b.bill_id = $1
      GROUP BY b.bill_id, b.total_amount, b.created_at;
    `;

    const billResult = await client.query(billQuery, [bill_id]);

    if (billResult.rows.length === 0) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }

    const billData = billResult.rows[0];
    res.status(200).json(billData);
  } catch (error: any) {
    console.error("Error fetching bill info:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch bill info", message: error.message });
  } finally {
    client.release();
  }
};

//for stock
export const getTopSellingStocks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const client = await drugDb.connect();

  try {
    const query = `
      SELECT
        s.stock_id,
        d.name AS drug_name,
        s.unit_price,
        SUM(bi.quantity) AS total_quantity_sold
      FROM
        bill_items bi
      JOIN stocks s ON bi.stock_id = s.stock_id
      JOIN drugs d ON s.drug_id = d.drug_id
      WHERE
        bi.status = 'confirmed'
      GROUP BY
        s.stock_id, d.name, s.unit_price
      ORDER BY
        total_quantity_sold DESC
      LIMIT 5;
    `;

    const result = await client.query(query);

    if (result.rows.length === 0) {
      res.status(404).json({ error: "No top selling stocks found" });
      return;
    }

    // Return the top 5 selling stocks
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching top selling stocks:", error);
    res.status(500).json({ error: "Failed to fetch top selling stocks" });
  } finally {
    client.release();
  }
};

export const getStockByStockId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { stock_id } = req.params; // Extract stock_id from request URL

  try {
    const result = await drugDb.query(
      `SELECT s.stock_id, s.unit_price, s.amount, s.expired, 
              d.name AS drug_name, d.drug_type, d.unit_type 
       FROM stocks s
       JOIN drugs d ON s.drug_id = d.drug_id
       WHERE s.stock_id = $1`,
      [stock_id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Stock not found" });
    }

    res.status(200).json(result.rows[0]); // Return stock info with drug name
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).json({ error: "Failed to fetch stock details" });
  }
};

export const getStockByDrugId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { drug_id } = req.params; // Drug ID from URL

  try {
    const result = await drugDb.query("SELECT * FROM stocks WHERE drug_id = $1", [
      drug_id,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: "No stocks found for this drug" });
    }

    res.json(result.rows);
  } catch (error) {
    console.error(error); // Debugging log
    res.status(500).json({ error: "Failed to fetch stocks by drug ID" });
  }
};