import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import {
  createBill,
  listBills,
  removeBillItem,
  confirm,
  history,
  dashboard,
  getBillInfo,
  getStockByDrugId,
  getStockByStockId,
  getTopSellingStocks,
} from "../controllers/BillController";

import {
  createExpense,
  getAllExpenses,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController";

const router = express.Router();

/**
 * 📌 BILL ROUTES
 */
router.post("/bill/create", createBill);
router.get("/bill/list", listBills);
router.delete("/bill/remove/:id", removeBillItem);
router.post("/bill/confirm", confirm);
router.get("/bill/history", history);
router.get("/bill/dashboard/:year", dashboard);
router.get("/sell/info/:bill_id", getBillInfo);
router.get("/stocks/drug/:drug_id", getStockByDrugId);
router.get("/stocks/drugs/:stock_id", getStockByStockId);
router.get("/stocks/top-selling", getTopSellingStocks);

/**
 * 📌 EXPENSE ROUTES
 */
router.get("/expense/:page/:day?/:month?/:year?", getAllExpenses);
router.post("/expense/create", createExpense);
router.put("/expense/update/:id", updateExpense);
router.delete("/expense/remove/:id", deleteExpense);

/**
 * 📌 HOME ROUTE (FOR API HEALTH CHECK)
 */
router.get("/", (req: Request, res: Response) => {
  res.send("Hello, API is running! 🚀");
});

export default router;