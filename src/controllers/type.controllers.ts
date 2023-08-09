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

import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

const log = debug('app:controllers:type');

const getProductTypes = async (req: Request, res: Response) => {
  console.log(req.body);
  const { skip, index, search } = req.body;
  try {
    const regexQuery = new RegExp(search, 'i');

    const types = await Type.find({})
      .limit(skip)
      .skip((index - 1) * skip)
      .or([
        { name: { $regex: regexQuery } },
        { value: { $regex: regexQuery } },
        { slug: { $regex: regexQuery } },
        { description: { $regex: regexQuery } },
      ]);

    const totalCount = await Type.count({}).or([
      { name: { $regex: regexQuery } },
      { value: { $regex: regexQuery } },
      { slug: { $regex: regexQuery } },
      { description: { $regex: regexQuery } },
    ]);

    return res.json({ success: true, types, totalCount });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const getAllTypes = async (req: Request, res: Response) => {
  try {
    const types = await Type.find({});
    return res.json({ success: true, types });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const addType = async (req: Request, res: Response) => {
  console.log(req.body);

  const {
    name,
    slug,
    import_type,
    description,
    weight,
    printable,
    backorderable,
    outsourced,
    selfServices,
    multiSubmissionOption,
    royalties,
    navigation,
  } = req.body;
  const files = req.files as Express.Multer.File[];
  try {
    let value;
    if (/\s/g.test(name)) {
      value = name.split(' ')[1].toLowerCase();
    } else {
      value = name.toLowerCase();
    }
    console.log('a');
    const product_image = await uploadFile(files[0], name);
    console.log(product_image);
    await Type.create({
      name,
      value,
      slug,
      import_type,
      description,
      weight,
      printable,
      backorderable,
      outsourced,
      selfServices,
      multiSubmissionOption,
      royalties,
      navigation,
      product_image,
    });
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const addNewOption = async (req: Request, res: Response) => {
  const { type_id, optionName } = req.body;
  try {
    const type = await Type.findById(type_id);
    if (!type) {
      return sendError(req, res, 400, 'Type does not exist.');
    }
    type.size_option.push(optionName);
    type.other_fields.push({ name: optionName, values: [] });
    await type.save();

    // await TypeSize.updateMany(
    //   { type_id: { $exists: true, $type: 'string' } },
    //   { $set: { bbb: '', type_id: new ObjectId() } },
    //   { upsert: true },
    // );

    // addDynamicField(optionName);
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, err);
  }
};

const getSize = async (req: Request, res: Response): Promise<Response> => {
  const { type_id } = req.body;
  try {
    if (!type_id) {
      return res.status(400).json({ success: false, error: 'type_id is required' });
    }

    const sizes = await TypeSize.find({ type_id });
    const type = await Type.findById(type_id);

    const nSizes = sizes.map((size: any) => {
      const updatedSize: any = { ...size };

      type?.other_fields.forEach((field: any) => {
        updatedSize[field.name] = null;
        field.values.forEach((value: any) => {
          if (value.size_id === size._id.toString()) {
            updatedSize[field.name] = value.value;
          }
        });
      });

      return updatedSize;
    });

    const nnSizes = nSizes.map((nSize: any) => {
      const nnSize: any = { ...nSize._doc };
      type?.other_fields.forEach((field: any) => {
        nnSize[field.name] = null;
        nnSize[field.name] = nSize[field.name];
      });

      return nnSize;
    });

    // console.log(nnSizes);

    const other_fields = type?.other_fields.map((field: any, index) => {
      return field.name;
    });

    return res.json({ success: true, sizes: nnSizes, other_fields });
  } catch (err) {
    console.log('error', 'err:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const addNewSize = async (req: Request, res: Response) => {
  console.log(req.body);
  const { type_id, sku_suffix, label, weight, price, size, royalty, other_fields } = req.body;
  try {
    const result = await TypeSize.create({
      type_id,
      sku_suffix,
      label,
      weight,
      price,
      size,
      royalty,
    });
    console.log(result._id.toString());
    const type = await Type.findById(type_id); // Await the result of Type.findById
    if (type) {
      Object.keys(other_fields).map((key, index) => {
        type.other_fields.map((field: any, index) => {
          if (key == field.name) {
            field.values.push({ size_id: result._id, value: other_fields[key] });
          }
        });
      });
      type.save();
    }
    return res.json({ success: true });
  } catch (err) {
    console.log('error', 'err:', err); // Use console.log instead of log
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const updateSize = async (req: Request, res: Response) => {
  //   console.log(req.body);
  const updated = req.body.updated;

  try {
    await TypeSize.updateOne(
      { _id: updated._id, type_id: updated.type_id },
      {
        $set: {
          sku_suffix: updated.sku_suffix,
          label: updated.label,
          weight: updated.weight,
          price: updated.price,
          size: updated.size,
          royalty: updated.royalty,
        },
      },
    );

    const type = await Type.findById(updated.type_id);
    type?.other_fields.map((field: any, index) => {
      let flag = 0;
      field.values.map((item: any, index) => {
        if (item.size_id == updated._id) {
          flag = 1;
          item.value = updated[field.name];
        }
      });
      if (flag == 0) field.values.push({ size_id: updated._id, value: updated[field.name] });
    });
    type?.save();
    // console.log(type?.other_fields);

    return res.json({ success: true });
  } catch (err) {
    console.log('error', 'err:', err); // Use console.log instead of log
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

const deleteSize = async (req: Request, res: Response) => {
  console.log(req.body);
  const { size_id } = req.body;
  try {
    if (!size_id) {
      return res.status(400).json({ success: false, error: 'size_id is required' });
    }
    await TypeSize.deleteOne({ _id: size_id });

    return res.json({ success: true });
  } catch (err) {
    console.log('error', 'err:', err); // Use console.log instead of log
    return sendError(req, res, 400, 'Invalid user data:');
  }
};

export default {
  getProductTypes,
  getAllTypes,
  addType,
  addNewOption,
  getSize,
  addNewSize,
  updateSize,
  deleteSize,
};
