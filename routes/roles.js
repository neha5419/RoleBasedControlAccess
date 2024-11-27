import express from "express";
import { PrismaClient } from "@prisma/client";

const router=express.Router();
const prisma=new PrismaClient();

router.get("/", async (req, res) => {
    const roles = await prisma.role.findMany({
        include: { permissions: { include: { permission: true } } },
    });
    res.json(roles);
});

// Get a single role by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
        where: { id: parseInt(id) },
        include: { permissions: { include: { permission: true } } },
    });
    res.json(role);
});

// Create a new role
router.post("/", async (req, res) => {
    const { name, description } = req.body;
    const role = await prisma.role.create({
        data: { name, description },
    });
    res.status(201).json(role);
});

// Assign a permission to a role
router.post("/:id/permissions", async (req, res) => {
    const { id } = req.params;
    const { permissionId } = req.body;
    const rolePermission = await prisma.rolePermission.create({
        data: { roleId: parseInt(id), permissionId: parseInt(permissionId) },
    });
    res.status(201).json(rolePermission);
});

// Delete a role
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    await prisma.role.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
});

export default router;