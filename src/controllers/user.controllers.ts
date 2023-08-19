/**
 *
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */

import { Request, Response } from 'express';
import { sendError, getPublic } from '~/helpers/jwt.helper';
import debug from 'debug';
import User from '~/models/users.model';
import { PRODUCT_STATUS, Roles, USER_STATUS } from '~/helpers/constants.helper';
import uploadFile from '~/helpers/uploadfile.helper';
import Submission from '~/models/submission.model';
import Product from '~/models/product.model';
import Statistic from '~/models/statistic.model';
import Store from '~/models/store.model';

const log = debug('app:controllers:user');

const setUserStatus = async (req: Request, res: Response) => {
  const { user_id, status } = req.body;
  try {
    const user = await User.findById(user_id);
    if (!user) {
      return sendError(req, res, 400, 'User does not exist.');
    }
    user.status = status;
    await user.save();
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const setUserStatusByIpAddress = async (req: Request, res: Response) => {
  const { ipAddress, status } = req.body;
  try {
    const user = await User.findOne({
      ip_address: ipAddress,
    });
    if (!user) {
      return sendError(req, res, 400, 'User does not exist.');
    }
    user.status = status;
    await user.save();
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const updateSignature = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  const files = req.files as Express.Multer.File[];
  try {
    const user = await User.findById(user_id);
    if (!user) {
      return sendError(req, res, 400, 'User does not exist.');
    }
    // user.signature = await uploadFile(files[0], user.username);
    user.signature =
      await 'https://inkedfur.us-southeast-1.linodeobjects.com/kji04241af11751-a63d-484e-8d01-d1ee8dfa2706creator-ban.png';
    user.signature_date = new Date();
    await user.save();

    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const editProfile = async (req: Request, res: Response) => {
  const { user_id, username, description, socials } = req.body;
  const files = req.files as Express.Multer.File[];
  try {
    const user = await User.findById(user_id);
    if (!user) {
      return sendError(req, res, 400, 'User does not exist.');
    }
    for (let i = 0; i < files.length; i++) {
      if (files[i].fieldname === 'profile_img') {
        user.profile_img = await uploadFile(files[i], username);
      } else if (files[i].fieldname === 'banner_img') {
        user.banner_img = await uploadFile(files[i], username);
      }
    }
    user.username = username;
    user.description = description;
    user.social = JSON.parse(socials);
    await user.save();
    return res.json({ success: true, user });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const getTopCreators = async (req: Request, res: Response) => {
  try {
    const creators = await Product.aggregate([
      {
        $match: {
          status: PRODUCT_STATUS.PUBLISHED,
        },
      },
      {
        $group: {
          _id: '$user_id',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'creator',
        },
      },
      {
        $unwind: '$creator',
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 12,
      },
    ]);

    return res.json({ success: true, creators });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const updateRole = async (req: Request, res: Response) => {
  const { user_id, role } = req.body;
  try {
    const user = await User.findById(user_id);
    if (!user) {
      return sendError(req, res, 400, 'User does not exist.');
    }
    user.roles = role;
    await user.save();
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await User.find({ roles: Roles.CUSTOMER });

    if (!customers) {
      return sendError(req, res, 400, 'Customer does not exist.');
    }

    const customerList: any = [];

    customers.map((customer) => {
      customerList.push(getPublic(customer, 'customer'));
    });
    return res.json({ success: true, customers: customerList });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const updateVisitors = async (req: Request, res: Response) => {
  const { creator_id } = req.body;
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.toLocaleDateString();
    const customer = await Statistic.findOne({
      creator_id,
      date: {
        $gte: new Date(yesterday),
        $lte: new Date(today),
      },
    });
    if (!customer) {
      const date = new Date().toLocaleDateString();
      await Statistic.create({ creator_id, visitors: 1, date });
    } else {
      customer.visitors += 1;
      await customer.save();
    }

    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const getStatistic = async (req: Request, res: Response) => {
  const { from, to } = req.body;
  const { user } = req;
  try {
    const statistic = await Statistic.aggregate([
      {
        $match: {
          creator_id: user._id,
          date: {
            $gte: new Date(from),
            $lte: new Date(to),
          },
        },
      },
      {
        $group: {
          _id: '$creator_id',
          visitors: {
            $sum: {
              $toInt: '$visitors',
            },
          },
          sales: {
            $sum: {
              $toInt: '$sales',
            },
          },
          royalty: {
            $sum: {
              $toInt: '$royalties',
            },
          },
          tips: {
            $sum: {
              $toInt: '$tips',
            },
          },
        },
      },
    ]);
    const topSellerAmount = await Statistic.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(from),
            $lte: new Date(to),
          },
        },
      },
      {
        $group: {
          _id: '$creator_id',
          salesMax: {
            $sum: {
              $toInt: '$sales',
            },
          },
        },
      },
      {
        $sort: {
          salesMax: -1,
        },
      },
      {
        $limit: 1,
      },
    ]);
    const lifeTimeStatistic = await Statistic.aggregate([
      {
        $match: {
          creator_id: user._id,
        },
      },
      {
        $group: {
          _id: '$creator_id',
          visitors: {
            $sum: {
              $toInt: '$visitors',
            },
          },
          sales: {
            $sum: {
              $toInt: '$sales',
            },
          },
          royalty: {
            $sum: {
              $toInt: '$royalties',
            },
          },
          tips: {
            $sum: {
              $toInt: '$tips',
            },
          },
        },
      },
    ]);

    return res.json({ success: true, statistic, lifeTimeStatistic, topSellerAmount });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const getCreatorByID = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  try {
    const creator = await User.findOne({
      user_id,
      roles: Roles.CREATOR,
      active: true,
      status: USER_STATUS.ACTIVATE,
    });

    if (!creator) {
      return sendError(req, res, 400, 'Customer does not exist.');
    }
    return res.json({ success: true, creator: getPublic(creator, 'creator') });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const getCreators = async (req: Request, res: Response) => {
  const { skip, index } = req.body;
  try {
    const creators = await User.find({
      roles: Roles.CREATOR,
      active: true,
      status: USER_STATUS.ACTIVATE,
    })
      .limit(skip)
      .skip((index - 1) * skip);

    if (!creators) {
      return sendError(req, res, 400, 'Customer does not exist.');
    }
    const creatorList: any = [];
    for (let i = 0; i < creators.length; i++) {
      const submissionCount = await Submission.count({ user_id: creators[i].id });
      creatorList.push({
        id: creators[i].id,
        username: creators[i].username,
        firstname: creators[i].firstname,
        lastname: creators[i].lastname,
        profile_img: creators[i].profile_img,
        banner_img: creators[i].banner_img,
        description: creators[i].description,
        social: creators[i].social,
        submissions: submissionCount,
      });
    }
    return res.json({ success: true, creators: creatorList });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const updateUserName = async (req: Request, res: Response) => {
  const { firstname, lastname } = req.body;
  const { user } = req;
  try {
    const user_id = user.id;
    const creator = await User.findById(user_id);

    if (!creator) {
      return sendError(req, res, 400, 'Creator does not exist.');
    }
    creator.firstname = firstname;
    creator.lastname = lastname;
    await creator.save();

    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const creatorSetting = async (req: Request, res: Response) => {
  const { paypal, tosHref } = req.body;
  const { user } = req;
  try {
    const user_id = user.id;
    const creator = await User.findById(user_id);

    if (!creator) {
      return sendError(req, res, 400, 'Creator does not exist.');
    }
    creator.paypal = paypal;
    creator.tos_href = tosHref;
    await creator.save();

    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  try {
    const user = await User.findById(user_id);
    if (!user) {
      return sendError(req, res, 400, 'User does not exist.');
    }
    await user.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

export default {
  getStatistic,
  setUserStatus,
  setUserStatusByIpAddress,
  editProfile,
  getCustomers,
  getCreatorByID,
  getCreators,
  getTopCreators,
  updateRole,
  updateUserName,
  updateSignature,
  creatorSetting,
  updateVisitors,
  deleteUser,
};
