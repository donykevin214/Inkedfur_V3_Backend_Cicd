/**
 *
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */

import { Request, Response, NextFunction } from 'express';
import { sendError, signToken, getPublic } from '~/helpers/jwt.helper';
import debug from 'debug';
import User from '~/models/users.model';
import WishList from '~/models/wishlist.model';
import Product from '~/models/product.model';
import VerifyCode from '~/models/verifycode.model';
import env from '~/lib/nunjucks';
import mailGun from '~/lib/mailgun';
import config from '~/config';
import crypto from 'node:crypto';
import { Roles, VERIFY_CODE_TYPES } from '~/helpers/constants.helper';
import Store from '~/models/store.model';
import Cart from '~/models/cart.model';
const log = debug('app:controllers:auth');

const register = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body);
  const { email, password, username, birthday, roles, firstname, lastname } = req.body;
  try {
    const existUser = await User.findOne({
      email: email.toLowerCase(),
      roles,
    });

    if (existUser) {
      return sendError(req, res, 400, 'User already exists.');
    }

    const code = crypto.randomInt(config.security.code.min, config.security.code.max);
    const template = env.render('verify-email.view.njk', {
      title: 'Email verification',
      code,
      link: `${config.publicUrl}/api/v1/auth/verifyCode?email=${encodeURIComponent(
        email.toLowerCase(),
      )}&code=${code}`,
    });

    const ipAddress = req.ip;

    const customer = await User.findOne({
      email: email.toLowerCase(),
      roles: Roles.CUSTOMER,
    });
    let user;
    if (customer && (roles === Roles.CREATOR || roles === Roles.ADMIN)) {
      console.log('dddddd');
      customer.birthday = birthday;
      customer.roles = roles;
      customer.firstname = firstname;
      customer.lastname = lastname;
      customer.ip_address = ipAddress;
      await customer.save();
    } else {
      // const userbyip = await User.find({ip_address: ipAddress});
      // if (userbyip) {
      //   return sendError(req, res, 400, 'Your IP Address already exists.');
      // }
      user = await User.create({
        email: email.toLowerCase(),
        password,
        username,
        birthday,
        roles,
        ip_address: ipAddress,
      });
    }

    await VerifyCode.create({
      email: email.toLowerCase(),
      code,
      type: VERIFY_CODE_TYPES.VALIDATE_EMAIL,
    });
    // await mailGun(email.toLowerCase(), 'Activate your account', template);

    if (roles === Roles.CREATOR) {
      return next();
    } else {
      return res.json({ success: true, user });
    }
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const createStore = async (req: Request, res: Response) => {
  const { email, store_name, description, status, content_category } = req.body;
  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
      roles: Roles.CREATOR,
    });

    if (!user) {
      return sendError(req, res, 400, 'User does not exist');
    }

    const existStore = await Store.findOne({
      user_id: user.id,
    });

    if (existStore) {
      return sendError(req, res, 400, 'Your store already exists.');
    }

    await Store.create({
      user_id: user.id,
      name: store_name,
      description,
      status,
      contentCategory: content_category,
    });
    return res.json({ success: true, user: user && getPublic(user, 'creator') });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const addGalleryLink = async (req: Request, res: Response) => {
  const { email, roles, galleryLinks } = req.body;
  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
      roles: roles,
    });
    if (!user) {
      return sendError(req, res, 400, 'User does not exist.');
    }
    user.galleryLinks = galleryLinks;
    await user.save();

    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user_exist = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user_exist) {
      return res.status(400).json({ success: false, message: 'User does not exist' });
    }

    const non_activated_user = await User.findOne({
      email: email.toLowerCase(),
      active: false,
    });

    if (non_activated_user) {
      return res.status(400).json({ success: false, message: 'Please verify your email' });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      active: true,
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User does not exist' });
    }
    if (!(await user.correctPassword(password, user.password))) {
      return res.status(400).json({ success: false, message: 'Email/Password does not match' });
    }
    log(user.id);
    const user_id = user.id;
    const wishlist_product = await WishList.find({ user_id });
    if (!wishlist_product) {
      return res.json({ success: true, wishlist: [] });
    }
    const wishlist = [];
    for (let i = 0; i < wishlist_product.length; i++) {
      const product = await Product.findById(wishlist_product[i].product_id);
      if (!product) {
        return sendError(req, res, 400, 'Product does not exist.');
      }
      wishlist.push(product._id);
    }
    const cartListCount = await Cart.count({ user_id });
    const token = user && (await signToken(user.id));
    if (user.roles === Roles.CUSTOMER) {
      return res.status(200).json({
        success: true,
        user: user && getPublic(user, 'customer'),
        wishlistProductIds: wishlist,
        cartListCount,
        token,
      });
    } else if (user.roles === Roles.CREATOR) {
      return res.status(200).json({
        success: true,
        user: user && getPublic(user, 'creator'),
        wishlistProductIds: wishlist,
        cartListCount,
        token,
      });
    }
    return res.status(200).json({
      success: true,
      user: user && getPublic(user, 'admin'),
      wishlistProductIds: wishlist,
      cartListCount,
      token,
    });
  } catch (err) {
    log('Error while login the user', err);
    return sendError(req, res, 400, 'Invalid user data');
  }
};

