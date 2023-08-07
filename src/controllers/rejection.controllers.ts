/**
 * 
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */

import { Request, Response } from 'express';
import { sendError } from '~/helpers/jwt.helper';
import debug from 'debug';
import Rejection from '~/models/rejection.model';

const log = debug('app:controllers:rejection');

const getRejection = async (req: Request, res: Response) => {
    try {
        const rejectionReasons = await Rejection.find();
        return res.json({ success: true, rejectionReasons });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid category data');
    }
}

const addRejection = async (req: Request, res: Response) => {
    const { title, description } = req.body;
    try {

        await Rejection.create({ title, description });
        const rejectionReasons = await Rejection.find();
        return res.json({ success: true, rejectionReasons });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid category data');
    }
}

const updateRejection = async (req: Request, res: Response) => {
    const { rejection_id, title, description } = req.body;
    try {
        const rejection = await Rejection.findById(rejection_id);
        if (!rejection) {
            return sendError(req, res, 400, 'Rejection reason does not exist');
        }
        rejection.title = title;
        rejection.description = description;
        await rejection.save();

        const rejectionReasons = await Rejection.find();
        return res.json({ success: true, rejectionReasons });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid category data');
    }
}

const deleteRejection = async (req: Request, res: Response) => {
    const { rejection_id } = req.body;
    try {
        const rejectionReason = await Rejection.findById(rejection_id);
        if (!rejectionReason) {
            return sendError(req, res, 400, 'Rejection reason does not exist');
        }
        await rejectionReason.deleteOne();

        const rejectionReasons = await Rejection.find();
        return res.json({ success: true, rejectionReasons });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid rejection data');
    }
}
export default { getRejection, addRejection, updateRejection, deleteRejection };