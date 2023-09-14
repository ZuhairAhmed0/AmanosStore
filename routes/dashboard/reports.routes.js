const router = require("express").Router();
const Reports = require("../../controllers/dashboard/reports.controller");
const isAuthorized = require("../../middleware/isAuthorized");

// get all orders
const reports = new Reports();
router.get("/", isAuthorized(["supervisor", "admin"]), reports.yearlyReport);
router.get("/:month", isAuthorized(["supervisor", "admin"]), reports.monthlyReport);

module.exports = router;