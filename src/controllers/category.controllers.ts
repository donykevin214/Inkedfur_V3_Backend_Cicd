/**
 * 
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */

import { Request, Response } from 'express';
import { sendError } from '~/helpers/jwt.helper';
import debug from 'debug';
import Category from '~/models/category.model';

const log = debug('app:controllers:category');

const getAllCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.find();
        return res.json({success: true, categories});
    }  catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid category data');
    }
}

const addCategory = async (req: Request, res: Response) => {
    const {category_name, parent} = req.body;
    try {
        const category = await Category.findOne({category_name, parent});
        if(category){
            return sendError(req, res, 400, 'Already exist same category');    
        }
        await Category.create({category_name, parent});
        return res.json({success: true});
    }  catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid category data');
    }
}

const updateCategory = async (req: Request, res: Response) => {
    const {category_id, category_name} = req.body;
    try {
        const category = await Category.findById(category_id);
        if(!category){
            return sendError(req, res, 400, 'Category does not exist');    
        }
        category.category_name = category_name;
        await category.save();
        return res.json({success: true});
    }  catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid category data');
    }
}

const deleteCategory = async (req: Request, res: Response) => {
    const { category_id } = req.body;
    try {
        const category = await Category.findById(category_id);
        if(!category){
            return sendError(req, res, 400, 'Category does not exist');    
        }
        await category.deleteOne();
        return res.json({success: true});
    }  catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid category data');
    }
}
export default {getAllCategories, addCategory, updateCategory, deleteCategory};