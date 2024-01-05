import User from "../models/User.js";
import bcrypt from "bcrypt";
import { respDto } from '../utils/commonDto.js'
import Blacklist from '../models/Blacklist.js';

export async function Login(req, res) {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user)
            return res.status(401).json(respDto([], {message: "Account does not exist"}, {}));

        const isPasswordValid = await bcrypt.compare(
            `${password}`,
            user.password
        );
        if (!isPasswordValid) {
            return res.status(401).json(respDto([], {message: "Invalid email or password. Please try again with the correct credentials."}, {}));
        }
        let options = {
            maxAge: 30 * 60 * 1000, 
            httpOnly: true, 
            secure: true,
            sameSite: "None",
        };
        const token = user.generateAccessJWT(); 
        res.cookie("SessionID", token, options);
        res.status(200)
    } catch (err) {
        return res.status(500).json(respDto([], {message: err.message}, {}));
    }
    res.end();
}

export async function Logout(req, res) {
    try {
      const authHeader = req.headers['cookie']; 
      if (!authHeader) return res.sendStatus(204); 
      const cookie = authHeader.split('=')[1];
      const accessToken = cookie.split(';')[0];
      const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken });
      if (checkIfBlacklisted) return res.sendStatus(204);
      const newBlacklist = new Blacklist({
        token: accessToken,
      });
      await newBlacklist.save();
      res.setHeader('Clear-Site-Data', '"cookies"');
      res.status(200)
    } catch (err) {
        return res.status(500).json(respDto([], {message: err.message}, {}));
    }
    res.end();
  }