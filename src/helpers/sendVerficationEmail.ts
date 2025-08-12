import {resend} from "@/lib/resend"
import Verification from "../../emails/VerficationEmailTemplate"
import { ApiResponse } from "@/types/ApiResponse"

interface verifcationProps{
    email:string;
    username:string;
    verifyCode:string;
}
export async function sendVerificationEmail({
    email,
    username,
    verifyCode
}:verifcationProps):Promise<ApiResponse>{
    try{
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: 'Verification Code',
      react: Verification({username,otp:verifyCode}),
    });

 return {
            success:true,
            message:"Email sent successfully"
        }
    }catch(err){
        console.log("Error sending Verification email",err);
        return {
            success:false,
            message:"Failed to send verifcation email"
        }
    }
}