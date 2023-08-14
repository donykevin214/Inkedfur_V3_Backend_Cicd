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
import Crop from '~/models/crop.model';
import uploadFile from '~/helpers/uploadfile.helper';
import { USER_STATUS } from '~/helpers/constants.helper';
import Store from '~/models/store.model';
import Submission from '~/models/submission.model';
import { TypeSize } from '~/models/typesize.model';
import { ObjectId } from 'mongoose';
import Type from '~/models/type.model';
const log = debug('app:controllers:product');

const getProductByUserId = async (req: Request, res: Response) => {
  const { user_id, skip, index, status } = req.body;
  try {
    const product = await Product.find({ user_id, status })
      .limit(skip)
      .skip((index - 1) * skip)
      .sort('store_id');
    return res.json({ success: true, product });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid product data');
  }
};

const getProductByUser = async (req: Request, res: Response) => {
  const { user_id, category, skip, index } = req.body;
  try {
    let product;
    let totalCount;
    if (category[0] === 'All') {
      product = await Product.find({ user_id, status: PRODUCT_STATUS.PUBLISHED })
        .limit(skip)
        .skip((index - 1) * skip)
        .sort('store_id');
      totalCount = await Product.count({ user_id, status: PRODUCT_STATUS.PUBLISHED });
    } else {
      product = await Product.find({
        user_id,
        category: { $in: category },
        status: PRODUCT_STATUS.PUBLISHED,
      })
        .limit(skip)
        .skip((index - 1) * skip)
        .sort('store_id');
      totalCount = await Product.count({
        user_id,
        category: { $in: category },
        status: PRODUCT_STATUS.PUBLISHED,
      });
    }
    return res.json({ success: true, product, totalCount });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid product data');
  }
};
const getProductsCount = async (req: Request, res: Response) => {
  try {
    const products = await Product.aggregate([
      {
        $match: {
          status: PRODUCT_STATUS.PUBLISHED,
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    return res.json({ success: true, products });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid product data');
  }
};

const getProductsCountByUser = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  try {
    const products = await Product.aggregate([
      {
        $match: {
          $expr: {
            $eq: [
              '$user_id',
              {
                $toObjectId: user_id,
              },
            ],
          },
          status: PRODUCT_STATUS.PUBLISHED,
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
    return res.json({ success: true, products });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid product data');
  }
};

const getProductById = async (req: Request, res: Response) => {
  const { id } = req.query;
  console.log(id);
  try {
    const product = await Product.findById(id)
      .populate('user_id', ['username', 'profile_img'])
      .populate('category.type', 'name')
      .populate('categories', ['category_name', 'children'])
      .populate({
        path: 'cropList.crop',
        populate: {
          path: 'sizeList.size',
          model: 'Typesize',
        },
      });
    if (!product) {
      return res.json({ success: true, product: undefined });
    }
    const user = await User.findById(product.user_id);
    const versions = await Product.find({
      submission_id: product._id,
      status: PRODUCT_STATUS.PUBLISHED,
    });
    const relatedProducts = await Product.find({
      category: product.category,
      status: PRODUCT_STATUS.PUBLISHED,
    }).limit(10);
    return res.json({
      success: true,
      product,
      versions,
      creator: user && getPublic(user, 'creator'),
      relatedProducts,
    });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid product data');
  }
};

const getProductByCategory = async (req: Request, res: Response) => {
  const { category, skip, index } = req.body;
  try {
    let product;
    let totalCount;
    if (category === 'All') {
      product = await Product.find({ status: PRODUCT_STATUS.PUBLISHED })
        .limit(skip)
        .skip((index - 1) * skip)
        .sort('updateAt');
      totalCount = await Product.count({ status: PRODUCT_STATUS.PUBLISHED });
    } else {
      product = await Product.find({
        category: { $in: category },
        status: PRODUCT_STATUS.PUBLISHED,
      })
        .limit(skip)
        .skip((index - 1) * skip)
        .sort('updateAt');
      totalCount = await Product.count({
        category: { $in: category },
        status: PRODUCT_STATUS.PUBLISHED,
      });
    }
    return res.json({ success: true, product, totalCount });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid product data');
  }
};

const getProductForIndex = async (req: Request, res: Response) => {
  try {
    const prints = await Product.find({
      category: 'PRINTS',
      status: PRODUCT_STATUS.PUBLISHED,
    }).limit(10);
    const dakimakuras = await Product.find({
      category: 'DAKIMAKURAS',
      status: PRODUCT_STATUS.PUBLISHED,
    }).limit(10);
    const wallscrolls = await Product.find({
      category: 'WALL_SCROLLS',
      status: PRODUCT_STATUS.PUBLISHED,
    }).limit(10);
    return res.json({ success: true, prints, dakimakuras, wallscrolls });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid product data');
  }
};

const setProductProperity = async (req: Request, res: Response) => {
  const {
    product_id,
    physical_quantity,
    digital_quantity,
    physical_price,
    digital_price,
    royalty,
  } = req.body;
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
};
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
    const product_crop_object = product.crop_size_list.filter(
      (crop_list) => crop_list.size === crop_size,
    );
    const index = product.crop_size_list.findIndex((value) => value === product_crop_object[0]);
    product.crop_size_list[index].quantity = quantity;
    product.crop_size_list[index].price = price;
    product.crop_size_list[index].royalty = royalty;
    await product.save();
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid product data');
  }
};

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
      await Product.create({
        user_id,
        sku,
        status: PRODUCT_STATUS.DRAFTS,
        image,
        product_name: sku,
        store_id,
      });
      await Submission.create({ user_id });
    }
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid product data');
  }
};
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
      if (submission_id !== 'undefined') {
        await Product.create({
          user_id,
          sku,
          status,
          image,
          store_id,
          product_name: sku,
          submission_id,
        });
      } else {
        // const submission = await Submission.create({ user_id });
        await Product.create({
          user_id,
          sku,
          status,
          image,
          store_id,
          product_name: sku,
          // submission_id: submission._id,
        });
      }
    }

    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid product data');
  }
};

