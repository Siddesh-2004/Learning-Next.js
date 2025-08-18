import dbConnection from "@/lib/dbConnection";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerficationEmail";

export async function POST(request: Request) {
  await dbConnection();
  try {
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const { username, email, password } = await request.json();
    const existingUserVerfiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerfiedByUsername) {
      return Response.json({
        success: false,
        message: "username is not available",
      });
    }
    const existingUserVerfiedByEmail = await UserModel.findOne({ email });
    if (existingUserVerfiedByEmail) {
      if (existingUserVerfiedByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User is already exists with this email",
          },
          {
            status: 500,
          }
        );
      } else {
        const hasedPassword = await bcrypt.hash(password, 10);
        existingUserVerfiedByEmail.verifyCode = verifyCode;
        existingUserVerfiedByEmail.password = hasedPassword;
        existingUserVerfiedByEmail.verifyCodeExpiry = new Date(
          Date.now() + 3600000
        );
        await existingUserVerfiedByEmail.save();
      }
    } else {
      const hasedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const newUser = new UserModel({
        username,
        email,
        password: hasedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        message: [],
      });
      await newUser.save();
    }
    //send verification eamil
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode,
    );
    console.log(emailResponse)
    if (!emailResponse.success) {
      console.log("this the respone from resend email", emailResponse);
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "User registered successfully please verify",
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error("Error during registering user", err);
    return Response.json(
      {
        success: false,
        message: "Error registering User",
      },
      {
        status: 500,
      }
    );
  }
}
