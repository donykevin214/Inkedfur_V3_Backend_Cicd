/**
 * 
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
import { Request, Response } from 'express';
import { sendError } from '~/helpers/jwt.helper';
import debug from 'debug';
import Submission from '~/models/submission.model';
import uploadFile from '~/helpers/uploadfile.helper';

const log = debug('app:controllers:submission');

const getSubmissionByUserId = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
        const submission = await Submission.find({ user_id });
        return res.json({ success: true, submission });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid user data:');
    }
}

const addSubmission = async (req: Request, res: Response) => {
    const { user_id } = req.body;
    try {
        await Submission.create({ user_id })
        return res.json({ success: true });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid user data:');
    }
}

const updateSubmissionById = async (req: Request, res: Response) => {
    const { submission_id, name, description } = req.body;
    const files = req.files as Express.Multer.File[];
    try {
        const submission = await Submission.findById(submission_id);
        if (!submission) {
            return sendError(req, res, 400, 'Submission does not exist');
        }
        const image = await uploadFile(files[0], 'submission');
        // submission.sub_name = name;
        // submission.description = description;
        // submission.sub_img = image;
        await submission.save();
        return res.json({ success: true });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid user data:');
    }
}

const deleteSubmissionById = async (req: Request, res: Response) => {
    const { submission_id } = req.body;
    try {
        const submission = await Submission.findById(submission_id);
        if (!submission) {
            return sendError(req, res, 400, 'Submission does not exist');
        }
        await submission.deleteOne();
        return res.json({ success: true });
    } catch (err) {
        log('error', 'err:', err);
        return sendError(req, res, 400, 'Invalid user data:');
    }
}

export default { getSubmissionByUserId, addSubmission, updateSubmissionById, deleteSubmissionById }