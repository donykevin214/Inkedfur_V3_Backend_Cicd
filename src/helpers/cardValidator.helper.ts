import validator  from "validator";
import { CardInterface } from "~/interfaces";
import { Request, Response } from 'express';
import { sendError } from "./jwt.helper";
const validateForm =async (req: Request, res: Response, card: CardInterface) => {
    if(!validator.isCreditCard(card.cardNumber)) {
        return sendError(req, res, 400, 'Invalid credit card number.');
    }

    if(!/^\d{3}$/.test(card.cardCode)) {
        return sendError(req, res, 400, 'Invalid CVV code.');
    }

    if(!/^\d{4}$/.test(card.expireDate)) {
        return sendError(req, res, 400, 'Invalid expiration date.'); 
    }
}
export default validateForm;