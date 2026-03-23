const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load environment variables
const host = process.env.MAIL_HOST;
const port = parseInt(process.env.MAIL_PORT, 10);
const user = process.env.MAIL_USER;
const pass = process.env.MAIL_PASS;

// Create a transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use service: 'gmail' for better built-ins
    auth: {
        user,
        pass,
    },
});

/**
 * Send an email with HTML content.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} htmlContent - HTML body of the email.
 */
async function sendEmail(to, subject, htmlContent) {
    const mailOptions = {
        from: user,
        to,
        subject,
        html: htmlContent,
    };

    return transporter.sendMail(mailOptions);
}

/**
 * Helper to send an email using a template file.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} templateName - Name of the template file (e.g., 'welcome.html').
 * @param {object} variables - Key-value pairs to replace in the template.
 */
async function sendTemplateEmail(to, subject, templateName, variables = {}) {
    const templatePath = path.resolve(__dirname, 'emailTemplates', templateName);
    let html = fs.readFileSync(templatePath, 'utf-8');
    // Simple variable replacement {{key}}
    Object.entries(variables).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        html = html.replace(placeholder, value);
    });
    return sendEmail(to, subject, html);
}

/**
 * Send an OTP email.
 * @param {string} to - Recipient email address.
 * @param {string} name - User's name.
 * @param {string} otp - The OTP code.
 */
async function sendOTPEmail(to, name, otp) {
    return sendTemplateEmail(to, 'Password Reset OTP', 'welcome.html', { name, otp });
}

/**
 * Send a signup verification OTP email.
 * @param {string} to - Recipient email address.
 * @param {string} name - User's name.
 * @param {string} otp - The OTP code.
 */
async function sendSignupOTPEmail(to, name, otp) {
    return sendTemplateEmail(to, 'Verify Your Email - Blog Management System', 'signupOtp.html', { name, otp });
}

module.exports = {
    sendEmail,
    sendTemplateEmail,
    sendOTPEmail,
    sendSignupOTPEmail,
};
