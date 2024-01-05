import express from "express";
import { Register, Remove, GetAll, AddMembers, GetDetails } from "../controllers/group.js";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";
import { Verify, VerifyUserRole } from '../middleware/verify.js'


const router = express.Router();

router.post(
    "/",
    check("name")
        .not()
        .isEmpty()
        .withMessage("Name is required")
        .trim()
        .escape(),
    Validate,
    Verify,
    Register
);

router.delete(
    "/:group_id",
    Verify,
    Remove
);

router.get(
    "/",
    Verify,
    GetAll
);

router.get(
    "/:group_id",
    Verify,
    GetDetails
);

router.post(
    "/:group_id/members",
    check('members').isArray().withMessage('members must be an array'),
    check('members.*').isString().withMessage('Each element in members must be a string'),
    Validate,
    Verify,
    AddMembers
);

export default router;