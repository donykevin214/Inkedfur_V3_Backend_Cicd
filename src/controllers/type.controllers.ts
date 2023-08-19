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
import Crop from '~/models/crop.model';
import Type from '~/models/type.model';
import uploadFile from '~/helpers/uploadfile.helper';
import { TypeSize, addDynamicField } from '~/models/typesize.model';

import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

const log = debug('app:controllers:type');

const getProductTypes = async (req: Request, res: Response) => {
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
    let product_image;
    if (files.length > 0) {
      product_image = await uploadFile(files[0], name);
    }

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

const editType = async (req: Request, res: Response) => {
  const {
    type_id,
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
    const type = await Type.findById(type_id);
    if (!type) {
      return sendError(req, res, 400, 'No type exist');
    }
    let product_image;
    if (files.length > 0) {
      product_image = await uploadFile(files[0], name);
      type.product_image = product_image || '';
    }
    type.name = name;
    type.value = value;
    type.slug = slug;
    type.import_type = import_type;
    type.description = description;
    type.weight = weight;
    type.printable = printable;
    type.backorderable = backorderable;
    type.outsourced = outsourced;
    type.selfServices = selfServices;
    type.multiSubmissionOption = multiSubmissionOption;
    type.royalties = royalties;
    type.navigation = navigation;

    await type.save();
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
    return res.json({ success: true });
  } catch (err) {
    log('error', 'err:', err);
    return sendError(req, res, 400, 'Invalid type data:');
  }
};

const getSize = async (req: Request, res: Response): Promise<Response> => {
  const { type_id } = req.body;
  console.log(type_id);
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

const classifyCrop = (size: string) => {
  const crop1 = ['1920*1080', '1600*900', '1440*900', '1366*768'];
  const crop2 = ['1024*768', '1280*720', '832*624'];
  const crop3 = ['2700*1100', '1300*500'];

  if (crop1.includes(size)) {
    return '16:9';
  } else if (crop2.includes(size)) {
    return '4:3';
  } else if (crop3.includes(size)) {
    return '27:11';
  } else return 'others';
};

const classifyArtCrop = (size: string) => {
  const crop1 = ['Magazine', 'Brochure', 'Paperback'];

  if (crop1.includes(size)) return '10:13';
};

const classifyTSCrop = (size: string) => {
  const crop1 = ['Small', 'Medium', 'Large', 'X-Large', '2X-Large', '3X-Large'];

  if (crop1.includes(size)) return '7:9';
};

const classifyComicsCrop = (size: string) => {
  const crop1 = 'US Current Size';
  const crop2 = 'Magazine-Size Comic';

  if (size == crop1) return '9:14';
  if (size == crop2) return '10:13';
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

    const cropCount = await Crop.count({ type_id });
    if (cropCount == 0) {
      if (type?.name == 'Prints') {
        await Crop.create({ name: '16:9', type_id });
        await Crop.create({ name: '4:3', type_id });
        await Crop.create({ name: '27:11', type_id });
        await Crop.create({ name: 'others', type_id });
      } else if (type?.name == 'T-Shirt') {
        await Crop.create({ name: '7:9', type_id });
      } else if (type?.name == 'Art Works') {
        await Crop.create({ name: '10:13', type_id });
      } else if (type?.name == 'Comics') {
        await Crop.create({ name: '9:14', type_id });
        await Crop.create({ name: '10:13', type_id });
      }
    }

    let cropName = '';

    if (type?.name === 'Prints') {
      cropName = await classifyCrop(size);
    } else if (type?.name === 'T-Shirt') {
      cropName = await classifyTSCrop(size);
    } else if (type?.name === 'Art Works') {
      cropName = await classifyArtCrop(size);
    } else if (type?.name === 'Comics') {
      cropName = await classifyComicsCrop(size);
    }
    // cropName = await classifyCrop(size);

    const crop = await Crop.findOne({ name: cropName, type_id });
    await crop?.sizeList.push({ size: result._id });
    await crop?.save();

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
      field.values.map((item: any, index: number) => {
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
  editType,
  addNewOption,
  getSize,
  addNewSize,
  updateSize,
  deleteSize,
};
