import express from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  login,
  recoverPassword,
} from "../controllers/userController.js";

const router = express.Router(); // Router para crear rutas de nuestro servicio

router.get("/all", getUsers);
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Users management
 * /app/users/all:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *      '200':
 *        description: A successful response
 */

router.post("/create", createUser);
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Users management
 * /app/users/create:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     responses:
 *      '200':
 *        description: A successful response
 */

router.patch("/update/:id", updateUser);
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Users management
 * /app/users/update/{id}:
 *   patch:
 *     summary: Update a user
 *     tags: [Users]
 *     responses:
 *      '200':
 *        description: A successful response
 */

router.delete("/delete/:id", deleteUser);

router.post("/login", login);

router.post("/recover", recoverPassword);

/**
 * @swagger
 * /app/users/recover:
 *   post:
 *     summary: Enviar correo de recuperación de contraseña
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Correo enviado correctamente
 *       404:
 *         description: Usuario no encontrado
 */



export default router;
