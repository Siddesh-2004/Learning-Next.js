import {z} from "zod"

const acceptMessage=z.object({
    acceptMessages:z.boolean()
})

export default acceptMessage