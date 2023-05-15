import { Router } from "express";
import { createProduct, getAllProducts , getProductById , updateProduct , deleteProduct } from "../controllers/products.controller.js";

const router = Router();

//Controller
router.post('/products', createProduct);
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

export default router