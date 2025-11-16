const { Card } = require('../../dbConn');

const getCardByOracleId = async (req, res) => {
    const { id } = req.params;
    try {
        const card = await Card.findOne({ where: { oracleId: id } });
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.json(card);
    } catch (error) {
        console.error('Error fetching card by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }   
};
module.exports = getCardByOracleId;