// const addProductBunch = async (req: Request, res: Response) => {
//   console.log(req.body);
//   const { csvData } = req.body;
//   // const files = req.files as Express.Multer.File[];

//   try {
//     let lastProductId = await '';
//     await csvData.map(async (csv: any, index: number) => {
//       const user = await User.findOne({ email: csv.creator_email });
//       // if (!user) return sendError(req, res, 400, 'There is no user with this email.');
//       // if (user?.status !== USER_STATUS.ACTIVATE)
//       //   return sendError(req, res, 400, 'Your account has not been activated yet.');
//       const total_products = await Product.count({ user_id: user?._id });
//       const prefix = user?.username.substring(0, 4).toUpperCase();
//       const suffix = getSKUSuffix(total_products);
//       const sku = prefix + '-' + suffix;
//       const status = (await (total_products > 5))
//         ? PRODUCT_STATUS.PUBLISHED
//         : PRODUCT_STATUS.DRAFTS;
//       const image =
//         'https://inkedfur.us-southeast-1.linodeobjects.com/kji04241af11751-a63d-484e-8d01-d1ee8dfa2706creator-ban.png';

//       let product: any | null = await null;
//       if (index == 0) {
//         product = await Product.create({
//           user_id: user?._id,
//           product_name: csv.product_name,
//           description: csv.description,
//           sku,
//           status,
//           image,
//         });
//         // if (product && product._id) {
//         lastProductId = await product._id.toString();
//         // }
//       } else {
//         console.log('last => ', lastProductId);
//         product = await Product.create({
//           user_id: user?._id,
//           product_name: csv.product_name,
//           description: csv.description,
//           sku,
//           status,
//           image,
//           submission_id: lastProductId ? lastProductId : undefined,
//         });
//         // if (product && product._id) {
//         lastProductId = await product._id.toString();
//         // }
//       }

//       const type = await Type.findOne({ value: csvData.type_value });
//       // if (!type) return sendError(req, res, 400, 'There is no type with this value.');
//       const crops = await Crop.find({ type_id: type?._id });

//       if (total_products > 4) {
//         await crops.map((crop: any, index) => {
//           product.cropList.push({ crop: crop._id, active: true });
//         });
//       } else {
//         await crops.map((crop: any, index) => {
//           product.cropList.push({ crop: crop._id, active: false });
//         });
//       }

//       await product.category.push({ type: type?._id });
//       await product.save();
//     });

//     return res.json({ success: true });
//   } catch (err) {
//     log('error', 'err:', err);
//     return sendError(req, res, 400, 'Invalid product data');
//   }
// };

