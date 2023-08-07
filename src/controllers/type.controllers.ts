/**
 * 
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */

import { Request, Response } from 'express';
import { sendError } from '~/helpers/jwt.helper';
import debug from 'debug';
import Support from '~/models/support';
import Checkout from '~/models/checkout.model';
import Type from '~/models/type.model';
import uploadFile from '~/helpers/uploadfile.helper';
import { TypeSize, addDynamicField } from '~/models/typesize.model';

const log = debug('app:controllers:support');

const getProductTypes = async (req: Request, res: Response) => {
    try {
        const types = await Type.find({});
        return res.json({ success: true, types });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid user data:');
    }

}

const addType = async (req: Request, res: Response) => {
    const { name, slug, import_type, description, weight, printable, backorderable, outsourced, selfServices, multiSubmissionOption, royalties, navigation } = req.body;
    const files = req.files as Express.Multer.File[];
    try {
        let value;
        if (/\s/g.test(name)) {
            value = name.split(' ')[1].toLowerCase();
        } else {
            value = name.toLowerCase();
        }
        const product_image = await uploadFile(files[0], name);
        await Type.create({ name, value, slug, import_type, description, weight, printable, backorderable, outsourced, selfServices, multiSubmissionOption, royalties, navigation, product_image })
        return res.json({ success: true });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid user data:');
    }

}

const addNewOption = async (req: Request, res: Response) => {
    const { type_id, optionName } = req.body;
    try {
        const type = await Type.findById(type_id);
        if (!type) {
            return sendError(req, res, 400, 'Type does not exist.');
        }
        type.size_option.push(optionName);
        await type.save();
        addDynamicField(optionName);
        return res.json({ success: true });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid user data:');
    }

}

const getSize = async (req: Request, res: Response) => {
    const { type_id } = req.body;
    try {
        const sizes = await TypeSize.find({ type_id });
        return res.json({ success: true, sizes });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid user data:');
    }
}

const addNewSize = async (req: Request, res: Response) => {
    const { type_id, sku_suffix, label, weight, price, size, royalty } = req.body;
    try {

        await TypeSize.create({ type_id, sku_suffix, label, weight, price, size, royalty })
        return res.json({ success: true });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid user data:');
    }
}

export default { getProductTypes, addType, addNewOption, getSize, addNewSize }

