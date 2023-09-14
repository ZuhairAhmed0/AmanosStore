const router = require("express").Router();
const {
  getAllProducts,
  gamesTopUp,
  gameCards,
  balanceTopUp,
} = require("../controllers/home.controller");

router.get("/", getAllProducts);

router.get("/games-top-up", gamesTopUp);
router.get("/balance-top-up", balanceTopUp);
router.get("/game-cards", gameCards);

router.get("/contact-us", (req, res) => {
  res.render("contact-us", {
    title: "اتصل بنا",
  });
});

router.get("/terms-and-conditions", (req, res) => {
  res.render("terms-and-conditions", {
    title: "الشروط والاحكام",
  });
});

router.get("/support", (req, res) => {
  res.render("support", {
    title: "الدعم والمساعدة",
  });
});

router.get("/refund-policy", (req, res) => {
  res.render("refund-policy", {
    title: "سياسة الإسترجاع",
  });
});

router.get("/privacy-policy", (req, res) => {
  res.render("privacy-policy", {
    title: "سياسة الخصوصية",
  });
});

module.exports = router;