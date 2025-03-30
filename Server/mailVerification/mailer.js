const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
try{
  await transporter.sendMail({
    from: '"NFT Marketplace" <your-email@gmail.com>',
    to: email,
    subject: "Verify Your Email",
    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
  })}
  catch(e){
    console.log(e)
  }
};

module.exports = sendVerificationEmail;
