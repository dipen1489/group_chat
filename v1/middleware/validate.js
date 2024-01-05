import { validationResult } from "express-validator";
import { respDto } from '../utils/commonDto.js'

const Validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let error = {};
        errors.array().map((err) => (error[err.param] = err.msg));
        return res.status(422).json(respDto([], error, {}));
    }
    next();
};
export default Validate;