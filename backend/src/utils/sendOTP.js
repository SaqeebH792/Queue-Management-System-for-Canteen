import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtp = async (normalizedEmail, code) => {
  try {
    await resend.emails.send({
      from: "Mealanzo <noreply@yourdomain.com>",
      to: normalizedEmail,
      subject: "Your Mealanzo Verification Code",
      html: `
        <h2>Verify your Mealanzo account</h2>
        <p>Your verification code is:</p>
        <h1>${code}</h1>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    console.log(`OTP sent to ${normalizedEmail}`);
  } catch (error) {
    console.error("Failed to send OTP:", error);
    throw new Error("Unable to send verification email");
  }
};

export { sendOtp };
