import { mongo } from "mongoose";
//import { cartModel } from "../models/cart.model.js";
import Cartsrepository from "../repositories/carts.repository.js";
import Productsrepository from "../repositories/products.repository.js";
import Ticketrepository from "../repositories/tickets.repository.js";

const prodController = new Productsrepository;

const ticketController = new Ticketrepository

const controller = new Cartsrepository;

export const createCart = async(req, res) => {
    try {
        const cart = await controller.create()
        return res.send(cart);
    } catch (error) {
        return res.status(500).send({status: "error", message : error.message});
    }
};

export const getCartById = async(req, res) => {
    try {
        const cart = await controller.getById(req.params.id)
        const newCart = await cart.populate('products._id');
        return res.send(newCart);
    } catch (error) { 
        return res.status(500).send({status: "error", message : error.message});
    }
}

export const addProdToCart = async(req, res) => {
    try {
        const cart = await controller.getById(req.params.cid);

        const arrprod = cart.products.filter(prod => prod._id.toString() === req.params.pid);
        
        if(!arrprod[0]){

            cart.products.push({_id : new mongo.ObjectId(req.params.pid) , quantity : 1});
            const newCart = await cart.save();
            return res.send(newCart);

        } else {
        
            const newQuantity = arrprod[0].quantity + 1
            const updatedCart = controller.updateQuantity(cart._id, arrprod[0]._id, newQuantity)
            return res.status(200).send({status: "success", message : "quantity updated successfully"});
        }

        /*
            //sin el model
            const productArr = cart.products.filter(prod => prod._id === req.params.id)

            if (productArr){
                productArr[0].quantity ++
                Cart.save();
            } else {
                cart.products.push({_id : new mongo.ObjectId(req.params.pid) , quantity : 1});
                    const newCart = await cart.save();
                    return res.send(newCart)
            }
            */

            /*
            db.updateOne(
                // $elemMatch finds docs containing an array with a matching element
                {
                    "trees": { "$elemMatch": { "poken": 5 }}
                },
                // Positional operator $ is a placeholder for the first matching array element
                {
                    "$set": { "trees.$.poken": 7 }
                }
            );
            */

    } catch (error) {
        return res.status(500).send({status: "error", message : error.message});
    }
}

export const deleteProdinCart = async(req, res) => {
    try {
        const cart = await controller.getById(req.params.cid);
        
        cart.products.forEach((prod) => {
            if(prod._id.toString() === req.params.pid){
                let index = cart.products.indexOf(prod)
                cart.products.splice(index, 1);
            }
        });

        const newCart = await cart.save();
        return res.send(newCart);

    } catch (error) {
        return res.status(500).send({status: "error", message : error.message});
    }
};

export const updateProdQuantity = async(req, res) => {
    try {
        const cart = await controller.getById(req.params.cid);

        const arrprod = cart.products.filter(prod => prod._id.toString() === req.params.pid);
        
        const newQuantity = req.body.quantity

        if(!newQuantity){
            return res.status(500).send({status: "error", message : "Quantity no existe en el body del request"});
        } else {
            const updatedCart = controller.updateQuantity(cart._id, arrprod[0]._id, newQuantity)
            return res.status(200).send({status: "success", message : "quantity updated successfully"});
        }

    } catch (error) {
        return res.status(500).send({status: "error", message : error.message});
    }
};

export const deleteProdsInCart = async(req, res) => {
    try {
        const cart = await controller.getById(req.params.cid);

        const updatedCart = await controller.deleteProds(cart._id)

        return res.send(updatedCart);
    } catch (error) {
        return res.status(500).send({status: "error", message : error.message});
    }
};

