

import nodemailer from 'nodemailer';

// create reusable transporter object using the default SMTP transport
const mailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'primexop.com@gmail.com',
    pass: 'elduzplryefbcnxk',
  },
  tls: {
    rejectUnauthorized: false
  }
});

export default mailTransporter;