/**
 * @param {'body' | 'query'} placement
 */
const activateAccount = function activateAccount(placement = 'body') {
  return async (req: Request, res: Response) => {
    const { email } = req[placement as keyof Request];
    try {
      const user = await User.updateOne(
        { email: email.toLowerCase() },
        { $set: { active: true } },
        { upsert: true },
      );
      return res.status(200).format({
        json() {
          return res.send({ success: true, user });
        },
        html() {
          const template = env.render('message.view.njk', {
            title: 'Email verified',
            className: 'success',
            subtitle: 'Success!',
            message: 'Your email address has been verified.',
          });
          return res.send(template);
        },
      });
    } catch (err) {
      log('error', 'err:', err);
      return res.status(200).format({
        json() {
          return sendError(req, res, 400, 'Invalid verification code');
        },
        html() {
          const template = env.render('message.view.njk', {
            title: 'Email verification failed',
            className: 'error',
            subtitle: 'Error!',
            message: 'Invalid verification code',
          });
          return res.send(template);
        },
      });
    }
  };
};

const resendVerificationCode = async (req: Request, res: Response) => {
  const { email, type } = req.body;

  const options = (() => {
    switch (type) {
      case 'forgot-password':
        return {
          template: 'reset-password.view.njk',
          title: 'Reset Password Code',
          type: VERIFY_CODE_TYPES.FORGOT_PASSWORD,
        };
      default:
        return {
          template: 'verify-email.view.njk',
          title: 'Activate your account',
          type: VERIFY_CODE_TYPES.VALIDATE_EMAIL,
        };
    }
  })();

  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
      active: type === 'forgot-password',
    });

    if (!user) {
      log('[%s:resendCode] user was not found', type, email.toLowerCase());
      return res.json({
        success: true,
        message: 'Verification code sent if your account was found',
      });
    }

    let verifyCode = await VerifyCode.findOne({
      email: email.toLowerCase(),
      type: options.type,
    });

    const code = crypto.randomInt(config.security.code.min, config.security.code.max);

    if (verifyCode) {
      if (Date.now() - verifyCode.createdAt.getTime() > config.security.code.ttl) {
        await verifyCode.deleteOne();
        verifyCode = await VerifyCode.create({
          email: email.toLowerCase(),
          type: options.type,
          code,
        });
      }

      if (verifyCode.nb_resends && verifyCode.nb_resends >= config.security.code.maxSends)
        return res.status(400).json({ success: false, message: 'Max resends reached' });

      if (
        verifyCode.lastResendAt &&
        Date.now() - verifyCode.lastResendAt.getTime() <= config.security.code.delay
      )
        return res
          .status(400)
          .json({ success: false, message: 'Too quick, please wait and try again' });

      verifyCode.lastResendAt = new Date();
      verifyCode.nb_resends && (verifyCode.nb_resends += 1);

      await verifyCode.save();
    } else {
      verifyCode = await VerifyCode.create({
        email: email.toLowerCase(),
        type: options.type,
        code,
      });
    }

    const template = env.render(options.template, {
      title: options.title,
      code: verifyCode.code,
    });
    // await mailGun(email.toLowerCase(), options.title, template);

    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user email');
  }
};

