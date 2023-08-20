/**
 *
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
import debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import Checkout from '~/models/checkout.model';
import { sendError } from '~/helpers/jwt.helper';
import Product from '~/models/product.model';
import { PRODUCT_SELL_TYPE } from '~/helpers/constants.helper';
import Shipping from '~/models/shipping.model';
import { APIContracts, APIControllers } from 'authorizenet';
import config from '~/config';
import User from '~/models/users.model';
import { CheckoutInterface } from '~/interfaces';
import Cart from '~/models/cart.model';
import Statistic from '~/models/statistic.model';
import { TypeSize } from '~/models/typesize.model';
const log = debug('app:controllers:checkout');

const getSaleHistory = async (req: Request, res: Response) => {
  const { skip, index } = req.body;
  const { user } = req;
  try {
    const seller_id = user._id;
    const histories = await Checkout.aggregate([
      {
        $match: {
          seller_id,
        },
      },
      {
        $limit: skip,
      },
      {
        $skip: (index - 1) * skip,
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $unwind: '$product',
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
    const totalCount = await Checkout.count({ seller_id });
    const history: any = [];
    for (let i = 0; i < histories.length; i++) {
      history.push({
        transactionId: histories[i].transactionId,
        product_name: histories[i].product.product_name,
        shipTo_email: histories[i].shipTo.email,
        date: histories[i].createdAt,
        order_status: histories[i].checkout_status,
        item_price: histories[i].unitPrice,
        tip: histories[i].tip,
        royalty: histories[i].royalty,
      });
    }
    return res.json({ success: true, history, totalCount });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid checkout data');
  }
};

const getPurchaseHistory = async (req: Request, res: Response) => {
  const { buyer_email, skip, index } = req.body;
  console.log(req.body);
  try {
    const histories = await Checkout.aggregate([
      {
        $match: {
          buyer_email,
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
      // {
      //     $sort: {
      //         '_id': -1
      //     }
      // },
      {
        $group: {
          _id: '$transactionId',
          data: { $push: '$$ROOT' },
        },
      },
    ])
      .limit(skip)
      .skip((index - 1) * skip);
    const totalCount = await Checkout.count({ buyer_email });

    console.log(histories);
    return res.json({ success: true, orders: histories, totalCount });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid checkout data');
  }
};

const getProductPrice = async (req: Request, res: Response) => {
  const { product_id, product_sell_type, quantity, crop_size } = req.body;
  try {
    const product = await Product.findById(product_id);
    if (!product) {
      return sendError(req, res, 400, 'Product does not exist');
    }
    let price: number;
    if (product.category === 'PRINTS') {
      const product_crop_object = product.crop_size_list.filter(
        (crop_list) => crop_list.size === crop_size,
      );
      product_crop_object ? (price = product_crop_object[0].price) : (price = 0);
    } else {
      if (product_sell_type === PRODUCT_SELL_TYPE.PHYSICAL) {
        price = product.physical_price;
      } else {
        price = product.digital_price;
      }
    }
    price = price * quantity;
    return res.json({ success: true, price });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid checkout data');
  }
};

const addCheckout = async (req: Request, res: Response) => {
  const { products, shipToInfo, shippingInfo, totalPrice, tip, subTotal } = req.body;
  const { user, transactionId } = req;

  console.log(user);
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.toLocaleDateString();

    let buyer_email: string;
    let buyer_username: string;
    if (user) {
      buyer_email = user.email;
      buyer_username = user.username;
    } else {
      buyer_email = shipToInfo.email;
      buyer_username = shipToInfo.firstName;
    }
    for (let i = 0; i < products.length; i++) {
      const product = await Product.findById(products[i].product_id);
      if (!product) {
        return sendError(req, res, 400, 'Product does not exist');
      }
      // let price: number;

      const size = await TypeSize.findOne({ size: products[i].size });
      const price = await products[i].price;
      console.log(price);
      const royalty = ((await (price * Number(size?.royalty))) * products[i].quantity) / 100;
      console.log(royalty);
      const rest_quantity = 10 - products[i].quantity;
      // if (product.category === 'PRINTS') {
      //   const product_crop_object = product.crop_size_list.filter(
      //     (crop_list) => crop_list.size === products[i].crop_size,
      //   );
      //   product_crop_object ? (price = product_crop_object[0].price) : (price = 0);
      //   royalty = (price * product_crop_object[0].royalty) / 100;
      //   rest_quantity = product_crop_object[0].quantity - products[i].quantity;
      //   //update quantity of crop in product
      //   const index = product.crop_size_list.findIndex((value) => value === product_crop_object[0]);
      //   product.crop_size_list[index].quantity = rest_quantity;
      // } else {
      //   if (products[i].product_sell_type === PRODUCT_SELL_TYPE.PHYSICAL) {
      //     price = product.physical_price;
      //     //update quantity of crop in product
      //     rest_quantity = product.physical_quantity - products[i].quantity;
      //     product.physical_quantity = rest_quantity;
      //   } else {
      //     price = product.digital_price;
      //     //update quantity of crop in product
      //     rest_quantity = product.digital_quantity - products[i].quantity;
      //     product.digital_quantity = rest_quantity;
      //   }
      //   royalty = (price * Number(product.royalty)) / 100;
      // }
      // await product.save();
      if (products[i].cart_id) {
        const cart = await Cart.findById(products[i].cart_id);
        await cart?.deleteOne();
      }
      const customer = await Statistic.findOne({
        creator_id: product.user_id,
        date: {
          $gte: new Date(yesterday),
          $lte: new Date(today),
        },
      });
      if (!customer) {
        const date = new Date().toLocaleDateString();
        await Statistic.create({
          creator_id: product.user_id,
          sales: 1,
          royalties: royalty,
          date,
          tips: products[i].tip,
        });
      } else {
        customer.sales += 1;
        customer.royalties += royalty;
        customer.tips += Number(products[i].tip);
        await customer.save();
      }
      await Checkout.create({
        transactionId,
        buyer_email,
        buyer_username,
        seller_id: product.user_id,
        product_id: product._id,
        quantity: products[i].quantity,
        unitPrice: price,
        crop_size: products[i].size,
        type: products[i].category,
        shippingInfo,
        shipTo: shipToInfo,
        totalPrice: Number(totalPrice) + Number(shippingInfo.price),
        subTotal,
        tip,
        product_sell_type: products[i].product_sell_type,
        royalty,
        royalty_status: 'UNPAID',
        checkout_status: 'PENDING',
      });
    }

    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid checkout data');
  }
};

const updateRoyaltyStatus = async (req: Request, res: Response) => {
  const { checkout_id, royalty_status } = req.body;
  try {
    const checkoutHistory = await Checkout.findById(checkout_id);
    if (!checkoutHistory) {
      return sendError(req, res, 400, 'Checkout history does not exist');
    }
    checkoutHistory.royalty_status = royalty_status;
    await checkoutHistory.save();
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid checkout data');
  }
};

const updateCheckoutStatus = async (req: Request, res: Response) => {
  const { checkout_id, checkout_status } = req.body;
  try {
    const checkoutHistory = await Checkout.findById(checkout_id);
    if (!checkoutHistory) {
      return sendError(req, res, 400, 'Checkout history does not exist');
    }
    checkoutHistory.checkout_status = checkout_status;
    await checkoutHistory.save();
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid checkout data');
  }
};

const saveShippingAddress = async (req: Request, res: Response) => {
  const {
    first_name,
    last_name,
    email,
    address1,
    address2,
    city,
    phone_number,
    country,
    state,
    postcode,
  } = req.body;
  const { user } = req;
  try {
    const user_id = user.id;
    const ship = await Shipping.findOne({ user_id });
    if (!ship) {
      await Shipping.create({
        user_id,
        first_name,
        last_name,
        email,
        address1,
        address2,
        city,
        phone_number,
        country,
        state,
        postcode,
      });
    } else {
      ship.first_name = first_name;
      ship.last_name = last_name;
      ship.email = email;
      ship.address1 = address1;
      ship.address2 = address2;
      ship.city = city;
      ship.phone_number = phone_number;
      ship.country = country;
      ship.state = state;
      ship.postcode = postcode;
      await ship.save();
    }
    const shippingAddress = await Shipping.findOne({ user_id });
    return res.json({ success: true, shippingAddress });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid checkout data');
  }
};
const getShippingAddress = async (req: Request, res: Response) => {
  const { user } = req;
  try {
    const user_id = user.id;
    const shippingAddress = await Shipping.findOne({ user_id });
    if (!shippingAddress) {
      return sendError(req, res, 400, 'Does not exist the shipping address');
    }
    return res.json({ success: true, shippingAddress });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid checkout data');
  }
};

const checkout = async (req: Request, res: Response, next: NextFunction) => {
  const {
    buyer_id,
    card,
    shippingInfo,
    billToInfo,
    shipToInfo,
    products,
    totalPrice,
  }: CheckoutInterface = req.body;
  console.log(req.body);
  try {
    const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(config.authorized.apiKey);
    merchantAuthenticationType.setTransactionKey(config.authorized.transactionKey);

    const creditCard = new APIContracts.CreditCardType();
    creditCard.setCardNumber(card.cardNumber);
    creditCard.setExpirationDate(card.expireDate);
    creditCard.setCardCode(card.cardCode);

    const paymentType = new APIContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    const shipping = new APIContracts.ExtendedAmountType();
    shipping.setAmount(shippingInfo.price);
    shipping.setName('Shipping');
    shipping.setDescription('Shipping ');

    const billTo = new APIContracts.CustomerAddressType();
    if (buyer_id) {
      const user = await User.findById(buyer_id);
      billTo.setFirstName(user?.firstname);
      billTo.setLastName(user?.lastname);
      billTo.setEmail(user?.email);
    } else {
      billTo.setFirstName(shipToInfo.firstName);
      billTo.setLastName(shipToInfo.lastName);
      billTo.setEmail(shipToInfo.email);
    }
    billTo.setAddress(billToInfo.address1);
    billTo.setCity(billToInfo.city);
    billTo.setState(billToInfo.state);
    billTo.setZip(billToInfo.zipCode);
    billTo.setCountry(billToInfo.country);

    const shipTo = new APIContracts.CustomerAddressType();
    shipTo.setFirstName(shipToInfo.firstName);
    shipTo.setLastName(shipToInfo.lastName);
    // shipTo.setEmail(shipToInfo.email);
    shipTo.setAddress(shipToInfo.address1);
    shipTo.setCity(shipToInfo.city);
    shipTo.setState(shipToInfo.state);
    shipTo.setZip(shipToInfo.zipCode);
    shipTo.setCountry(shipToInfo.country);

    const lineItemList = [];
    for (let index = 0; index < products.length; index++) {
      const product = await Product.findById(products[index].product_id);
      if (!product) {
        continue;
      }
      const lineItem = new APIContracts.LineItemType();
      lineItem.setItemId(index.toString());
      lineItem.setName(product.product_name);
      lineItem.setQuantity(products[index].quantity);
      //   let price: number;
      //   if (product?.category === 'PRINTS') {
      //     const product_crop_object = product.crop_size_list.filter(
      //       (crop_list) => crop_list.size === products[index]?.crop_size,
      //     );
      //     product_crop_object ? (price = product_crop_object[0].price) : (price = 0);
      //   } else {
      //     if (products[index].product_sell_type === PRODUCT_SELL_TYPE.PHYSICAL) {
      //       price = product.physical_price;
      //     } else {
      //       price = product.digital_price;
      //     }
      //   }
      lineItem.setUnitPrice(products[index].price.toString());
      lineItemList.push(lineItem);
    }
    const lineItems = new APIContracts.ArrayOfLineItem();
    lineItems.setLineItem(lineItemList);

    const transactionSettingList = [];

    const transactionSetting1 = new APIContracts.SettingType();
    transactionSetting1.setSettingName('duplicateWindow');
    transactionSetting1.setSettingValue('120');

    const transactionSetting2 = new APIContracts.SettingType();
    transactionSetting2.setSettingName('recurringBilling');
    transactionSetting2.setSettingValue('false');
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    transactionSettingList.push(transactionSetting2);

    const transactionSettings = new APIContracts.ArrayOfSetting();
    transactionSettings.setSetting(transactionSettingList);

    const transactionRequestType = new APIContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(
      APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION,
    );
    transactionRequestType.setPayment(paymentType);
    transactionRequestType.setAmount(Number(totalPrice) + Number(shippingInfo.price));
    transactionRequestType.setLineItems(lineItems);
    transactionRequestType.setShipping(shipping);
    transactionRequestType.setBillTo(billTo);
    transactionRequestType.setShipTo(shipTo);
    transactionRequestType.setTransactionSettings(transactionSettings);

    const createRequest = new APIContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);

    const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
    console.log(ctrl);

    ctrl.execute(function () {
      const apiResponse = ctrl.getResponse();

      const response = new APIContracts.CreateTransactionResponse(apiResponse);
      if (response != null) {
        if (response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK) {
          if (response.getTransactionResponse().getMessages() != null) {
            log(
              'Successfully created transaction with Transaction ID: ' +
                response.getTransactionResponse().getTransId(),
            );
            log('Response Code: ' + response.getTransactionResponse().getResponseCode());
            log(
              'Message Code: ' +
                response.getTransactionResponse().getMessages().getMessage()[0].getCode(),
            );
            log(
              'Description: ' +
                response.getTransactionResponse().getMessages().getMessage()[0].getDescription(),
            );
            req.transactionId = response.getTransactionResponse().getTransId();
          } else {
            log('Failed Transaction.');
            if (response.getTransactionResponse().getErrors() != null) {
              log(
                'Error Code: ' +
                  response.getTransactionResponse().getErrors().getError()[0].getErrorCode(),
              );
              log(
                'Error message: ' +
                  response.getTransactionResponse().getErrors().getError()[0].getErrorText(),
              );
              return sendError(
                req,
                res,
                400,
                response.getTransactionResponse().getErrors().getError()[0].getErrorText(),
              );
            }
          }
        } else {
          log('Failed Transaction.');
          if (
            response.getTransactionResponse() != null &&
            response.getTransactionResponse().getErrors() != null
          ) {
            log(
              'Error Code: ' +
                response.getTransactionResponse().getErrors().getError()[0].getErrorCode(),
            );
            log(
              'Error message: ' +
                response.getTransactionResponse().getErrors().getError()[0].getErrorText(),
            );
            return sendError(
              req,
              res,
              400,
              response.getTransactionResponse().getErrors().getError()[0].getErrorText(),
            );
          } else {
            log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
            log('Error message: ' + response.getMessages().getMessage()[0].getText());
            return sendError(req, res, 400, response.getMessages().getMessage()[0].getText());
          }
        }
      } else {
        console.log('Null Response.');
      }

      return next();
    });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid checkout data');
  }
};

export default {
  getSaleHistory,
  getPurchaseHistory,
  addCheckout,
  updateRoyaltyStatus,
  updateCheckoutStatus,
  getProductPrice,
  saveShippingAddress,
  getShippingAddress,
  checkout,
};
