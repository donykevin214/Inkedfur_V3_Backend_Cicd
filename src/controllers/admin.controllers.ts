/**
 *
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
import { Request, Response } from 'express';
import { sendError, getPublic } from '~/helpers/jwt.helper';
import debug from 'debug';
import { Roles, USER_STATUS, PRODUCT_STATUS } from '~/helpers/constants.helper';
import User from '~/models/users.model';
import Product from '~/models/product.model';
import Store from '~/models/store.model';
import Agreement from '~/models/agreement.model';
import Checkout from '~/models/checkout.model';
import Statistic from '~/models/statistic.model';
import Crop from '~/models/crop.model';
import mongoose, { model } from 'mongoose';
import uploadFile from '~/helpers/uploadfile.helper';
const log = debug('app:controllers:admin');

const getCreatorApplication = async (req: Request, res: Response) => {
  const { skip, index } = req.body;
  try {
    const creator = await User.find({
      roles: Roles.CREATOR,
      status: USER_STATUS.PENDING,
      active: true,
    })
      .limit(skip)
      .skip((index - 1) * skip);
    const totalCount = await User.count({
      roles: Roles.CREATOR,
      status: USER_STATUS.PENDING,
      active: true,
    });
    return res.json({ success: true, creator, totalCount });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const getApplicationById = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  try {
    const creator = await User.findById(user_id);
    if (!creator) {
      return sendError(req, res, 400, 'Creator does not exist.');
    }
    const store = await Store.findOne({ user_id });
    const product = await Product.find({ user_id });
    return res.json({ success: true, creator: getPublic(creator, 'creator'), store, product });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const getCreatorsByStatus = async (req: Request, res: Response) => {
  const { skip, index, status, search } = req.body;
  try {
    const regexQuery = new RegExp(search, 'i');
    let creators;
    let totalCount;
    if (status == 'All') {
      creators = await User.find({
        roles: Roles.CREATOR,
        active: true,
      })
        .limit(skip)
        .skip((index - 1) * skip)
        .or([
          { username: { $regex: regexQuery } },
          { firstname: { $regex: regexQuery } },
          { lastname: { $regex: regexQuery } },
          { description: { $regex: regexQuery } },
        ]);
      totalCount = await User.count({
        roles: Roles.CREATOR,
        active: true,
      }).or([
        { username: { $regex: regexQuery } },
        { firstname: { $regex: regexQuery } },
        { lastname: { $regex: regexQuery } },
        { description: { $regex: regexQuery } },
      ]);
    } else {
      creators = await User.find({
        roles: Roles.CREATOR,
        status,
        active: true,
      })
        .limit(skip)
        .skip((index - 1) * skip)
        .or([
          { username: { $regex: regexQuery } },
          { firstname: { $regex: regexQuery } },
          { lastname: { $regex: regexQuery } },
          { description: { $regex: regexQuery } },
        ]);
      totalCount = await User.count({
        roles: Roles.CREATOR,
        status,
        active: true,
      }).or([
        { username: { $regex: regexQuery } },
        { firstname: { $regex: regexQuery } },
        { lastname: { $regex: regexQuery } },
        { description: { $regex: regexQuery } },
      ]);
    }

    return res.json({ success: true, creators, totalCount });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const getCustomers = async (req: Request, res: Response) => {
  const { skip, index, search } = req.body;
  try {
    const regexQuery = new RegExp(search, 'i');
    const customers = await User.find({
      roles: Roles.CUSTOMER,
      active: true,
    })
      .limit(skip)
      .skip((index - 1) * skip)
      .or([
        { username: { $regex: regexQuery } },
        { firstname: { $regex: regexQuery } },
        { lastname: { $regex: regexQuery } },
        { description: { $regex: regexQuery } },
      ]);
    const totalCount = await User.count({
      roles: Roles.CUSTOMER,
      active: true,
    }).or([
      { username: { $regex: regexQuery } },
      { firstname: { $regex: regexQuery } },
      { lastname: { $regex: regexQuery } },
      { description: { $regex: regexQuery } },
    ]);

    return res.json({ success: true, customers, totalCount });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const getSubmission = async (req: Request, res: Response) => {
  const { skip, index, creator_id, sortType, OrderType, childType, search, status } = req.body;

  try {
    const sortOptions: any = {};
    sortOptions[sortType] = OrderType === 'asc' ? 1 : -1;
    const regexQuery = new RegExp(search, 'i');
    const query: any = {};
    if (creator_id !== 'All') {
      query.user_id = creator_id;
    }
    if (status !== 'All') {
      query.status = status;
    }
    if (childType === 'Parent') {
      query.submission_id = null;
    }

    const submissions = await Product.find(query)
      .populate({ path: 'user_id', model: 'User' })
      .limit(skip)
      .skip((index - 1) * skip)
      .or([{ product_name: { $regex: regexQuery } }, { description: { $regex: regexQuery } }])
      .sort(sortOptions);
    const totalCount = await Product.count(query)
      .or([{ product_name: { $regex: regexQuery } }, { description: { $regex: regexQuery } }])
      .sort(sortOptions);
    return res.json({ success: true, submissions, totalCount });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const getSubDetail = async (req: Request, res: Response) => {
  const { sub_id } = req.body;

  try {
    // const submission = await Product.findById(sub_id);
    const children = await Product.find({
      submission_id: sub_id,
    });

    await Product.findById(sub_id)
      .populate('user_id', ['username', 'profile_img'])
      .populate('category.type', 'name')
      .populate('categories', ['category_name', 'children'])
      .populate({
        path: 'cropList.crop',
        populate: {
          path: 'sizeList.size',
          model: 'Typesize',
        },
      })
      .then((product) => {
        res.json({ success: true, submission: product, children });
      });

    // return res.json({ success: true, submission });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const integratedSearch = async (req: Request, res: Response) => {
  console.log(req.body);
  const { searchText } = req.body.payload;
  console.log(searchText);

  try {
    const regexQuery = new RegExp(searchText, 'i');

    const product = await Product.find({}).or([
      { product_name: { $regex: regexQuery } },
      { description: { $regex: regexQuery } },
      { tags: { $regex: regexQuery } },
      { sku: { $regex: regexQuery } },
    ]);

    const user = await User.find({
      roles: Roles.CREATOR,
      status: USER_STATUS.ACTIVATE,
      active: true,
    }).or([
      { username: { $regex: regexQuery } },
      { description: { $regex: regexQuery } },
      { email: { $regex: regexQuery } },
    ]);

    const agreement = await Agreement.find({}).or([
      { name: { $regex: regexQuery } },
      { content: { $regex: regexQuery } },
      { slug: { $regex: regexQuery } },
    ]);

    const histories = await Checkout.aggregate([
      {
        $match: {
          $or: [
            {
              transactionId: {
                $regex: searchText,
                $options: 'i',
              },
            },
            {
              buyer_email: {
                $regex: searchText,
                $options: 'i',
              },
            },
            {
              buyer_username: {
                $regex: searchText,
                $options: 'i',
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product_id',
          foreignField: '_id',
          as: 'products',
        },
      },
      {
        $unwind: '$products',
      },
      {
        $group: {
          _id: '$transactionId',
          data: { $push: '$$ROOT' },
        },
      },
    ]);

    const application = await User.find({
      roles: Roles.CREATOR,
      status: USER_STATUS.PENDING,
      active: true,
    });

    const result = {
      user,
      product,
      agreement,
      order: histories,
      application,
    };

    return res.json({ success: true, result });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const clearAsset = async (req: Request, res: Response) => {
  const { sub_id } = req.body;

  try {
    const submission = await Product.findById(sub_id);
    if (submission) {
      submission.image = await '';
      submission.displayImage = await '';
      await submission?.save();
    }

    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const resizeImage = async (req: Request, res: Response) => {
  const { sub_id, username } = req.body;
  const files = req.files as Express.Multer.File[];
  console.log('asd');

  try {
    const image = await uploadFile(files[0], username);
    const submission = await Product.findById(sub_id);
    if (submission) {
      submission.displayImage = await image;
      await submission?.save();
    }

    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const getSubCropsByType = async (req: Request, res: Response) => {
  const { sub_id, type_id } = req.body;

  try {
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
      .then((product) => {
        const cropList: Array<object> = [];
        product?.cropList.map((item: any) => {
          if (item.crop.type_id == type_id) cropList.push(item);
        });
        res.json({ success: true, cropList });
      });

    // return res.json({ success: true, submission });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const updateSubmission = async (req: Request, res: Response) => {
  const { sub_id, sku, slug, product_name, tags, rating_key, description, categories } = req.body;

  try {
    await Product.updateOne(
      { _id: sub_id },
      {
        $set: {
          sku,
          slug,
          product_name,
          tags,
          rating_key,
          description,
          categories,
        },
      },
    );
    // product?.sku = await sku;
    // product?.slug = await slug;
    // product?.tags = await tags;
    // product?.rating_key = await rating_key;
    // product?.product_name = await product_name;
    // product?.description = await description;

    // await product?.save();

    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const createSubCropsByType = async (req: Request, res: Response) => {
  const { sub_id, type_id, checks } = req.body;
  console.log(checks);

  try {
    const product = await Product.findById(sub_id);
    await product?.category.push({ type: type_id });
    await Object.keys(checks).map((item: string) => {
      product?.cropList.push({
        crop: new mongoose.Types.ObjectId(item),
        active: checks[item],
      });
    });
    await product?.save();

    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const updateSubCropsByType = async (req: Request, res: Response) => {
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
        await product?.save();
        await res.json({ success: true });
      });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const approveSubmission = async (req: Request, res: Response) => {
  const { sub_id } = req.body;

  try {
    await Product.updateOne(
      { _id: sub_id },
      {
        $set: {
          status: 'PUBLISHED',
        },
      },
    );

    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const getCropsByType = async (req: Request, res: Response) => {
  const { type_id } = req.body;

  try {
    Crop.find({ type_id })
      .populate({
        path: 'sizeList.size',
        model: 'Typesize',
      })
      .then(async (crops) => {
        console.log(crops);
        await res.json({ success: true, creatingCrops: crops });
      });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const getAllCreators = async (req: Request, res: Response) => {
  try {
    const creators = await User.find({
      roles: Roles.CREATOR,
      active: true,
    }).select('username');
    return res.json({ success: true, creators });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const addAgreement = async (req: Request, res: Response) => {
  const { name, slug, content, parent } = req.body;
  try {
    await Agreement.create({ name, slug, content, parent });
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const getAgreement = async (req: Request, res: Response) => {
  const { parent } = req.body;
  try {
    let agreements;
    if (parent === 'All') {
      agreements = await Agreement.aggregate([
        {
          $group: {
            _id: '$parent',
            latestItem: { $max: '$createdAt' },
            documents: { $push: '$$ROOT' },
          },
        },
        {
          $sort: { latestItem: -1 },
        },
      ]);
    } else {
      agreements = await Agreement.find({ parent });
    }
    return res.json({ success: true, agreements });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

const getAllOrder = async (req: Request, res: Response) => {
  const { status, searchText, skip, index } = req.body;
  try {
    let histories: any;
    let totalCount: any;
    // const regexQuery = new RegExp(searchText, "i");
    if (status === 'All') {
      histories = await Checkout.aggregate([
        {
          $match: {
            $or: [
              {
                transactionId: {
                  $regex: searchText,
                  $options: 'i',
                },
              },
              {
                buyer_email: {
                  $regex: searchText,
                  $options: 'i',
                },
              },
              {
                buyer_username: {
                  $regex: searchText,
                  $options: 'i',
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'product_id',
            foreignField: '_id',
            as: 'products',
          },
        },
        {
          $unwind: '$products',
        },
        {
          $group: {
            _id: '$transactionId',
            data: { $push: '$$ROOT' },
          },
        },
      ])
        .limit(skip)
        .skip((index - 1) * skip);
      totalCount = await Checkout.count({});
    } else {
      histories = await Checkout.aggregate([
        {
          $match: {
            checkout_status: status,
            $or: [
              {
                transactionId: {
                  $regex: searchText,
                  $options: 'i',
                },
              },
              {
                buyer_email: {
                  $regex: searchText,
                  $options: 'i',
                },
              },
              {
                buyer_username: {
                  $regex: searchText,
                  $options: 'i',
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'product_id',
            foreignField: '_id',
            as: 'products',
          },
        },
        {
          $unwind: '$products',
        },
        {
          $group: {
            _id: '$transactionId',
            data: { $push: '$$ROOT' },
          },
        },
      ])
        .limit(skip)
        .skip((index - 1) * skip);
      totalCount = await Checkout.count({ checkout_status: status });
    }
    return res.json({ success: true, orders: histories, totalCount });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid checkout data');
  }
};

const getTotalStatistic = async (req: Request, res: Response) => {
  const { month, year } = req.body;
  try {
    const current = new Date();
    const fromDate = new Date(year, month, 1);
    let toDate;
    if (year === current.getFullYear() && month === current.getMonth()) {
      toDate = new Date();
    } else {
      const maxDate = new Date(year, Number(month) + 1, 0);
      toDate = new Date(year, month, maxDate.getDate());
    }
    const user_statistic = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: fromDate, $lte: toDate },
        },
      },
      {
        $group: {
          _id: { year_month_day: { $substrCP: ['$createdAt', 0, 10] } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year_month_day': 1 },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          month_year: {
            $substrCP: ['$_id.year_month_day', 8, 2],
          },
        },
      },
      {
        $group: {
          _id: null,
          data: { $push: { day: '$month_year', count: '$count' } },
        },
      },
    ]);
    const visitor_statistic = await Statistic.aggregate([
      {
        $match: {
          createdAt: { $gte: fromDate, $lte: toDate },
        },
      },
      {
        $group: {
          _id: { year_month_day: { $substrCP: ['$createdAt', 0, 10] } },
          count: {
            $sum: {
              $toInt: '$visitors',
            },
          },
        },
      },
      {
        $sort: { '_id.year_month_day': 1 },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          month_year: {
            $substrCP: ['$_id.year_month_day', 8, 2],
          },
        },
      },
      {
        $group: {
          _id: null,
          data: { $push: { day: '$month_year', count: '$count' } },
        },
      },
    ]);
    return res.json({ success: true, user_statistic, visitor_statistic });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid admin data:');
  }
};

export default {
  getAllCreators,
  getCreatorApplication,
  getApplicationById,
  getCreatorsByStatus,
  getCustomers,
  getSubmission,
  clearAsset,
  resizeImage,
  getSubDetail,
  getSubCropsByType,
  createSubCropsByType,
  updateSubCropsByType,
  approveSubmission,
  getCropsByType,
  getAgreement,
  addAgreement,
  getAllOrder,
  getTotalStatistic,
  updateSubmission,
  integratedSearch,
};
