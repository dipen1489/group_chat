import express from "express";
import { Register, Update, GetAll } from "../controllers/user.js";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";
import { Verify, VerifyAdminRole } from '../middleware/verify.js'
import { AddAdminRole, AddUserRole } from '../middleware/addRole.js'
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../config/index.js';


const router = express.Router();

router.post(
    "/",
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address")
        .normalizeEmail(),
    check("first_name")
        .not()
        .isEmpty()
        .withMessage("Your first name is required")
        .trim()
        .escape(),
    check("last_name")
        .not()
        .isEmpty()
        .withMessage("Your last name is required")
        .trim()
        .escape(),
    check("password")
        .notEmpty()
        .isLength({ min: 5 })
        .withMessage("Must be at least 5 chars long"),
    Validate,
    Verify,
    VerifyAdminRole,
    AddUserRole,
    Register
);

router.post(
    "/admin",
    check("email")
        .isEmail()
        .equals(ADMIN_EMAIL)
        .withMessage("Enter a valid admin email address from env")
        .normalizeEmail(),
    check("first_name")
        .not()
        .isEmpty()
        .withMessage("Your first name is required")
        .trim()
        .escape(),
    check("last_name")
        .not()
        .isEmpty()
        .withMessage("Your last name is required")
        .trim()
        .escape(),
    check("password")
        .notEmpty()
        .equals(ADMIN_PASSWORD)
        .withMessage("Enter a valid admin password from env"),
    Validate,
    AddAdminRole,
    Register
);

router.patch(
    "/:user_id",
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address")
        .normalizeEmail()
        .optional(),
    check("first_name")
        .trim()
        .escape()
        .optional(),
    check("last_name")
        .trim()
        .escape()
        .optional(),
    check("password")
        .notEmpty()
        .isLength({ min: 5 })
        .withMessage("Must be at least 5 chars long")
        .optional(),
    Validate,
    Verify,
    VerifyAdminRole,
    Update
);

router.get(
    "/",
    Verify,
    GetAll
);

export default router;