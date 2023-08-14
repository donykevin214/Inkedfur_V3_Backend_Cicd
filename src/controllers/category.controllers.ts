/**
 *
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */

import { NextFunction, Request, Response } from 'express';
import { sendError } from '~/helpers/jwt.helper';
import debug from 'debug';
import Category from '~/models/category.model';

const log = debug('app:controllers:category');

const getAllCategories = async (req: Request, res: Response) => {
  const { children } = req.body;
  console.log(children);
  try {
    const categories: any = [];
    let category;
    if (children == 'all') {
      category = await Category.find();
    } else {
      category = await Category.find({ children });
    }

    if (!category) {
      return sendError(req, res, 400, 'Empty Category');
    }
    for (let i = 0; i < category.length; i++) {
      const sub_count = await Category.count({ children: category[i]._id });
      categories.push({
        _id: category[i]._id,
        category_name: category[i].category_name,
        nsfw: category[i].nsfw,
        subCount: sub_count,
        children: category[i].children,
      });
    }

    return res.json({ success: true, categories });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid category data');
  }
};

const addCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { category_name, nsfw, children, prints } = req.body;
  try {
    await Category.create({ category_name, nsfw, children, prints });
    return next();
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid category data');
  }
};

const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { category_id, category_name, nsfw } = req.body;
  try {
    const category = await Category.findById(category_id);
    if (!category) {
      return sendError(req, res, 400, 'Category does not exist');
    }
    category.category_name = category_name;
    category.nsfw = nsfw;
    await category.save();
    return next();
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid category data');
  }
};

const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { category_id } = req.body;
  try {
    const category = await Category.findById(category_id);
    if (!category) {
      return sendError(req, res, 400, 'Category does not exist');
    }
    await category.deleteOne();
    return next();
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid category data');
  }
};
export default { getAllCategories, addCategory, updateCategory, deleteCategory };