const checkCode = function checkCode(
  type = VERIFY_CODE_TYPES.VALIDATE_EMAIL,
  isCheckUserActive = true,
  /**
   * @type {'body' | 'query'}
   */
  placement = 'body',
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { email, code } = req[placement as keyof Request];
    const message = 'Invalid code or email address';

    try {
      const filter = isCheckUserActive
        ? { email: email.toLowerCase(), active: true }
        : { email: email.toLowerCase() };
      const user = await User.findOne(filter);

      if (!user) {
        log('trying to validate invalid user account', email);
        return res.status(400).format({
          json() {
            return sendError(req, res, 400, message);
          },
          html() {
            const template = env.render('message.view.njk', {
              title: 'Email verification failed',
              className: 'error',
              subtitle: 'Error!',
              message,
            });
            return res.send(template);
          },
        });
      }

      const verifyCode = await VerifyCode.findOne({
        email: email.toLowerCase(),
        type,
      });

      if (!verifyCode) {
        log('trying to validate a user account with invalid code', email, code);
        return res.status(400).format({
          json() {
            return sendError(req, res, 400, message);
          },
          html() {
            const template = env.render('message.view.njk', {
              title: 'Email verification failed',
              className: 'error',
              subtitle: 'Error!',
              message,
            });
            return res.send(template);
          },
        });
      }

      if (Date.now() - verifyCode.createdAt.getTime() > config.security.code.ttl) {
        await verifyCode.deleteOne();
        return res.status(400).format({
          json() {
            return sendError(req, res, 400, 'Code expired');
          },
          html() {
            const template = env.render('message.view.njk', {
              title: 'Email verification failed',
              className: 'error',
              subtitle: 'Error!',
              message: 'Code expired',
            });
            return res.send(template);
          },
        });
      }

      if (verifyCode.nb_tries && verifyCode.nb_tries >= config.security.code.maxTries)
        return res.status(400).format({
          json() {
            return sendError(req, res, 400, 'Max tries reached');
          },
          html() {
            const template = env.render('message.view.njk', {
              title: 'Email verification failed',
              className: 'error',
              subtitle: 'Error!',
              message: 'Max tries reached',
            });
            return res.send(template);
          },
        });

      if (
        verifyCode.lastTryAt &&
        Date.now() - verifyCode.lastTryAt.getTime() <= config.security.code.tryDelay
      )
        return res.status(400).format({
          json() {
            return sendError(req, res, 400, 'Too quick, please wait and try again');
          },
          html() {
            const template = env.render('message.view.njk', {
              title: 'Email verification failed',
              className: 'error',
              subtitle: 'Error!',
              message: 'Too quick, please wait and try again',
            });
            return res.send(template);
          },
        });

      if (verifyCode.code !== code) {
        verifyCode.lastTryAt = new Date();
        verifyCode.nb_tries && (verifyCode.nb_tries += 1);

        await verifyCode.save();
        return res.status(400).format({
          json() {
            return sendError(req, res, 400, message);
          },
          html() {
            const template = env.render('message.view.njk', {
              title: 'Email verification failed',
              className: 'error',
              subtitle: 'Error!',
              message,
            });
            return res.send(template);
          },
        });
      }

      await verifyCode.deleteOne();
    } catch (err) {
      log('error', 'err:', err);
      return sendError(req, res, 400, 'Invalid user data: ');
    }

    return next();
  };
};

const changePassword = async (req: Request, res: Response) => {
  const { user_id, old_password, new_password } = req.body;

  try {
    const user = await User.findById(user_id);

    if (!user) {
      return sendError(req, res, 401, 'User does not exist');
    }

    if (!(await user.correctPassword(old_password, user.password))) {
      return sendError(req, res, 401, 'Please make sure your old password is correct');
    }

    // Update the current user password
    user.password = new_password;
    await user.save();

    const template = env.render('change-password-success.view.njk', {
      title: 'Password changed',
    });

    // await mailGun(user.email, 'Password changed Successfully', template);

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    log('err:', err);
    return sendError(req, res, 400, 'Invalid user data: ');
  }
};

const updatePassword = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
    });
    user && (user.password = password);
    user && (await user.save());

    const template = env.render('reset-password-success.view.njk', {
      title: 'Password Reset Successfully',
    });

    // await mailGun(email.toLowerCase(), 'Password Reset Successfully', template);

    return res.status(200).json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data: ');
  }
};

const logout = async (req: Request, res: Response) => {
  const { user } = req;
  try {
    // log(user);
  } catch (e) {
    return sendError(req, res, 400, 'Invalid EOS token:');
  }

  return res.status(200).json({ success: true });
};

export default {
  register,
  login,
  logout,
  checkCode,
  activateAccount,
  resendVerificationCode,
  updatePassword,
  changePassword,
  createStore,
  addGalleryLink,
};
