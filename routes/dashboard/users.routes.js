const router = require("express").Router();

const isAuthorized = require("../../middleware/isAuthorized");
const Users = require("../../controllers/dashboard/users.controller");
// render dashboard home page
const users = new Users();

// dashboard home page
router.get(
  "/",
  isAuthorized(["supervisor", "admin"]),
  users.dashboard
);

// get all users
router.get("/users", isAuthorized(["supervisor", "admin"]), users.getAll);
router.get(
  "/users/search",
  isAuthorized(["supervisor", "admin"]),
  users.search
);
// get all user order
router.get(
  "/users/:id/orders",
  isAuthorized(["supervisor", "admin"]),
  users.getOrders
);
router
  .route("/users/:id/update-role")
  .get(isAuthorized(["admin"]), users.updateRolePage)
  .put(isAuthorized(["admin"]), users.updateRole);

router.get("/users/:id/delete", isAuthorized(["admin"]), users.delete);
router.get("/users/:id/restore", isAuthorized(["admin"]), users.restore);
module.exports = router;
