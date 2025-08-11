import {z} from "zod"

export const messageSchema=z.object({
    content:z
        .string()
        .min(10,{message:"message must be atleast 2 characters long"})
        .max(300,{message:"Message can not be more than 300 charecters"})
})