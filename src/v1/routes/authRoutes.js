import express from "express";

import { register, login, deleteAccount, getUserByUsername, getUsers, deleteAccountById } from "../controllers/authController.js";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware.js";

const router = express.Router();

//GET | localhost:3868/api/v1/auth/users
router.get('/users', authenticateToken, authorizeRole('admin'), getUsers);

//GET | localhost:3868/api/v1/auth/user/:username
router.get('/user/:username', authenticateToken, authorizeRole('admin'), getUserByUsername);

//DELETE | localhost:3868/api/v1/auth/user/:uuid
router.delete('/user/:uuid', authenticateToken, authorizeRole('admin'), deleteAccountById);

//POST | localhost:3868/api/v1/auth/register
router.post('/register', authenticateToken, authorizeRole('admin'), register);

//POST | localhost:3868/api/v1/auth/login
router.post('/login', login);

//DELETE | localhost:3868/api/v1/auth/delete
router.delete('/delete', authenticateToken, authorizeRole('admin'), deleteAccount);

export default router;