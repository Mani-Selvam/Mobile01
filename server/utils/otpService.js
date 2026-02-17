const nodemailer = require("nodemailer");

// Email Transporter (Gmail Example)
// For Gmail, you might need an App Password: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmailOTP = async (email, otp) => {
    try {
        const user = process.env.EMAIL_USER;
        const pass = process.env.EMAIL_PASS;

        // If creds missing or placeholders, simulate
        if (!user || !pass || user.startsWith("your_") || pass.startsWith("your_")) {
            console.warn("Email credentials missing or placeholders. OTP email simulation only.");
            return true;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Verification Code",
            text: `Your OTP is: ${otp}`,
            html: `<h3>Your Verification Code</h3><p>Your OTP is: <b>${otp}</b></p>`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to email: ${email}`);
        return true;
    } catch (error) {
        if (error.code === 'EAUTH') {
            console.warn(`[DEV LOG] Email sending failed due to invalid credentials (EAUTH). This is expected if you haven't set up a real Gmail App Password yet. \nBut don't worry! The OTP was generated correctly above.`);
        } else {
            console.error("Error sending email OTP:", error);
        }
        return false;
    }
};

// Mobile OTP is now handled by Firebase on the client side.
// This function is deprecated or can be used for logging if needed, but not sending.
const sendMobileOTP = async (mobile, otp) => {
    console.log(`[MOBILE OTP] Request to send OTP ${otp} to ${mobile} received.`);
    console.log("Mobile OTP should be handled via Firebase Client SDK.");
    return true; // Return true to not break existing flow immediately if called
};

module.exports = { sendEmailOTP, sendMobileOTP };