export const generatePurchase = async(req, res) => {
    try {
        const cart = await controller.getById(req.params.cid);
        const user = req.session.user
        const productsPurchased = [];
        const productsRetained = [];
        let totalPurchasePrice = 0;
        
        for (let i = 0; i < cart.products.length; i++){
            const productInDB = await prodController.getById(cart.products[i]._id)
            if(cart.products[i].quantity<=productInDB.stock){
                //actualizar stock
                const newStock = productInDB.stock - cart.products[i].quantity
                await prodController.updateStock(cart.products[i]._id, newStock)
                //agregar el producto comprado
                productsPurchased.push(cart.products[i]._id.toString())
                //sumar el amount
                const totalPriceProduct = productInDB.price * cart.products[i].quantity
                totalPurchasePrice = totalPurchasePrice + totalPriceProduct
            } else {
                productsRetained.push(cart.products[i]._id.toString());
                console.log(`El producto con el id ${cart.products[i]._id} no se pudo agregar a la compra`)
            }
        }
        //eliminar el producto del carrito
        productsPurchased.forEach((prodId) => {
            for (let i = 0; i < cart.products.length; i++){
                let index = cart.products.indexOf(prodId)
                cart.products.splice(index, 1);
            }
        })

        //actualizar carrito
        await cart.save()

        /*
        //agregar product si quantity<stock
        cart.products.forEach(async(prod) => {
            const productInDB = await prodController.getById(prod._id)
            if(prod.quantity<=productInDB.stock){
                //actualizar stock
                const newStock = productInDB.stock - prod.quantity
                await prodController.updateStock(prod._id, newStock)
                //agregar el producto comprado
                productsPurchased.push(prod._id.toString())
                //eliminar el producto del carrito
                let index = cart.products.indexOf(prod)
                cart.products.splice(index, 1);
            } else {
                productsRetained.push(prod._id.toString());
                console.log(`El producto con el id ${prod.id} no se pudo agregar a la compra`)
            }
            //actaulizar carrito
            //await cart.save()
        });
        */
        
        // si hay productos sin stock sufiente
        if(productsRetained.length>0){
            return res.status(500).send({status: "error", message : "La compra no se pudo completar debido a que hay productos que no tienen stock suficiente", products:productsRetained});
        }
        
        //generar ticket
        const ticket = {
            amount:totalPurchasePrice,
            purchaser:user.email,
            productsPurchased:productsPurchased
        }

        const newTicket = await ticketController.create(ticket);

        return res.status(200).send({status: "success", message : "Se ha generado el ticket exitosamente", ticket: newTicket});

    } catch (error) {
        return res.status(500).send({status: "error", message : "No se pudo generar el ticket de compra, error:" + error.message});
    }
}

/*
export const createCart = async(req, res) => {
    try {
        const newcart = new cartModel
        const cart = await newcart.save();
        return res.send(cart);
    } catch (error) {
        return res.status(500).send({status: "error", message : error.message});
    }
};

export const getCartById = async(req, res) => {
    try {
        const cart = await cartModel.findById(req.params.id)
        const newCart = await cart.populate('products._id');
        return res.send(newCart);
    } catch (error) {
        return res.status(500).send({status: "error", message : error.message});
    }
}

export const addProdToCart = async(req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid);

        const arrprod = cart.products.filter(prod => prod._id.toString() === req.params.pid);
        
        if(!arrprod[0]){

            cart.products.push({_id : new mongo.ObjectId(req.params.pid) , quantity : 1});
            const newCart = await cart.save();
            return res.send(newCart);

        } else {
        
            const newQuantity = arrprod[0].quantity + 1
            const updatedCart = await cartModel.updateOne(
                {
                    "_id" : cart._id,
                    "products": {"$elemMatch": { "_id": arrprod[0]._id }}
                },
                {
                    "$set": { "products.$.quantity": newQuantity}
                }
            );

            return res.send(updatedCart);
        }

    } catch (error) {
        return res.status(500).send({status: "error", message : error.message});
    }
}

export const deleteProdinCart = async(req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid);
        
        cart.products.forEach((prod) => {
            if(prod._id.toString() === req.params.pid){
                let index = cart.products.indexOf(prod)
                cart.products.splice(index, 1);
            }
        });

        const newCart = await cart.save();
        return res.send(newCart);

    } catch (error) {
        return res.status(500).send({status: "error", message : error.message});
    }
};

export const updateProdQuantity = async(req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid);

        const arrprod = cart.products.filter(prod => prod._id.toString() === req.params.pid);
        
        const newQuantity = req.body.quantity

        if(!newQuantity){
            return res.status(500).send({status: "error", message : "Quantity no existe en el body rel request"});
        } else {
            const updatedCart = await cartModel.updateOne(
                {
                    "_id" : cart._id,
                    "products": {"$elemMatch": { "_id": arrprod[0]._id }}
                },
                {
                    "$set": { "products.$.quantity": newQuantity}
                }
                );

            return res.send(updatedCart);
        }

    } catch (error) {
        return res.status(500).send({status: "error", message : error.message});
    }
};

export const deleteProdsInCart = async(req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid);

        const updatedCart = await cartModel.updateOne({_id : cart._id}, {products : []});

        return res.send(updatedCart);
    } catch (error) {
        return res.status(500).send({status: "error", message : error.message});
    }
};

*/