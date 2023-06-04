const nodemailer = require("nodemailer");

const sendMail = async ({ email, html }) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_ENV, // generated ethereal user
      pass: process.env.PASS_EMAIL, // generated ethereal password
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Clone Ins " <no-relply@CloneIns.com>', // sender address
    to: email, // list of receivers
    subject: "Forgot Passowrd", // Subject line
    html: html,
  });
  return info;
};
module.exports = sendMail;
