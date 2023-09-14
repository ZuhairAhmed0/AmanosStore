const router = require("express").Router();
const Products = require("../../controllers/dashboard/products.controller");
const isAuthorized = require("../../middleware/isAuthorized");
const uploadFile = require("../../helpers/upload");
const validate = require("../../middleware/validator");
// get all products
const products = new Products();

router.get("/", isAuthorized(["supervisor", "admin"]), products.getAll);

//
router.post("/upload", isAuthorized(["supervisor", "admin"]), uploadFile);
// add new product
router
  .route("/add")
  .get(isAuthorized(["supervisor", "admin"]), (req, res) => {
    res.render("dashboard/addProduct", {
      title: "اضافة منتج حديد",
      layout: "dashboard",
    });
  })
  .post(
    isAuthorized(["supervisor", "admin"]),
    validate("product"),
    products.add
  )
  .put(
    isAuthorized(["supervisor", "admin"]),
    validate("product"),
    products.update
  );

router
  .route("/filter")
  .post(isAuthorized(["supervisor", "admin"]), products.filter)
  .get(isAuthorized(["supervisor", "admin"]), products.getAll);
router.get("/search", isAuthorized(["supervisor", "admin"]), products.search);
// get product by id
router.get("/:id/add", isAuthorized(["supervisor", "admin"]), products.edit);

router.get(
  "/:id/details",
  isAuthorized(["supervisor", "admin"]),
  products.details
);
router.get(
  "/:id/cards",
  isAuthorized(["supervisor", "admin"]),
  products.cardDetails
);
router
  .route("/add-card/:id")
  .get(isAuthorized(["supervisor", "admin"]), (req, res) => {
    console.log(req.query?.cardId);
    res.render("dashboard/cardTopUp", {
      title: "اضافة بطاقة جديدة",
      layout: "dashboard",
      cardInfo: {
        amount: req.query?.amount,
        amountId: req.params.id,
        productId: req.query?.productId,
        cardNumbers: req.query?.cardNumbers,
        cardId: req.query?.cardId,
      },
    });
  })
  .put(
    isAuthorized(["supervisor", "admin"]),
    validate("cardTopUp"),
    products.addCard
  );

router.get("/:id/soft-delete", isAuthorized(["admin"]), products.softDelete);
router.get("/:id/hard-delete", isAuthorized(["admin"]), products.hardDelete);
router.get("/:id/restore", isAuthorized(["admin"]), products.restore);
module.exports = router;
