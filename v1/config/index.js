import * as dotenv from "dotenv";
dotenv.config();

const { URI, PORT, SECRET_ACCESS_TOKEN, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

export { URI, PORT, SECRET_ACCESS_TOKEN, ADMIN_EMAIL, ADMIN_PASSWORD };