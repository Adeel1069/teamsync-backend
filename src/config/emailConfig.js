import nodemailer from "nodemailer";
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM_EMAIL,
  SMTP_FROM_NAME,
} from "./envConfig.js";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465 for the sake of SSL/TLS encryption
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const emailFrom = `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`;

export default transporter;
