/**
 * 
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */

import { Request, Response } from 'express';
import { sendError, getPublic } from '~/helpers/jwt.helper';
import debug from 'debug';
import Support from '~/models/support';
import Checkout from '~/models/checkout.model';

const log = debug('app:controllers:support');

const getSupportByUser = async (req: Request, res: Response) => {
    const { user } = req;
    try {
        const user_id = user._id;
        const supportHistory = await Support.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [
                            '$user_id', {
                                $toObjectId: user_id
                            }
                        ]
                    },
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            }
        ])

        return res.json({ success: true, supportHistory });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid user data:');
    }

}

const getOrderData = async (req: Request, res: Response) => {
    const { user } = req;
    try {
        const user_id = user._id;
        const user_email = user.email;
        const supportHistory = await Checkout.find({ $or: [{ 'user_id': user_id }, { 'buyer_email': user_email }] });
        let orderId: any = []
        for (let i = 0; i < supportHistory.length; i++) {
            if (orderId.includes(supportHistory[i].transactionId)) continue;
            orderId.push(supportHistory[i].transactionId);
        }
        return res.json({ success: true, orderId });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid user data:');
    }

}

const addticket = async (req: Request, res: Response) => {
    const { name, subject, orderId, description } = req.body;
    const { user } = req;
    try {
        const user_id = user._id;
        await Support.create({ user_id, name, subject, transactionId: orderId, description });
        return res.json({ success: true });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid user data:');
    }

}

export default { getSupportByUser, getOrderData }

