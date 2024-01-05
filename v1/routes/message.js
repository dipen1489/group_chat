import express from "express";
import { SendMessage, LikeMessage } from "../controllers/message.js";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";
import { Verify } from '../middleware/verify.js'


const router = express.Router();

router.post(
    "/:group_id",
    check("content")
        .not()
        .isEmpty()
        .withMessage("content is required")
        .trim()
        .escape(),
    Validate,
    Verify,
    SendMessage
);

router.patch(
    "/:message_id/like",
    Verify,
    LikeMessage
);

export default router;