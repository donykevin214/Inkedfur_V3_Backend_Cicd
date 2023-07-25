/**
 * 
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */

import debug from 'debug';
import { Request, Response } from 'express';
import { PRODUCT_STATUS } from '~/helpers/constants.helper';
import { getPublic, sendError } from '~/helpers/jwt.helper';
import Product from '~/models/product.model';
import User from '~/models/users.model';
import uploadFile from '~/helpers/uploadfile.helper';
import { USER_STATUS } from '~/helpers/constants.helper';
import Store from '~/models/store.model';
import Submission from '~/models/submission.model';
const log = debug('app:controllers:product');


const getProductByUserId = async (req: Request, res: Response) => {
    const { user_id, skip, index, status } = req.body;
    try {
        const product = await Product.find({ user_id, status }).limit(skip).skip((index - 1) * skip).sort('store_id');
        return res.json({ success: true, product });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid product data');
    }
}

const getProductByUser = async (req: Request, res: Response) => {
    const { user_id, category, skip, index } = req.body;
    try {
        let product;
        let totalCount;
        if (category[0] === "All") {
            product = await Product.find({ user_id, status: PRODUCT_STATUS.PUBLISHED }).limit(skip).skip((index - 1) * skip).sort('store_id');
            totalCount = await Product.count({ user_id, status: PRODUCT_STATUS.PUBLISHED });
        } else {
            product = await Product.find({ user_id, category: { "$in": category }, status: PRODUCT_STATUS.PUBLISHED }).limit(skip).skip((index - 1) * skip).sort('store_id');
            totalCount = await Product.count({ user_id, category: { "$in": category }, status: PRODUCT_STATUS.PUBLISHED });
        }
        return res.json({ success: true, product, totalCount });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid product data');
    }
}
const getProductsCount = async (req: Request, res: Response) => {
    try {
        const products = await Product.aggregate([
            {
                $match: {
                    status: PRODUCT_STATUS.PUBLISHED
                }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                }
            },
        ]);

        return res.json({ success: true, products });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid product data');
    }
}

const getProductsCountByUser = async (req: Request, res: Response) => {
    const { user_id } = req.body;
    try {
        const products = await Product.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [
                            '$user_id', {
                                $toObjectId: user_id
                            }
                        ]
                    },
                    status: PRODUCT_STATUS.PUBLISHED
                }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                }
            },
        ]);
        return res.json({ success: true, products });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid product data');
    }
}

const getProductById = async (req: Request, res: Response) => {
    const { id } = req.query;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.json({ success: true, product: undefined });
        }
        const user = await User.findById(product.user_id);
        const versions = await Product.find({ submission_id: product._id });
        const relatedProducts = await Product.find({ category: product.category }).limit(10);
        return res.json({ success: true, product, versions, creator: user && getPublic(user, 'creator'), relatedProducts });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid product data');
    }
}

const getProductByCategory = async (req: Request, res: Response) => {
    const { category, skip, index } = req.body;
    try {
        let product;
        let totalCount;
        if (category === "All") {
            product = await Product.find({ status: PRODUCT_STATUS.PUBLISHED }).limit(skip).skip((index - 1) * skip).sort('updateAt');
            totalCount = await Product.count({ status: PRODUCT_STATUS.PUBLISHED });
        } else {
            product = await Product.find({ category: { "$in": category }, status: PRODUCT_STATUS.PUBLISHED }).limit(skip).skip((index - 1) * skip).sort('updateAt');
            totalCount = await Product.count({ category: { "$in": category }, status: PRODUCT_STATUS.PUBLISHED });
        }
        return res.json({ success: true, product, totalCount });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid product data');
    }
}

const getProductForIndex = async (req: Request, res: Response) => {
    try {
        const prints = await Product.find({ category: 'PRINTS', status: PRODUCT_STATUS.PUBLISHED }).limit(10);
        const dakimakuras = await Product.find({ category: 'DAKIMAKURAS', status: PRODUCT_STATUS.PUBLISHED }).limit(10);
        const wallscrolls = await Product.find({ category: 'WALL_SCROLLS', status: PRODUCT_STATUS.PUBLISHED }).limit(10);
        return res.json({ success: true, prints, dakimakuras, wallscrolls });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid product data');
    }
}

