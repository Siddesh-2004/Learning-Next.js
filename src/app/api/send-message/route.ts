
import dbConnect from "@/lib/dbConnection";
import UserModel from "@/models/user.model";

import {Message} from "@/models/user.model"


export async function POST(request:Request){
    await dbConnect();
    const {username,content}=await request.json();
    try{
        const user=await UserModel.findOne({username});
        if(!user){
            return Response.json({
                success:false,
                message:"User not found"
            },{
                status:404
            })
        }
        if(!user.isAcceptingMessage){
            return Response.json(
                {
                    success:false,
                    message:"User is not accepting the messages"
                },{
                    status:403
                }
            )
        }
        const newMessage={
            
            content,createdAt:Date.now()
        }
        user.message.push(newMessage as unknown as  Message);
        await user.save()
    }catch(error){
        console.log("Error while sending the messages",error);
        return Response.json(
            {
                success:false,
                message:"Error while sending the messages"

            },{status:500}
        )
    }
}