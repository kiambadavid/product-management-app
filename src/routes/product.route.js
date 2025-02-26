const express = require("express");
const router = express.Router();
const productController = require("../controllers/product_controller");
// const { isAuthenticated } = require("../middleware/auth");
// router.use(isAuthenticated);
router.post("/create-products", productController.createProduct);
router.get("/", productController.getAllProducts);
router.put("/update-product/:id", productController.updateProduct);
router.delete("/delete-product/:id", productController.deleteProduct);

module.exports = router;
