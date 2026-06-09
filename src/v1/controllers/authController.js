import { createUser, fetchUser, deleteUserById, deleteUserByUsername, fetchUsers } from "../Repository/accountRepository.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { email, username, password, roles = [] } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await createUser(email, username, hashedPassword, roles);

        res.status(201).json({
            uuid: result.uuid,
            email,
            username,
            roles
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    const SECRET_KEY = process.env.JWT_SECRET;

    try {
        const { username, password } = req.body;

        const user = await fetchUser(username);

        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        if (
            !user.passwordHash ||
            !(await bcrypt.compare(password, user.passwordHash))
        ) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const token = jwt.sign(
            {
                uuid: user.uuid,
                username: user.username,
                roles: user.roles
            },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Logged in",
            username: user.username,
            roles: user.roles,
            uuid: user.uuid,
            token: token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteAccount = async (req, res) => {
    const userId = req.user?.uuid;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        await deleteUserById(userId);

        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "lax"
        });

        return res.status(200).json({ message: "Account deleted" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getUserByUsername = async (req, res) => {
    const { username } = req.params;

    if (!username) {
        return res.status(400).json({ error: "Username required" });
    }

    try {
        const rows = await fetchUser(username);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = {
            uuid: rows[0].uuid,
            email: rows[0].email,
            username: rows[0].username,
            createdAt: rows[0].created_at,
            updatedAt: rows[0].updated_at,
            roles: []
        };

        const roleSet = new Set();

        for (const row of rows) {
            if (row.role_name) {
                roleSet.add(row.role_name);
            }
        }

        user.roles = Array.from(roleSet);

        return res.status(200).json(user);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteAccountById = async (req, res) => {
    const { uuid } = req.params;

    if (!uuid) {
        return res.status(400).json({ error: "UUID required" });
    }

    try {
        await deleteUserById(uuid);

        return res.status(200).json({
            message: `User '${uuid}' deleted`
        });

    } catch (err) {
        console.error(err);

        if (err.message === "User not found") {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getUsers = async (req, res) => {
    try {
        const rows = await fetchUsers();

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "No users found" });
        }

        const userMap = new Map();

        for (const row of rows) {
            if (!userMap.has(row.uuid)) {
                userMap.set(row.uuid, {
                    uuid: row.uuid,
                    email: row.email,
                    username: row.username,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                    roles: []
                });
            }

            if (row.roles) {
                const roles = Array.isArray(row.roles)
                    ? row.roles
                    : row.roles.split(",");

                for (const role of roles) {
                    if (role && !userMap.get(row.uuid).roles.includes(role)) {
                        userMap.get(row.uuid).roles.push(role);
                    }
                }
            }
        }

        return res.status(200).json(Array.from(userMap.values()));

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};