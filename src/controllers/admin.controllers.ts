/**
 * 
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
import { Request, Response } from 'express';
import { sendError, getPublic } from '~/helpers/jwt.helper';
import debug from 'debug';
import { Roles, USER_STATUS } from '~/helpers/constants.helper';
import User from '~/models/users.model';
import Product from '~/models/product.model';
import Store from '~/models/store.model';
import Agreement from '~/models/agreement.model';
import Checkout from '~/models/checkout.model';
import Statistic from '~/models/statistic.model';
const log = debug('app:controllers:admin');

const getCreatorApplication = async (req: Request, res: Response) => {
    const { skip, index } = req.body
    try {
        const creator = await User.find({
            roles: Roles.CREATOR,
            status: USER_STATUS.PENDING,
            active: true,
        }).limit(skip).skip((index - 1) * skip);
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
}

const getApplicationById = async (req: Request, res: Response) => {
    const { user_id } = req.body
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
}

const getCreatorsByStatus = async (req: Request, res: Response) => {
    const { skip, index, status, search } = req.body
    try {
        const regexQuery = new RegExp(search, "i");
        let creators;
        let totalCount;
        if (status == 'All') {
            creators = await User.find({
                roles: Roles.CREATOR,
                active: true,
            }).limit(skip).skip((index - 1) * skip).or([{ username: { $regex: regexQuery } }, { firstname: { $regex: regexQuery } }, { lastname: { $regex: regexQuery } }, { description: { $regex: regexQuery } }]);
            totalCount = await User.count({
                roles: Roles.CREATOR,
                active: true,
            }).or([{ username: { $regex: regexQuery } }, { firstname: { $regex: regexQuery } }, { lastname: { $regex: regexQuery } }, { description: { $regex: regexQuery } }]);;
        } else {
            creators = await User.find({
                roles: Roles.CREATOR,
                status,
                active: true,
            }).limit(skip).skip((index - 1) * skip).or([{ username: { $regex: regexQuery } }, { firstname: { $regex: regexQuery } }, { lastname: { $regex: regexQuery } }, { description: { $regex: regexQuery } }]);;
            totalCount = await User.count({
                roles: Roles.CREATOR,
                status,
                active: true,
            }).or([{ username: { $regex: regexQuery } }, { firstname: { $regex: regexQuery } }, { lastname: { $regex: regexQuery } }, { description: { $regex: regexQuery } }]);;
        }

        return res.json({ success: true, creators, totalCount });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid admin data:');
    }
}

const getCustomers = async (req: Request, res: Response) => {
    const { skip, index, search } = req.body
    try {
        const regexQuery = new RegExp(search, "i");
        const customers = await User.find({
            roles: Roles.CUSTOMER,
            active: true,
        }).limit(skip).skip((index - 1) * skip).or([{ username: { $regex: regexQuery } }, { firstname: { $regex: regexQuery } }, { lastname: { $regex: regexQuery } }, { description: { $regex: regexQuery } }]);
        const totalCount = await User.count({
            roles: Roles.CUSTOMER,
            active: true,
        }).or([{ username: { $regex: regexQuery } }, { firstname: { $regex: regexQuery } }, { lastname: { $regex: regexQuery } }, { description: { $regex: regexQuery } }]);

        return res.json({ success: true, customers, totalCount });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid admin data:');
    }
}

const getSubmission = async (req: Request, res: Response) => {
    const { skip, index, creator_id, sortType, OrderType, childType, search, status } = req.body;

    try {
        const sortOptions: any = {};
        sortOptions[sortType] = OrderType === 'asc' ? 1 : -1;
        const regexQuery = new RegExp(search, "i");
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

        const submissions = await Product.find(query).limit(skip).skip((index - 1) * skip).or([{ product_name: { $regex: regexQuery } }, { description: { $regex: regexQuery } },]).sort(sortOptions);
        const totalCount = await Product.count(query).or([{ product_name: { $regex: regexQuery } }, { description: { $regex: regexQuery } },]).sort(sortOptions);
        return res.json({ success: true, submissions, totalCount });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid admin data:');
    }
}

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
}

const addAgreement = async (req: Request, res: Response) => {
    const { name, slug, content, parent } = req.body;
    try {
        await Agreement.create({ name, slug, content, parent });
        return res.json({ success: true });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid admin data:');
    }
}

const getAgreement = async (req: Request, res: Response) => {
    const { parent } = req.body;
    try {
        let agreements;
        if (parent === 'All') {
            agreements = await Agreement.aggregate([
                {
                    $group: {
                        _id: "$parent",
                        latestItem: { $max: '$createdAt' },
                        documents: { $push: '$$ROOT' }
                    }
                },
                {
                    $sort: { latestItem: -1 }
                }
            ])
        } else {
            agreements = await Agreement.find({ parent });
        }
        return res.json({ success: true, agreements });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid admin data:');
    }
}

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
                                    '$options': 'i'
                                }
                            },
                            {
                                buyer_email: {
                                    $regex: searchText,
                                    '$options': 'i'
                                }
                            },
                            {
                                buyer_username: {
                                    $regex: searchText,
                                    '$options': 'i'
                                }
                            },
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'product_id',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $unwind: "$products"
                },
                {
                    $group: {
                        _id: '$transactionId',
                        data: { $push: "$$ROOT" }
                    },
                },
            ]).limit(skip).skip((index - 1) * skip);
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
                                    '$options': 'i'
                                }
                            },
                            {
                                buyer_email: {
                                    $regex: searchText,
                                    '$options': 'i'
                                }
                            },
                            {
                                buyer_username: {
                                    $regex: searchText,
                                    '$options': 'i'
                                }
                            },
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'product_id',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $unwind: "$products"
                },
                {
                    $group: {
                        _id: '$transactionId',
                        data: { $push: "$$ROOT" }
                    },
                },
            ]).limit(skip).skip((index - 1) * skip);
            totalCount = await Checkout.count({ checkout_status: status });
        }
        return res.json({ success: true, orders: histories, totalCount });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid checkout data');
    }
}

const getTotalStatistic = async (req: Request, res: Response) => {
    const { month, year } = req.body;
    try {
        const current = new Date();
        const fromDate = new Date(year, month, 1)
        let toDate;
        if (year === current.getFullYear() && month === current.getMonth()) {
            toDate = new Date();
        } else {
            const maxDate = new Date(year, Number(month) + 1, 0);
            toDate = new Date(year, month, maxDate.getDate())
        }
        const user_statistic = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: fromDate, $lte: toDate }
                }
            },
            {
                $group: {
                    _id: { "year_month_day": { $substrCP: ["$createdAt", 0, 10] } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year_month_day": 1 }
            },
            {
                $project: {
                    _id: 0,
                    count: 1,
                    month_year: {
                        $substrCP: ["$_id.year_month_day", 8, 2]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    data: { $push: { day: "$month_year", count: "$count" } }
                }
            },
        ])
        const visitor_statistic = await Statistic.aggregate([
            {
                $match: {
                    createdAt: { $gte: fromDate, $lte: toDate }
                }
            },
            {
                $group: {
                    _id: { "year_month_day": { $substrCP: ["$createdAt", 0, 10] } },
                    count: {
                        $sum: {
                            "$toInt": "$visitors"
                        }
                    }
                }
            },
            {
                $sort: { "_id.year_month_day": 1 }
            },
            {
                $project: {
                    _id: 0,
                    count: 1,
                    month_year: {
                        $substrCP: ["$_id.year_month_day", 8, 2]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    data: { $push: { day: "$month_year", count: "$count" } }
                }
            },
        ])
        return res.json({ success: true, user_statistic, visitor_statistic });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid admin data:');
    }
}

export default { getAllCreators, getCreatorApplication, getApplicationById, getCreatorsByStatus, getCustomers, getSubmission, getAgreement, addAgreement, getAllOrder, getTotalStatistic }
