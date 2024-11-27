import express from "express";
import bodyParser from "body-parser";

 import cors from "cors";
import userRoutes from "./routes/users.js"
import roleRoutes from "./routes/roles.js";
import permissionRoutes from "./routes/permissions.js"

const app=express();

const PORT=process.env.PORT || 3000;


// Replace with the actual URL of your frontend
const FRONTEND_URL = 'http://localhost:5173';

app.use(
  cors({
    origin: FRONTEND_URL, // Specify the exact frontend URL
    credentials: true, // Allow credentials (cookies) to be sent
  })
);

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());



//routes

app.use("/users",userRoutes);

app.use("/roles",roleRoutes);

app.use("/permission",permissionRoutes);

app.listen(PORT,()=>{
    console.log(`Server Running on PORT ${PORT}`);
})


// import express from "express";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// const router=express.Router();
// import { PrismaClient } from "@prisma/client";
// const prisma=new PrismaClient();

// router.get("/", async (req, res) => {
//     const users = await prisma.user.findMany({
//         include: { roles: { include: { role: true } } },
//     });
//     res.json(users);
// });

// // Get a single user by ID
// router.get("/:id", async (req, res) => {
//     const { id } = req.params;
//     const user = await prisma.user.findUnique({
//         where: { id: parseInt(id) },
//         include: { roles: { include: { role: true } } },
//     });
//     res.json(user);
// });

// // Create a new user
// router.post("/register", async (req, res) => {
//     const { name, email, password } = req.body;

//     const data=await prisma.user.findUnique({
//         where:{email:email},
//     })

//     if(data){
//         return res.status(400).json({message:"User Already Registered"})
//     }

//    const hashpass=await bcrypt.hash(password,5);
//     const user = await prisma.user.create({
//         data: { name:name, 
//             email:email,
//              password:hashpass },
//     });
//     res.status(201).json(user);
// });
// router.post("/login",async(req,res)=>{
//     const {email,password}=req.body;

//     const data=await prisma.user.findUnique({
//         where:{email:email}
//     })

//     if(!data){
//         res.status(400).json({error:"User Not Found"});
//     }

//     if(data){
//         const match=await bcrypt.compare(password,user.password);
//         if(match){
//             res.status(200).json({message:"User Logged In successfully"})
//         }else{
//             res.status(400).json({error:"Password Doesnt Match"})
//         }
//     }
// })
// // Assign a role to a user
// router.post("/:id/roles", async (req, res) => {
//     const { id } = req.params;
//     const { roleId } = req.body;
//     const userRole = await prisma.userRole.create({
//         data: { userId: parseInt(id), roleId: parseInt(roleId) },
//     });
//     res.status(201).json(userRole);
// });

// // Delete a user
// router.delete("/:id", async (req, res) => {
//     const { id } = req.params;
//     await prisma.user.delete({ where: { id: parseInt(id) } });
//     res.status(204).send();
// });

// export default router;