/**
 * 
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */

import debug from 'debug';
import { Request, Response } from 'express';
// import User from '~/models/users.model';
// import Store from '~/models/store.model';
import { sendError } from '~/helpers/jwt.helper';
import Product from '~/models/product.model';
import User from '~/models/users.model';
import WishList from '~/models/wishlist.model';
const log = debug('app:controllers:wishlist');

const getWishlist = async (req: Request, res: Response) => {
    const { user } = req;
    const { wishlist_group_id } = req.body;
    try {
        const user_id = user.id;
        const wishlist_product = await WishList.find({ user_id, wishlist_group_id });
        if (!wishlist_product) {
            return res.json({ success: true, wishlist: [] });
        }
        let wishlist = [];
        for (let i = 0; i < wishlist_product.length; i++) {
            const product = await Product.findById(wishlist_product[i].product_id);
            if (!product) {
                return sendError(req, res, 400, 'Product does not exist.');
            }
            const username = await User.findById(product.user_id);
            wishlist.push({
                id: wishlist_product[i]._id,
                creator: username,
                image: product.image,
                product_name: product.product_name,
                product_description: product.description,
                wishlist_group_id,
            });
        }
        const totalCount = await WishList.count(user_id);
        return res.json({ success: true, wishlist, wishlistCount: totalCount });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid wishlist data');
    }
}

const getAllWishlist = async (req: Request, res: Response) => {
    const { user_id } = req.body;
    try {
        const wishlist_product = await WishList.find({ user_id });
        if (!wishlist_product) {
            return res.json({ success: true, wishlist: [] });
        }
        let wishlist = [];
        for (let i = 0; i < wishlist_product.length; i++) {
            const product = await Product.findById(wishlist_product[i].product_id);
            if (!product) {
                return sendError(req, res, 400, 'Product does not exist.');
            }
            wishlist.push(product._id);
        }
        return res.json({ success: true, wishlist });

    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid wishlist data');
    }
}

const addWishlist = async (req: Request, res: Response) => {
    const { user } = req;
    const { product_id, wishlist_group_id } = req.body;
    try {
        const user_id = user.id;
        await WishList.create({ user_id, wishlist_group_id, product_id });
        const wishlistCount = await WishList.count({ user_id });
        return res.json({ success: true, wishlistCount });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid wishlist data');
    }
}

const deleteWishlist = async (req: Request, res: Response) => {
    const { wishlist_id, wishlist_group_id } = req.body;
    const { user } = req;
    try {
        const user_id = user.id;
        const wishlist = await WishList.findById(wishlist_id);
        if (!wishlist) {
            return sendError(req, res, 400, 'Wishlist does not exist.');
        } else {
            await wishlist.deleteOne();
            const currentWishlists = await WishList.find({ user_id, wishlist_group_id });
            const totalCount = await WishList.count(user_id);
            return res.json({ success: true, wishlist: currentWishlists, wishlistCount: totalCount });
        }
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid wishlist data');
    }
}

const deleteWishlistByProduct = async (req: Request, res: Response) => {
    const { product_id } = req.body;
    const { user } = req;
    try {
        const user_id = user.id;
        const wishlists = await WishList.find({ product_id });
        if (!wishlists) {
            return sendError(req, res, 400, 'Wishlist does not exist.');
        } else {
            for (let i = 0; i < wishlists.length; i++) {
                await wishlists[i].deleteOne();
            }
            const totalCount = await WishList.count(user_id);
            return res.json({ success: true, wishlistCount: totalCount });
        }
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid wishlist data');
    }
}

export default { getWishlist, getAllWishlist, addWishlist, deleteWishlist, deleteWishlistByProduct }