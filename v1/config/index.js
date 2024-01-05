import * as dotenv from "dotenv";
dotenv.config();

const { URI, PORT, SECRET_ACCESS_TOKEN, ADMIN_EMAIL, ADMIN_PASSWORD, TEST_URI  } = process.env;

export { URI, PORT, SECRET_ACCESS_TOKEN, ADMIN_EMAIL, ADMIN_PASSWORD, TEST_URI };