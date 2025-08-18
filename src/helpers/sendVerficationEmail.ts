import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerficationEmailTemplate";
import { ApiResponse } from '@/types/ApiResponse';

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const response=await resend.emails.send({
      from: 'Onboarding@pokademalthin.online',
      to: email,
      subject: 'Mystery || Verification email ',
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    console.log("haha:",response)
    return { success: true, message: 'Verification email sent successfully.' };
  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
    return { success: false, message: 'Failed to send verification email.' };
  }
}