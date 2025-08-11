import {z} from "zod"

const verifySchema=z.string().length(6,{message:"Verification code must be 6 charecters long"});

export default verifySchema;