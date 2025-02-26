const { db } = require("../configurations/knex");
const { AppError } = require("../middleware/errorHandler");
const { ResponseHandler } = require("../utilities/responseHandler");
const { logger } = require("../utilities/logger");

// Create product
const createProduct = async (req, res, next) => {
  try {
    const { name, type } = req.body;

    // Check if product already exists
    const productExists = await db("products")
      .where("name", name)
      .andWhere("type", type)
      .first();

    if (productExists) {
      logger.error("Product already exists");
      throw new AppError("Product already exists", 400);
    }

    // Input validation
    if (!name || !type) {
      logger.error("Missing required fields: name or type");
      throw new AppError("Name and type are required fields", 400);
    }

    // Validate string inputs
    if (typeof name !== "string" || typeof type !== "string") {
      logger.error("Invalid input types for name or type");
      throw new AppError("Name and type must be strings", 400);
    }

    // Trim and validate length
    const trimmedName = name.trim();
    const trimmedType = type.trim();

    if (trimmedName.length < 1 || trimmedType.length < 1) {
      logger.error("Empty strings provided for name or type");
      throw new AppError("Name and type cannot be empty", 400);
    }

    // Create new product
    const newProduct = await db("products")
      .insert({
        name: trimmedName,
        type: trimmedType,
      })
      .returning("*");

    logger.info(`Product created successfully: ${newProduct[0].id}`);
    return ResponseHandler.created(
      res,
      newProduct[0],
      "Product created successfully"
    );
  } catch (error) {
    logger.error("Error in createProduct:", error);
    return next(error);
  }
};

// Get all products
const getAllProducts = async (req, res, next) => {
  try {
    const products = await db("products").select("*");
    logger.info("Products retrieved successfully");
    return ResponseHandler.success(
      res,
      products,
      "Products retrieved successfully"
    );
  } catch (error) {
    logger.error("Error in getAllProducts:", error);
    return next(error);
  }
};

// Update product
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    // Check if product exists
    const product = await db("products").where("id", id).first();

    if (!product) {
      logger.error("Product not found");
      throw new AppError("Product not found", 404);
    }

    // Input validation
    if (!name || !type) {
      logger.error("Missing required fields: name or type");
      throw new AppError("Name and type are required fields", 400);
    }

    // Validate string inputs
    if (typeof name !== "string" || typeof type !== "string") {
      logger.error("Invalid input types for name or type");
      throw new AppError("Name and type must be strings", 400);
    }

    // Trim and validate length
    const trimmedName = name.trim();
    const trimmedType = type.trim();

    if (trimmedName.length < 1 || trimmedType.length < 1) {
      logger.error("Empty strings provided for name or type");
      throw new AppError("Name and type cannot be empty", 400);
    }

    // Update product
    const updatedProduct = await db("products")
      .where("id", id)
      .update({
        name: trimmedName,
        type: trimmedType,
      })
      .returning("*");

    logger.info(`Product updated successfully: ${updatedProduct[0].id}`);
    return ResponseHandler.success(
      res,
      updatedProduct[0],
      "Product updated successfully"
    );
  } catch (error) {
    logger.error("Error in updateProduct:", error);
    return next(error);
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await db("products").where("id", id).first();
    if (!product) {
      logger.error("Product not found");
      throw new AppError("Product not found", 404);
    }

    // Validate id
    if (!id) {
      logger.error("Missing required field: id");
      throw new AppError("Id is a required field", 400);
    }
    //  Validate empty string
    if (id === "") {
      logger.error("Empty string provided for id");
      throw new AppError("Id cannot be empty", 400);
    }

    // Delete product
    const deletedProduct = await db("products").where("id", id).del();
    logger.info(`Product deleted successfully: ${id}`);
    return ResponseHandler.success(
      res,
      deletedProduct,
      "Product deleted successfully"
    );
  } catch (error) {
    logger.error("Error in deleting Product:", error);
    return next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
};