const setProductProperity = async (req: Request, res: Response) => {
    const { product_id, physical_quantity, digital_quantity, physical_price, digital_price, royalty } = req.body;
    try {
        const product = await Product.findById(product_id);
        if (!product) {
            return sendError(req, res, 400, 'Product does not exist');
        }
        if (product.category === 'PRINTS') {
            return sendError(req, res, 400, 'Please change this product properties with correct method');
        }
        product.physical_quantity = physical_quantity;
        product.digital_quantity = digital_quantity;
        product.physical_price = physical_price;
        product.digital_price = digital_price;
        product.royalty = royalty;
        await product.save();
        return res.json({ success: true });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid product data');
    }
}
const setPrintsProperity = async (req: Request, res: Response) => {
    const { product_id, quantity, price, royalty, crop_size } = req.body;
    try {
        const product = await Product.findById(product_id);
        if (!product) {
            return sendError(req, res, 400, 'Product does not exist');
        }
        if (product.category !== 'PRINTS') {
            return sendError(req, res, 400, 'Please change this product properties with correct method');
        }
        const product_crop_object = product.crop_size_list.filter((crop_list) => crop_list.size === crop_size);
        const index = product.crop_size_list.findIndex(value => value === product_crop_object[0]);
        product.crop_size_list[index].quantity = quantity;
        product.crop_size_list[index].price = price;
        product.crop_size_list[index].royalty = royalty;
        await product.save();
        return res.json({ success: true });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid product data');
    }
}

function getSKUSuffix(count: number) {
    if (count === 0) {
        return '00' + (count + 1).toString();
    }
    if (count > 0 && count < 9) {
        return '00' + (count + 1).toString();
    } else if (count < 99) {
        return '0' + (count + 1).toString();
    } else {
        return (count + 1).toString;
    }

}

const uploadPortfolioImage = async (req: Request, res: Response) => {
    const { user_id } = req.body;
    const files = req.files as Express.Multer.File[];
    try {
        const store_id = await Store.findOne({ user_id });
        const user = await User.findById(user_id);
        for (let i = 0; i < files.length; i++) {
            const total_products = await Product.count({ user_id });
            const prefix = user?.username.substring(0, 4).toUpperCase();
            const suffix = getSKUSuffix(total_products);
            const sku = prefix + '-' + suffix;
            const image = await uploadFile(files[i], user?.username || '');
            await Product.create({ user_id, sku, status: PRODUCT_STATUS.DRAFTS, image, product_name: sku, store_id });
            await Submission.create({ user_id });
        }
        return res.json({ success: true });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid product data');
    }
}
const addMultiProducts = async (req: Request, res: Response) => {
    const { user_id, store_id, submission_id } = req.body;
    const files = req.files as Express.Multer.File[];
    try {
        for (let i = 0; i < files.length; i++) {
            const total_products = await Product.count({ user_id });
            const user = await User.findById(user_id);
            if (user?.status !== USER_STATUS.ACTIVATE) {
                return sendError(req, res, 400, 'Your account has not been activated yet.');
            }
            const prefix = user?.username.substring(0, 4).toUpperCase();
            const suffix = getSKUSuffix(total_products);
            const sku = prefix + '-' + suffix;
            const image = await uploadFile(files[i], user?.username || '');

            let status: string;
            if (total_products > 5) {
                status = PRODUCT_STATUS.PUBLISHED;
            } else {
                status = PRODUCT_STATUS.DRAFTS;
            }
            if (submission_id !== "undefined") {
                await Product.create({ user_id, sku, status, image, store_id, product_name: sku, submission_id });
            } else {
                const submission = await Submission.create({ user_id });
                await Product.create({ user_id, sku, status, image, store_id, product_name: sku, submission_id: submission._id });
            }

        }

        return res.json({ success: true });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid product data');
    }
}

