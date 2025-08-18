import dbConnect from "@/lib/dbConnection";
import UserModel from "@/models/user.model";
import verifySchema from "@/schema/verifySchema";
import {  z } from "zod";

const VerifyCodeVerificationSchema = z.object({
  verifyCode: verifySchema,
});

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { verifyCode, email } = await request.json();
    console.log(typeof(verifyCode))
    const result = VerifyCodeVerificationSchema.safeParse({
      verifyCode
    });
    if (!result.success) {
        console.log(result)
      return Response.json({
        success: false,
        message: "Invaild verification code",
      });
    }
    const verifiedVerifyCode = result.data.verifyCode;
    const userDetails = await UserModel.findOne({ email });
    if (!userDetails) {
      return Response.json(
        {
          success: false,
          message: "User doesnt exists with this email",
        },
        {
          status: 500,
        }
      );
    }
    if(verifiedVerifyCode!=userDetails?.verifyCode){
        return Response.json({
            success:false,
            message:"Verification Code is invaild"
        },{
            status:400
        })
    }
    const isCodeNotExpired = new Date(userDetails.verifyCodeExpiry) > new Date();
    if(!isCodeNotExpired){
         return Response.json({
            success:false,
            message:"Verification is not valid"
        },{
            status:400
        })
    }
    userDetails.isVerified=true;
    await userDetails.save()
    return Response.json({
       success:true,
       message:"Verification Code is correct" 
    })

  } catch (error) {
    console.log("Error occured while checking verification code", error);
    return Response.json(
      {
        success: false,
        message: "Error occured while checking verification code",
      },
      {
        status: 500,
      }
    );
  }
}
