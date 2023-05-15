import {response, Router} from 'express';
//import ProductManager from "../service/fylesystem/ProductManagerAsync.js";
import { cartModel } from '../../db/mongodb/models/cart.model.js';
import { checkAuth } from '../../config/passport.config.js';

const router = Router();

router.get('/carts/:id',checkAuth, async(req, res) => {
    try {
        const cart = await cartModel.findById(req.params.id).populate('products._id').lean();
        return res.render('Cart', {cart : cart});
    } catch (error) {
        return res.status(500).send({status: "error", message : error.message});
    }
})

export default router
