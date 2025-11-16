const { Card } = require('../../dbConn');
const { Op } = require('sequelize');

const getCardsByName = async (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: 'Name query parameter is required' });
    }
    
    try {
        const cards = await Card.findAll({ 
            where: { 
                name: {
                    [Op.iLike]: `%${name}%`
                }
            } 
        });
        
        if (cards.length === 0) {
            return res.status(404).json({ error: 'No cards found' });
        }
        
        res.json(cards);
    } catch (error) {
        console.error('Error fetching cards by name:', error);
        res.status(500).json({ error: 'Internal server error' });
    }   
};

module.exports = getCardsByName;