const addProduct = async (req: Request, res: Response) => {
    const { user_id, product_name, category, description, submission_id } = req.body;
    const files = req.files as Express.Multer.File[];
    try {
        const total_products = await Product.count({ user_id });
        const user = await User.findById(user_id);
        if (user?.status !== USER_STATUS.ACTIVATE) {
            return sendError(req, res, 400, 'Your account has not been activated yet.');
        }
        const prefix = user?.username.substring(0, 4).toUpperCase();
        const suffix = getSKUSuffix(total_products);
        const sku = prefix + '-' + suffix;
        const image = await uploadFile(files[0], user?.username || '');
        let status: string;
        if (total_products > 5) {
            status = PRODUCT_STATUS.PUBLISHED;
        } else {
            if (category !== 'PRINTS') {
                status = PRODUCT_STATUS.PENDING_REVIEW;
            } else {
                status = PRODUCT_STATUS.DRAFTS;
            }
        }
        if (submission_id !== "undefined") {
            await Product.create({ user_id, product_name, description, category, sku, status, image: image, submission_id });
        } else {
            const submission = await Submission.create({ user_id });
            await Product.create({ user_id, product_name, description, category, sku, status, image: image, submission_id: submission._id });

        }
        return res.json({ success: true });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid product data');
    }
}

const cropProduct = async (req: Request, res: Response) => {
    const { product_id, crop_list } = req.body;
    try {
        const product = await Product.findById(product_id);

        if (!product) {
            return sendError(req, res, 400, 'Product does not exist.');
        }
        if (product.category !== 'PRINTS') {
            return sendError(req, res, 400, 'Product does not able to crop.');
        }
        let cropListData = [];
        for (let i = 0; i < crop_list.length; i++) {
            cropListData.push({
                royalty: 0,
                size: crop_list[i].name,
                value: crop_list[i].value,
                quantity: 0,
                price: 0
            })
        }
        product.crop_size_list = cropListData;
        product.status === PRODUCT_STATUS.DRAFTS ? product.status = PRODUCT_STATUS.PENDING_REVIEW : product.status = PRODUCT_STATUS.PUBLISHED;
        await product.save();
        return res.json({ success: true });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid product data');
    }
}

const approveProduct = async (req: Request, res: Response) => {
    const { product_id } = req.body;
    try {
        const product = await Product.findById(product_id);
        if (!product) {
            return sendError(req, res, 400, 'Product does not exist.');
        }
        product.status = PRODUCT_STATUS.PUBLISHED;
        await product.save();
        return res.json({ success: true });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid product data');
    }
}


const updateProductByCreator = async (req: Request, res: Response) => {
    const { user_id, product_id, product_name, category, description, file, status } = req.body;
    const files = req.files as Express.Multer.File[];
    try {
        const product = await Product.findById(product_id);
        if (!product || !product?.user_id.equals(user_id)) {
            return res.status(400).json({ success: false, message: 'Product does not exist' });
        }
        let image;
        if (file === "new") {
            image = await uploadFile(files[0], user_id || '');
        } else {
            image = file;
        }

        product.product_name = product_name;
        product.category = category;
        product.image = image;
        product.description = description;
        if (category !== 'PRINTS') {
            product.status = PRODUCT_STATUS.PENDING_REVIEW
        } else {
            if (status === PRODUCT_STATUS.PUBLISHED) {
                product.status = PRODUCT_STATUS.PENDING_REVIEW
            }
        }
        await product.save();
        return res.json({ success: true });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid product data');
    }
}

const deleteProduct = async (req: Request, res: Response) => {
    const { product_id } = req.body;
    try {
        const product = await Product.findById(product_id);

        if (!product) {
            return res.status(400).json({ success: false, message: 'Product does not exist' });
        }

        await product.deleteOne();
        return res.json({ success: true });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid product data');
    }
}

export default { getProductById, getProductForIndex, getProductsCount, getProductsCountByUser, addProduct, updateProductByCreator, deleteProduct, getProductByUserId, getProductByCategory, setProductProperity, approveProduct, cropProduct, addMultiProducts, setPrintsProperity, uploadPortfolioImage, getProductByUser }