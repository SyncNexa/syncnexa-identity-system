import nodemailer, { type Transporter } from "nodemailer";

/**
 * Email transporter configuration
 * Supports multiple email providers through environment variables
 */

type EmailProvider = "smtp" | "gmail" | "sendgrid" | "mailgun" | "mock";

const emailProvider = (process.env.EMAIL_PROVIDER || "smtp") as EmailProvider;

let transporter: Transporter;

switch (emailProvider) {
  case "gmail":
    // Gmail configuration
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use app password, not regular password
      },
    });
    break;

  case "sendgrid":
    // SendGrid configuration
    transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });
    break;

  case "mailgun":
    // Mailgun configuration
    transporter = nodemailer.createTransport({
      host: process.env.MAILGUN_SMTP_HOST || "smtp.mailgun.org",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILGUN_SMTP_USER,
        pass: process.env.MAILGUN_SMTP_PASSWORD,
      },
    });
    break;

  case "mock":
    // Mock transporter for testing (doesn't actually send)
    transporter = nodemailer.createTransport({
      host: "localhost",
      port: 1025,
      secure: false,
      ignoreTLS: true,
    });
    break;

  case "smtp":
  default:
    // Generic SMTP configuration
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    });
    break;
}

// Verify connection (non-blocking)
transporter.verify((err: Error | null, success?: boolean) => {
  if (err) {
    console.warn(
      "[EMAIL] Warning: Could not verify email transporter connection:",
      err.message,
    );
  } else if (success) {
    console.log("[EMAIL] Email transporter verified successfully");
  }
});

export default transporter;
export { emailProvider };