const addProductBunch = async (req: Request, res: Response) => {
  console.log(req.files);
  const { csvData } = req.body;

  // const files = req.files as Express.Multer.File[];
  // console.log(files);

  try {
    let lastProductId: string | undefined = undefined;
    for (let index = 0; index < csvData.length; index++) {
      const csv = csvData[index];
      const user = await User.findOne({ email: csv.creator_email });
      // if (!user) return sendError(req, res, 400, 'There is no user with this email.');
      // if (user?.status !== USER_STATUS.ACTIVATE)
      //   return sendError(req, res, 400, 'Your account has not been activated yet.');
      const total_products = await Product.count({ user_id: user?._id });
      const prefix = user?.username.substring(0, 4).toUpperCase();
      const suffix = getSKUSuffix(total_products);
      const sku = prefix + '-' + suffix;
      const status = total_products > 5 ? PRODUCT_STATUS.PUBLISHED : PRODUCT_STATUS.DRAFTS;
      const image =
        'https://inkedfur.us-southeast-1.linodeobjects.com/kji04241af11751-a63d-484e-8d01-d1ee8dfa2706creator-ban.png';

      let product: any | null = null;
      if (index == 0) {
        product = await Product.create({
          user_id: user?._id,
          product_name: csv.product_name,
          description: csv.description,
          sku,
          status,
          image,
        });
        if (product && product._id) {
          lastProductId = product._id.toString();
        }
      } else {
        console.log('last => ', lastProductId);
        product = await Product.create({
          user_id: user?._id,
          product_name: csv.product_name,
          description: csv.description,
          sku,
          status,
          image,
          submission_id: lastProductId ? lastProductId : undefined,
        });
        if (product && product._id) {
          lastProductId = product._id.toString();
        }
      }

      const type = await Type.findOne({ value: csvData[index].type_value });
      // if (!type) return sendError(req, res, 400, 'There is no type with this value.');
      const crops = await Crop.find({ type_id: type?._id });

      const cropList = crops.map((crop: any) => ({
        crop: crop._id,
        active: total_products > 4,
      }));

      product.cropList = cropList;
      product.category.push({ type: type?._id });

      await product.save();
    }

    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid product data');
  }
};

const addCSVProduct = async (req: Request, res: Response) => {
  const { product_name, description, creator_email, type_value, fileName } = req.body;
  const number = parseInt(req.body.number);

  const files = req.files as Express.Multer.File[];
  console.log(product_name);
  console.log(fileName);
  console.log(number);
  console.log(files[0]);

  try {
    const user = await User.findOne({ email: creator_email });
    const total_products = await Product.count({ user_id: user?._id });
    const prefix = user?.username.substring(0, 4).toUpperCase();
    const suffix = getSKUSuffix(total_products);
    const sku = prefix + '-' + suffix;
    const status = total_products > 5 ? PRODUCT_STATUS.PUBLISHED : PRODUCT_STATUS.DRAFTS;
    const image =
      'https://inkedfur.us-southeast-1.linodeobjects.com/kji04241af11751-a63d-484e-8d01-d1ee8dfa2706creator-ban.png';
    const displayImage =
      'https://inkedfur.us-southeast-1.linodeobjects.com/kji04241af11751-a63d-484e-8d01-d1ee8dfa2706creator-ban.png';
    // const image = await uploadFile(files[0], user?.username || '');
    // const displayImage = await uploadFile(files[0], user?.username || '');
    const product = await Product.create({
      user_id: user?._id,
      product_name,
      description,
      sku,
      status,
      image,
      displayImage,
    });
    const type = await Type.findOne({ value: type_value });
    const crops = await Crop.find({ type_id: type?._id });

    const cropList = crops.map((crop: any) => ({
      crop: crop._id,
      active: total_products > 4,
    }));

    product.cropList = cropList;
    product.category.push({ type: type?._id });
    product.importFileName = fileName;
    product.rowNumber = number;

    await product.save();

    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid product data');
  }
};

const arrangeCSVProducts = async (req: Request, res: Response) => {
  const { fileName } = req.body;
  console.log(fileName);

  try {
    const products = await Product.find({ importFileName: fileName });
    console.log(products.length);
    await products.map(async (product: any, index) => {
      if (product.rowNumber != 1) {
        const parentProduct = await Product.findOne({
          importFileName: fileName,
          rowNumber: 1,
        });
        product.submission_id = await parentProduct?._id;
        await product.save();
      }
    });
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid product data');
  }
};

