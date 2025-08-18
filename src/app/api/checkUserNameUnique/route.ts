import dbConnect from "../../../lib/dbConnection";
import UserModel from "../../../models/user.model";
import { z } from "zod";
import { usernameValidation } from "../../../schema/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
     await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    console.log(searchParams);
    const queryParam = {
      username: searchParams.get("username"),
    };
    const result = UsernameQuerySchema.safeParse(queryParam);
    console.log(result);
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        {
          status: 500,
        }
      );
    }

    const { username } = result.data;
    const existingUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        {
          status: 500,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error while checking username", error);
    return Response.json(
      {
        success: false,
        message: "error while checking username usernameValidationSchema",
      },
      {
        status: 500,
      }
    );
  }
}
