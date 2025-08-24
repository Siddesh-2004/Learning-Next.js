import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnection";
import UserModel from "@/models/user.model";
import { User } from "next-auth";

export async function POST(request:Request){
    await dbConnect();
    const session=await getServerSession(authOptions);
    const user:User=session?.user as User;
    if(!session||!session.user){
        return Response.json({
            success:false,
            message:"Not Authenticated"
        },{
            status:400
        })
    }
    const userId=user?._id
    const {isAcceptingMessage}=await request.json();
    try {
        const updatedUser=await UserModel.findOneAndUpdate({_id:userId},{
            isAcceptingMessage
        })
        if(!updatedUser){
            console.log("no user found");
            return Response.json({
                 success:false,
            message:"Failed to update Failed to update user messages to accept messages"
            },{
                status:401
            })
        }
        return Response.json({
            success:false,
            message:"Updated user successfully",
            data:updatedUser
        },{
            status:500
        })

    } catch (error) {
        console.log("Failed to get user details",error);
        return Response.json({
            success:false,
            message:"Failed to update the user message status"
        },{
            status:500
        })
    }

}

export async function GET(){
    await dbConnect();
   try {
     const session=await getServerSession(authOptions);
     const user=session?.user ;
     if(!session||!session.user){
         return Response.json({
             success:false,
             message:"Not Authenticated"
         },{
             status:400
         })
     }
     const userId=user?._id ;
     const foundUser=await UserModel.findById(userId);
     if(!foundUser){
         console.log("no user found");
             return Response.json({
                  success:false,
             message:"User not found"
             },{
                 status:401
             })
     }
     if(!foundUser.isAcceptingMessage){
         return Response.json({
                  success:true,
             message:"The user is not accepting messages"
             },{
                 status:201
             })
     }
     if(foundUser.isAcceptingMessage){
          return Response.json({
                  success:true,
             message:"The user is accepting messages"
             },{
                 status:200
             })
     }
   } catch (error) {
    console.log("Failed to get Message accepting status",error);
        return Response.json({
            success:false,
            message:"Failed to get Message accepting status "
        },{
            status:500
        })
   }
}