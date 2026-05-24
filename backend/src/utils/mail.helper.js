import nodemailer from "nodemailer";

/**
 * Helper function to send emails using nodemailer.
 * If SMTP credentials are not configured, it will log the mail contents to the console
 * and return a dummy response to prevent application crashes during local development/testing.
 */
export const sendEmail = async ({ to, subject, text, html }) => {
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    console.log(`[Email Attempt] To: ${to} | Subject: ${subject}`);

    if (!smtpUser || !smtpPass) {
        console.warn("=================================================================");
        console.warn("WARNING: SMTP_USER or SMTP_PASS is not configured in backend .env");
        console.warn("The email was NOT sent to the recipient.");
        console.warn("Here is the email content:");
        console.warn(`Subject: ${subject}`);
        console.warn("=================================================================");
        return { messageId: "dev-dummy-id", preview: true };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true for port 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        const mailOptions = {
            from: `"EveryTube" <${smtpUser}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully! Message ID:", info.messageId);
        return info;
    } catch (error) {
        console.error("Nodemailer failed to send email:", error.message);
        console.warn("=================================================================");
        console.warn("Nodemailer error details. Fallback printed below:");
        console.warn(`Subject: ${subject}`);
        console.warn("=================================================================");
        throw error;
    }
};
