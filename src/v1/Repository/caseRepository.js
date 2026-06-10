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

    const [rows] = await pool.query(`
        SELECT
            c.*,

            owner.uuid AS owner_uuid,
            owner.username AS owner_username,
            owner.email AS owner_email,

            recipient.uuid AS recipient_uuid,
            recipient.username AS recipient_username,
            recipient.email AS recipient_email

        FROM cases c
        LEFT JOIN account owner
            ON owner.uuid = c.owner_account_uuid
        LEFT JOIN account recipient
            ON recipient.uuid = c.recipient_account_uuid
        WHERE c.uuid = ?
    `, [caseId]);

    if (rows.length === 0) {
        return null;
    }

    const row = rows[0];

    return {
        uuid: row.uuid,
        name: row.name,
        description: row.description,
        priority: row.priority,
        recipientAccountUuid: row.recipient_account_uuid,
        ownerAccountUuid: row.owner_account_uuid,
        status: row.status,

        ownerAccount: row.owner_uuid
            ? {
                uuid: row.owner_uuid,
                username: row.owner_username,
                email: row.owner_email
            }
            : null,

        recipientAccount: row.recipient_uuid
            ? {
                uuid: row.recipient_uuid,
                username: row.recipient_username,
                email: row.recipient_email
            }
            : null
    };
}

export async function fetchCases() {
    const pool = await getPool();

    const [rows] = await pool.query(`
        SELECT
            c.*,

            owner.uuid AS owner_uuid,
            owner.username AS owner_username,
            owner.email AS owner_email,

            recipient.uuid AS recipient_uuid,
            recipient.username AS recipient_username,
            recipient.email AS recipient_email

        FROM cases c
        LEFT JOIN account owner
            ON owner.uuid = c.owner_account_uuid
        LEFT JOIN account recipient
            ON recipient.uuid = c.recipient_account_uuid
    `);

    return rows.map(row => ({
        uuid: row.uuid,
        name: row.name,
        description: row.description,
        priority: row.priority,
        recipientAccountUuid: row.recipient_account_uuid,
        ownerAccountUuid: row.owner_account_uuid,
        status: row.status,

        ownerAccount: row.owner_uuid
            ? {
                uuid: row.owner_uuid,
                username: row.owner_username,
                email: row.owner_email
            }
            : null,

        recipientAccount: row.recipient_uuid
            ? {
                uuid: row.recipient_uuid,
                username: row.recipient_username,
                email: row.recipient_email
            }
            : null
    }));
}

export async function fetchCasesByOwner(ownerAccountUuid) {
    const cases = await fetchCases();

    return cases.filter(
        c => c.ownerAccountUuid === ownerAccountUuid
    );
}

export async function fetchCasesByRecipient(recipientAccountUuid) {
    const cases = await fetchCases();

    return cases.filter(
        c => c.recipientAccountUuid === recipientAccountUuid
    );
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