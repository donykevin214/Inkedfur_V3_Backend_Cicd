/**
 * 
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */

import debug from 'debug';
import { Request, Response } from 'express';
import { sendError } from '~/helpers/jwt.helper';
import WishListGroup from '~/models/wishlistgroup.model';
const log = debug('app:controllers:wishlistgroup');


const getWishlistGroup = async (req: Request, res: Response) => {
    const { user } = req;
    try {
        const user_id = user.id;
        const wishlistgroup = await WishListGroup.find({ user_id });
        return res.json({ success: true, wishlistgroup });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid wishlist group data');
    }
}

const addWishlistGroup = async (req: Request, res: Response) => {
    const { user } = req;
    const { wishlistGroupName, wishlistGroupDescription } = req.body;
    try {
        await WishListGroup.create({ user_id: user.id, wishlistGroupName, wishlistGroupDescription });
        const user_id = user.id;
        const wishlistgroup = await WishListGroup.find({ user_id });
        return res.json({ success: true, wishlistgroup });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid wishlist data');
    }
}

const updateWishlistGroup = async (req: Request, res: Response) => {
    const { id, wishlistGroupName, wishlistGroupDescription } = req.body;
    const { user } = req;
    try {
        const user_id = user.id;
        const wishListgroup = await WishListGroup.findById(id);
        if (!wishListgroup) {
            return sendError(req, res, 400, 'WishList does not exist.');
        }
        wishListgroup.wishlistGroupName = wishlistGroupName;
        wishListgroup.wishlistGroupDescription = wishlistGroupDescription;
        await wishListgroup.save();
        const currentWishlistGroup = await WishListGroup.find({ user_id });
        return res.json({ success: true, wishlistgroup: currentWishlistGroup });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid wishlist data');
    }
}

const deleteWishlistGroup = async (req: Request, res: Response) => {
    const { user } = req;
    const { id } = req.body;
    try {
        const user_id = user.id;
        const wishListgroup = await WishListGroup.findById(id);
        if (!wishListgroup) {
            return sendError(req, res, 400, 'WishList does not exist.');
        }
        await wishListgroup.deleteOne();
        const currentWishlistGroup = await WishListGroup.find({ user_id });
        return res.json({ success: true, wishlistgroup: currentWishlistGroup });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid wishlist data');
    }
}

export default { getWishlistGroup, addWishlistGroup, updateWishlistGroup, deleteWishlistGroup }