const addProduct = async (req: Request, res: Response) => {
  const { user_id, product_name, category, description, submission_id } = req.body;
  const files = req.files as Express.Multer.File[];
  console.log(user_id);
  try {
    const total_products = await Product.count({ user_id, status: PRODUCT_STATUS.PUBLISHED });
    const user = await User.findById(user_id);
    if (user?.status !== USER_STATUS.ACTIVATE) {
      return sendError(req, res, 400, 'Your account has not been activated yet.');
    }
    const prefix = user?.username.substring(0, 4).toUpperCase();
    const suffix = getSKUSuffix(total_products);
    const sku = prefix + '-' + suffix;
    // const image = await uploadFile(files[0], user?.username || '');
    // const displayImage = await uploadFile(files[0], user?.username || '');
    const image =
      await 'https://inkedfur.us-southeast-1.linodeobjects.com/kji04241af11751-a63d-484e-8d01-d1ee8dfa2706creator-ban.png';
    const displayImage =
      await 'https://inkedfur.us-southeast-1.linodeobjects.com/kji04241af11751-a63d-484e-8d01-d1ee8dfa2706creator-ban.png';
    let status: string = await '';
    if (total_products > 4) {
      status = await PRODUCT_STATUS.PUBLISHED;
    } else {
      status = await PRODUCT_STATUS.DRAFTS;
    }
    if (submission_id !== 'undefined') {
      const product = await Product.create({
        user_id,
        product_name,
        description,
        sku,
        status,
        image,
        displayImage,
        submission_id,
      });
      const crops = await Crop.find({ type_id: category });

      if (total_products > 4) {
        await crops.map((crop: any, index) => {
          product.cropList.push({ crop: crop._id, active: true });
        });
      } else {
        await crops.map((crop: any, index) => {
          product.cropList.push({ crop: crop._id, active: false });
        });
      }

      await product.category.push({ type: category });
      await product.save();
    } else {
      // const submission = await Submission.create({ user_id });
      console.log('ddddddddddddddddddddd');
      const product = await Product.create({
        user_id,
        product_name,
        description,
        sku,
        status,
        image,
        displayImage,
        // submission_id: submission._id,
      });
      const crops = await Crop.find({ type_id: category });
      if (total_products > 4) {
        console.log('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
        await crops.map((crop: any, index) => {
          product.cropList.push({ crop: crop._id, active: true });
        });
      } else {
        await crops.map((crop: any, index) => {
          product.cropList.push({ crop: crop._id, active: false });
        });
      }
      await product.category.push({ type: category });
      await product.save();
    }

    // const newProduct = await Product.findById
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid product data');
  }
};

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
    const cropListData = [];
    for (let i = 0; i < crop_list.length; i++) {
      cropListData.push({
        royalty: 0,
        size: crop_list[i].name,
        value: crop_list[i].value,
        quantity: 0,
        price: 0,
      });
    }
    product.crop_size_list = cropListData;
    product.status === PRODUCT_STATUS.DRAFTS
      ? (product.status = PRODUCT_STATUS.PENDING_REVIEW)
      : (product.status = PRODUCT_STATUS.PUBLISHED);
    await product.save();
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid product data');
  }
};

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
};

const updateProductByCreator = async (req: Request, res: Response) => {
  const { user_id, product_id, product_name, category, description, file, status } = req.body;
  const files = req.files as Express.Multer.File[];
  try {
    const product = await Product.findById(product_id);
    if (!product || !product?.user_id.equals(user_id)) {
      return res.status(400).json({ success: false, message: 'Product does not exist' });
    }
    let image;
    if (file === 'new') {
      image = await uploadFile(files[0], user_id || '');
    } else {
      image = file;
    }

    product.product_name = product_name;
    product.category = category;
    product.image = image;
    product.description = description;
    if (category !== 'PRINTS') {
      product.status = PRODUCT_STATUS.PENDING_REVIEW;
    } else {
      if (status === PRODUCT_STATUS.PUBLISHED) {
        product.status = PRODUCT_STATUS.PENDING_REVIEW;
      }
    }
    await product.save();
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid product data');
  }
};

const updateTypeCrops = async (req: Request, res: Response) => {
  const { sub_id, type_id, checks } = req.body;
  console.log(checks);

  try {
    console.log(Object.keys(checks));
    Product.findById(sub_id)
      .populate('user_id', ['username', 'profile_img'])
      .populate('category.type', 'name')
      .populate({
        path: 'cropList.crop',
        populate: {
          path: 'sizeList.size',
          model: 'Typesize',
        },
      })
      .then(async (product) => {
        await product?.cropList.map((cropItem: any) => {
          Object.keys(checks).map((item: string) => {
            if (cropItem._id == item && cropItem.crop.type_id == type_id) {
              cropItem.active = checks[item];
            }
          });
        });
        product.status = await 'PENDING_REVIEW';
        await product?.save();
        await res.json({ success: true });
      });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

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
};

export default {
  getProductById,
  getProductForIndex,
  getProductsCount,
  getProductsCountByUser,
  addProduct,
  addProductBunch,
  addCSVProduct,
  arrangeCSVProducts,
  updateProductByCreator,
  updateTypeCrops,
  deleteProduct,
  getProductByUserId,
  getProductByCategory,
  setProductProperity,
  approveProduct,
  cropProduct,
  addMultiProducts,
  setPrintsProperity,
  uploadPortfolioImage,
  getProductByUser,
};
