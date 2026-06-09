import { getConnection, getPool } from "../data/db.js";
import { randomUUID } from "crypto";

export async function createUser(email, username, passwordHash, roles = []) {
    const accountId = randomUUID();
    const credentialId = randomUUID();

    const pool = await getPool();

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Create account
        await conn.query(
            `INSERT INTO account (uuid, email, username, created_at, updated_at)
             VALUES (?, ?, ?, NOW(), NOW());`,
            [accountId, email, username]
        );

        // 2. Store password
        await conn.query(
            `INSERT INTO auth_credentials (uuid, account_uuid, password_hash)
             VALUES (?, ?, ?);`,
            [credentialId, accountId, passwordHash]
        );

        // 3. Resolve role names → UUIDs
        for (const roleName of roles) {
            const [roleRows] = await conn.query(
                `SELECT uuid FROM ROLE WHERE name = ?`,
                [roleName]
            );

            let roleId;

            if (roleRows.length === 0) {
                roleId = randomUUID();

                await conn.query(
                    `INSERT INTO role (uuid, name, description)
                    VALUES (?, ?, ?);`,
                    [roleId, roleName, `${roleName} role`]
                );
            } else {
                roleId = roleRows[0].uuid;
            }

            await conn.query(
                `INSERT INTO account_role (account_uuid, role_uuid, assigned_at)
                 VALUES (?, ?, NOW());`,
                [accountId, roleId]
            );
        }

        await conn.commit();
        return { uuid: accountId };

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}

export async function fetchUser(username) {
    const pool = await getPool();

    try {
        const [rows] = await pool.query(
            `SELECT 
                a.uuid,
                a.email,
                a.username,
                ac.password_hash,
                a.created_at,
                a.updated_at,
                COALESCE(GROUP_CONCAT(DISTINCT r.name), '') AS roles
             FROM account a
             LEFT JOIN auth_credentials ac ON ac.account_uuid = a.uuid
             LEFT JOIN account_role ar ON ar.account_uuid = a.uuid
             LEFT JOIN role r ON r.uuid = ar.role_uuid
             WHERE a.username = ?
             GROUP BY 
                a.uuid,
                a.email,
                a.username,
                ac.password_hash,
                a.created_at,
                a.updated_at;`,
            [username]
        );

        const user = rows[0];

        if (!user) return null;

        return {
            uuid: user.uuid,
            email: user.email,
            username: user.username,
            passwordHash: user.password_hash,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            roles: user.roles ? user.roles.split(",") : []
        };

    } catch (error) {
        throw error;
    }
}
export async function deleteUserById(userId) {
    const pool = await getPool();

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        await conn.query(
            `DELETE FROM account_role WHERE account_uuid = ?`,
            [userId]
        );

        await conn.query(
            `DELETE FROM auth_credentials WHERE account_uuid = ?`,
            [userId]
        );

        await conn.query(
            `DELETE FROM account WHERE uuid = ?`,
            [userId]
        );

        await conn.commit();

    } catch (error) {
        await conn.rollback();
        throw error;

    } finally {
        conn.release();
    }
}

export async function fetchUsers() {
    const pool = await getPool();

    try {
        const [rows] = await pool.query(
            `SELECT 
                a.uuid,
                a.email,
                a.username,
                a.created_at,
                a.updated_at,
                COALESCE(GROUP_CONCAT(DISTINCT r.name), '') AS roles
             FROM account a
             LEFT JOIN account_role ar ON ar.account_uuid = a.uuid
             LEFT JOIN role r ON r.uuid = ar.role_uuid
             GROUP BY 
                a.uuid, 
                a.email, 
                a.username, 
                a.created_at, 
                a.updated_at`
        );

        return rows.map(u => ({
            uuid: u.uuid,
            email: u.email,
            username: u.username,
            createdAt: u.created_at,
            updatedAt: u.updated_at,
            roles: u.roles ? u.roles.split(",") : []
        }));

    } catch (error) {
        throw error;
    }
}

export async function deleteUserByUsername(username) {
    const pool = await getPool();

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const [rows] = await conn.query(
            `SELECT uuid FROM account WHERE username = ?`,
            [username]
        );

        if (rows.length === 0) {
            throw new Error("User not found");
        }

        const userId = rows[0].uuid;

        await conn.query(
            `DELETE FROM account_role WHERE account_uuid = ?`,
            [userId]
        );

        await conn.query(
            `DELETE FROM auth_credentials WHERE account_uuid = ?`,
            [userId]
        );

        await conn.query(
            `DELETE FROM account WHERE uuid = ?`,
            [userId]
        );

        await conn.commit();

    } catch (error) {
        await conn.rollback();
        throw error;

    } finally {
        conn.release();
    }
}