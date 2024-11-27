import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import cookieParser from "cookie-parser";

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = "0123456789"; // Replace with environment variable in production
router.use(cookieParser());
// JWT Authentication Middleware (inside users.js)
const authenticateToken = (req, res, next) => {
    const jwtToken = req.cookies.jwt;
    

    if (!jwtToken) {
        return res.status(401).json({ error: "Access token is missing." });
    }

    try {
        const decoded = jwt.verify(jwtToken, JWT_SECRET)
             req.user=decoded;
   
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error(error);
        return res.status(403).json({ error: "Invalid or expired token." });
    }
};

// Register route
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });

        res.status(201).json({ message: "User registered successfully!", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to register user." });
    }
});

// Login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { roles: { include: { role: true } } }, // Include roles in user data
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Compare password with hashed password in DB
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Create JWT token with user info and roles
        const userRoles = user.roles.map((role) => role.role.name); // Extract role names
        const token = jwt.sign(
            { userId: user.id, email: user.email, roles: userRoles },
            JWT_SECRET,
            { expiresIn: "1h" }
           
        );
        res.cookie("jwt",token,{httpOnly:true});

        res.json({ message: "Login successful!",token});
    } catch (error) {
        console.error(error);
       // res.status(500).json({ error: "Failed to login." });
    }
});


router.post("/forget-pass",async(req,res)=>{
    const{email,newpass}=req.body;

    try{
     const data=await prisma.user.findUnique({
        where:{email:email}
     })

     if(!data){
       return res.status(400).json({error:"The user doesnt exists whos password you need to change"})
     }
      const hashnewpass=await bcrypt.hash(newpass,5);
     const updatepass=await prisma.user.update({
        where:{email:email},
        data:{password:hashnewpass}
     })
     res.status(200).json({message:"Updated Password Successfully",updatepass});
    }catch(error){
        console.log(error);
    }
})
// Use JWT Authentication Middleware for protected routes
router.use(authenticateToken);

// Get all users (Protected route)
router.get("/", async (req, res) => {
    const users = await prisma.user.findMany({
        include: { roles: { include: { role: true } } },
    });
    res.json(users);
});

// Get a single user by ID (Protected route)
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: { roles: { include: { role: true } } },
    });
    res.json(user);
});

// Create a new user (Protected route)
router.post("/", async (req, res) => {
    const { name, email, password } = req.body;
    const user = await prisma.user.create({
        data: { name, email, password },
    });
    res.status(201).json(user);
});

// Assign a role to a user (Protected route)
router.post("/roles/:id", async (req, res) => {
    const { id } = req.params;
    const { roleId } = req.body;

    const userRole = await prisma.userRole.create({
        data: { userId: parseInt(id), roleId: parseInt(roleId) },
    });
    res.status(201).json(userRole);
});

// Check if the logged-in user has 'Admin' role (Protected route)
router.get("/admin-only", (req, res) => {
    if (!req.user.roles.includes("Admin")) {
        return res.status(403).json({ error: "Access denied. Admins only." });
    }
    res.json({ message: "Welcome, Admin!" });
});

// Check if the logged-in user has 'Viewer' role (Protected route)
router.get("/viewer-only", (req, res) => {
    if (!req.user.roles.includes("Viewer")) {
        return res.status(403).json({ error: "Access denied. Viewers only." });
    }
    res.json({ message: "Welcome, Viewer!" });
});

// Check if the logged-in user has 'Modifier' role (Protected route)
router.get("/modifier-only", (req, res) => {
    if (!req.user.roles.includes("Modifier")) {
        return res.status(403).json({ error: "Access denied. Modifiers only." });
    }
    res.json({ message: "Welcome, Modifier!" });
});

// Delete a user (Protected route)
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Step 1: Delete all related UserRole records
        await prisma.userRole.deleteMany({
            where: { userId: parseInt(id) },
        });

        // Step 2: Delete the User
      const data=  await prisma.user.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).json(data);
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Failed to delete user" });
    }
});


export default router;
