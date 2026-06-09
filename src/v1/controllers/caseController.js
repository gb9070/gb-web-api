import {
    createCase,
    fetchCase,
    fetchCases,
    fetchCasesByOwner,
    fetchCasesByRecipient,
    patchCase,
    deleteCase
} from "../Repository/caseRepository.js";

export const createNewCase = async (req, res) => {
    try {
        const {
            name,
            description,
            priority,
            recipientAccountUuid,
            ownerAccountUuid,
            status
        } = req.body;

        const result = await createCase(
            name,
            description,
            priority,
            recipientAccountUuid,
            ownerAccountUuid,
            status
        );

        return res.status(201).json({
            uuid: result.uuid,
            name,
            description,
            priority,
            recipientAccountUuid,
            ownerAccountUuid,
            status
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const getCase = async (req, res) => {
    const { uuid } = req.params;

    if (!uuid) {
        return res.status(400).json({
            error: "Case UUID required"
        });
    }

    try {
        const foundCase = await fetchCase(uuid);

        if (!foundCase) {
            return res.status(404).json({
                error: "Case not found"
            });
        }

        return res.status(200).json(foundCase);

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const getCases = async (req, res) => {
    try {
        const cases = await fetchCases();

        return res.status(200).json(cases);

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const getCasesByOwner = async (req, res) => {
    const { ownerUuid } = req.params;

    if (!ownerUuid) {
        return res.status(400).json({
            error: "Owner UUID required"
        });
    }

    try {
        const cases = await fetchCasesByOwner(ownerUuid);

        return res.status(200).json(cases);

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const getCasesByRecipient = async (req, res) => {
    const { recipientUuid } = req.params;

    if (!recipientUuid) {
        return res.status(400).json({
            error: "Recipient UUID required"
        });
    }

    try {
        const cases = await fetchCasesByRecipient(recipientUuid);

        return res.status(200).json(cases);

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const updateCase = async (req, res) => {
    const { uuid } = req.params;

    if (!uuid) {
        return res.status(400).json({
            error: "Case UUID required"
        });
    }

    try {
        const existingCase = await fetchCase(uuid);

        if (!existingCase) {
            return res.status(404).json({
                error: "Case not found"
            });
        }

        await patchCase(uuid, req.body);

        const updatedCase = await fetchCase(uuid);

        return res.status(200).json(updatedCase);

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const removeCase = async (req, res) => {
    const { uuid } = req.params;

    if (!uuid) {
        return res.status(400).json({
            error: "Case UUID required"
        });
    }

    try {
        const existingCase = await fetchCase(uuid);

        if (!existingCase) {
            return res.status(404).json({
                error: "Case not found"
            });
        }

        await deleteCase(uuid);

        return res.status(200).json({
            message: "Case deleted"
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};