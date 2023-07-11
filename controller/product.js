const asyncHandler = require("../middleware/async");
const createError = require("../utilis/createError");
const path = require("path");
const Product = require("../models/Product");
const cloudinary = require("cloudinary").v2;

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// });

const getProducts = asyncHandler(async (req, res, next) => {
  const keyWord = req.query.keyWord;

  if (keyWord) {
    const searchItem = keyWord
      ? { name: { $regex: keyWord, $options: "i" } }
      : {};

    const searchProduct = await Product.find(searchItem);

    res.status(200).send({
      status: "success",

      data: { results: searchProduct, count: searchProduct.length },
    });
  } else {
    res.status(200).send({ status: "success", data: res.advanceResults });
  }
});

const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId).populate({
    path: "Reviews",
    select: "title text",
  });

  if (!product)
    throw createError(
      404,
      `Product is not found with id of ${req.params.productId}`
    );

  res.status(200).send({ status: "success", data: product });
});

const createProduct = asyncHandler(async (req, res, next) => {
  try { 
  console.log('req.body :>> ', req.body);
  const productData = req.body.product
  const product = await Product.create(
    productData,
  );

  return (res.send({product}))
  } catch (error) {
    console.log('error.message', error.message)
    return (res.send(error.message))
  }
});

const updateProduct = asyncHandler(async (req, res, next) => {
  const editProduct = await Product.findByIdAndUpdate(
    req.params.productId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!editProduct)
    throw createError(
      404,
      `Product is not found with id of ${req.params.productId}`
    );

  const updatedProduct = await Product.findById(req.params.productId);

  res.status(201).send({ status: "success", data: updatedProduct });
});
const deleteProduct = asyncHandler(async (req, res, next) => {
  const deleteProduct = await Product.findById(req.params.productId);

  if (!deleteProduct)
    throw createError(
      404,
      `User is not found with id of ${req.params.productId}`
    );

  await deleteProduct.remove();

  res
    .status(204)
    .send({ status: "success", message: "Product Deleted Successfully" });
});
module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
