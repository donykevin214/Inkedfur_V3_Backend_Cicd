/**
 *
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */

import { NextFunction, Request, Response } from 'express';
import { sendError } from '~/helpers/jwt.helper';
import debug from 'debug';
import Cart from '~/models/cart.model';
import Product from '~/models/product.model';
import { PRODUCT_SELL_TYPE } from '~/helpers/constants.helper';

const log = debug('app:controllers:cart');

const getCartProduct = async (req: Request, res: Response) => {
  const { user } = req;
  try {
    const user_id = user.id;
    const allProduct = await Cart.find({ user_id })
      .populate({ path: 'type_id', model: 'Type' })
      .populate({ path: 'size_id', model: 'Typesize' });

    const cartList: any = [];
    for (let index = 0; index < allProduct.length; index++) {
      const productDetail = await Product.findById(allProduct[index].product_id);

      if (!productDetail) {
        return sendError(req, res, 400, 'Product does not exist');
      }

      console.log(allProduct[index]);

      cartList.push({
        cart_id: allProduct[index]._id,
        product_id: productDetail._id,
        product_name: productDetail.product_name,
        image: productDetail.image,
        category: allProduct[index].type_id.name,
        size: allProduct[index].size_id.size,
        price: allProduct[index].size_id.price,
        quantity: allProduct[index].quantity,
        product_sell_type: allProduct[index].product_sell_type,
        tip: allProduct[index].tip,
      });

      //   const product_crop_object = productDetail.crop_size_list.filter(
      //     (crop_list) => crop_list.size === allProduct[index].crop_size,
      //   );
      //   cartList.push({
      //     cart_id: allProduct[index]._id,
      //     product_id: productDetail._id,
      //     product_name: productDetail.product_name,
      //     image: productDetail.image,
      //     category: productDetail.category,
      //     price:
      //       product_crop_object.length > 0
      //         ? product_crop_object[0].price
      //         : allProduct[index].product_sell_type === PRODUCT_SELL_TYPE.PHYSICAL
      //         ? productDetail.physical_price
      //         : productDetail.digital_price,
      //     quantity: allProduct[index].quantity,
      //     product_sell_type: allProduct[index].product_sell_type,
      //     crop_size: allProduct[index].crop_size,
      //     tip: allProduct[index].tip,
      //   });
    }
    return res.json({ success: true, cartList });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const addCartProduct = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body);
  const { product_id, quantity, product_sell_type, type_id, size_id } = req.body;
  const { user } = req;
  try {
    const user_id = user.id;
    const product = await Product.findById(product_id);
    if (!product) {
      return sendError(req, res, 400, 'Product does not exist');
    }

    await Cart.create({ user_id, product_id, quantity, product_sell_type, type_id, size_id });
    // if (product.category === 'PRINTS') {
    //     const product_crop_object = product.crop_size_list.filter((crop_list) => crop_list.size === crop_size);
    //     if (product_crop_object) {
    //         if (product_crop_object[0].quantity < quantity) {
    //             return sendError(req, res, 400, `Product quantity should be less than ${product_crop_object[0].quantity}`);
    //         }
    //     } else {
    //         return sendError(req, res, 400, `Product does not exist`);
    //     }
    //     await Cart.create({ user_id, product_id, quantity, product_sell_type, crop_size });
    // } else {
    //     if (product_sell_type === PRODUCT_SELL_TYPE.PHYSICAL) {
    //         if (product.physical_quantity < quantity) {
    //             return sendError(req, res, 400, `Product quantity should be less than ${product.physical_quantity}`);
    //         }
    //     } else {
    //         if (product.digital_quantity < quantity) {
    //             return sendError(req, res, 400, `Product quantity should be less than ${product.digital_quantity}`);
    //         }
    //     }
    //     await Cart.create({ user_id, product_id, quantity, product_sell_type });
    // }

    return next();
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid cart data:');
  }
};

const changeProductQuantity = async (req: Request, res: Response) => {
  const { cart_id, quantity, product_sell_type, crop_size } = req.body;
  try {
    const cartProduct = await Cart.findById(cart_id);

    if (!cartProduct) {
      return sendError(req, res, 400, 'Cart does not exist');
    }
    const product = await Product.findById(cartProduct.product_id);

    if (!product) {
      return sendError(req, res, 400, 'Product does not exist');
    }
    if (product.category === 'PRINTS') {
      const product_crop_object = product.crop_size_list.filter(
        (crop_list) => crop_list.size === crop_size,
      );
      if (product_crop_object) {
        if (product_crop_object[0].quantity < quantity) {
          return sendError(
            req,
            res,
            400,
            `Product quantity should be less than ${product_crop_object[0].quantity}`,
          );
        }
      } else {
        return sendError(req, res, 400, `Product does not exist`);
      }
    } else {
      if (product_sell_type === PRODUCT_SELL_TYPE.PHYSICAL) {
        if (product.physical_quantity < quantity) {
          return sendError(
            req,
            res,
            400,
            `Product quantity should be less than ${product.physical_quantity}`,
          );
        }
      } else {
        if (product.digital_quantity < quantity) {
          return sendError(
            req,
            res,
            400,
            `Product quantity should be less than ${product.digital_quantity}`,
          );
        }
      }
    }
    cartProduct.quantity = quantity;
    await cartProduct.save();
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const deleteCartProduct = async (req: Request, res: Response) => {
  const { cart_id } = req.body;
  try {
    const cartProduct = await Cart.findById(cart_id);
    if (!cartProduct) {
      return sendError(req, res, 400, 'Product does not exist');
    }
    await cartProduct.deleteOne();
    return res.json({ success: true, cart_id });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

export default { getCartProduct, addCartProduct, changeProductQuantity, deleteCartProduct };
