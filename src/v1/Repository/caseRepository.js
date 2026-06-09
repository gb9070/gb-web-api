import { getConnection, getPool } from "../data/db.js";
import { randomUUID } from "crypto";

export async function createCase(
    name,
    description,
    priority,
    recipientAccountUuid,
    ownerAccountUuid,
    status = "OPEN"
) {
    const caseId = randomUUID();

    const pool = await getPool();

    await pool.query(
        `INSERT INTO cases (
            uuid,
            name,
            description,
            priority,
            recipient_account_uuid,
            owner_account_uuid,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            caseId,
            name,
            description,
            priority,
            recipientAccountUuid,
            ownerAccountUuid,
            status
        ]
    );

    return { uuid: caseId };
}

export async function fetchCase(caseId) {
    const pool = await getPool();

    const [rows] = await pool.query(
        `SELECT *
         FROM cases
         WHERE uuid = ?`,
        [caseId]
    );

    if (rows.length === 0) {
        return null;
    }

    return {
        uuid: rows[0].uuid,
        name: rows[0].name,
        description: rows[0].description,
        priority: rows[0].priority,
        recipientAccountUuid: rows[0].recipient_account_uuid,
        ownerAccountUuid: rows[0].owner_account_uuid,
        status: rows[0].status
    };
}

export async function fetchCases() {
    const pool = await getPool();

    const [rows] = await pool.query(
        `SELECT *
         FROM cases`
    );

    return rows.map(c => ({
        uuid: c.uuid,
        name: c.name,
        description: c.description,
        priority: c.priority,
        recipientAccountUuid: c.recipient_account_uuid,
        ownerAccountUuid: c.owner_account_uuid,
        status: c.status
    }));
}

export async function fetchCasesByOwner(ownerAccountUuid) {
    const pool = await getPool();

    const [rows] = await pool.query(
        `SELECT *
         FROM cases
         WHERE owner_account_uuid = ?`,
        [ownerAccountUuid]
    );

    return rows.map(c => ({
        uuid: c.uuid,
        name: c.name,
        description: c.description,
        priority: c.priority,
        recipientAccountUuid: c.recipient_account_uuid,
        ownerAccountUuid: c.owner_account_uuid,
        status: c.status
    }));
}

export async function fetchCasesByRecipient(recipientAccountUuid) {
    const pool = await getPool();

    const [rows] = await pool.query(
        `SELECT *
         FROM cases
         WHERE recipient_account_uuid = ?`,
        [recipientAccountUuid]
    );

    return rows.map(c => ({
        uuid: c.uuid,
        name: c.name,
        description: c.description,
        priority: c.priority,
        recipientAccountUuid: c.recipient_account_uuid,
        ownerAccountUuid: c.owner_account_uuid,
        status: c.status
    }));
}

export async function updateCase(
    caseId,
    {
        name,
        description,
        priority,
        recipientAccountUuid,
        ownerAccountUuid,
        status
    }
) {
    const pool = await getPool();

    await pool.query(
        `UPDATE cases
         SET
            name = ?,
            description = ?,
            priority = ?,
            recipient_account_uuid = ?,
            owner_account_uuid = ?,
            status = ?
         WHERE uuid = ?`,
        [
            name,
            description,
            priority,
            recipientAccountUuid,
            ownerAccountUuid,
            status,
            caseId
        ]
    );
}

export async function deleteCase(caseId) {
    const pool = await getPool();

    await pool.query(
        `DELETE FROM cases
         WHERE uuid = ?`,
        [caseId]
    );
}

export async function patchCase(caseId, updates) {
    const pool = await getPool();

    const fields = [];
    const values = [];

    if (updates.status !== undefined) {
        fields.push("status = ?");
        values.push(updates.status);
    }

    if (updates.priority !== undefined) {
        fields.push("priority = ?");
        values.push(updates.priority);
    }

    if (updates.description !== undefined) {
        fields.push("description = ?");
        values.push(updates.description);
    }

    if (updates.ownerAccountUuid !== undefined) {
        fields.push("owner_account_uuid = ?");
        values.push(updates.ownerAccountUuid);
    }

    if (fields.length === 0) {
        throw new Error("No updates provided");
    }

    values.push(caseId);

    const [result] = await pool.query(
        `UPDATE cases
         SET ${fields.join(", ")}
         WHERE uuid = ?`,
        values
    );

    if (result.affectedRows === 0) {
        throw new Error("Case not found");
    }
}