import express from "express";

const router=express.Router();
import { PrismaClient } from "@prisma/client";


const prisma=new PrismaClient();

router.get("/", async (req, res) => {
    const permissions = await prisma.permission.findMany();
    res.json(permissions);
});

// Get a single permission by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const permission = await prisma.permission.findUnique({
        where: { id: parseInt(id) },
    });
    res.json(permission);
});

// Create a new permission
router.post("/", async (req, res) => {
    const { action, resource } = req.body;
    const permission = await prisma.permission.create({
        data: { action, resource },
    });
    res.status(201).json(permission);
});

// Delete a permission
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    await prisma.permission.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
});

export default router; 