const { pool } = require('../config/db');

exports.getAllCourses = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = 'SELECT * FROM courses';
        const params = [];

        if (category || search) {
            query += ' WHERE';
            const conditions = [];
            if (category) {
                params.push(category);
                conditions.push(` category = $${params.length}`);
            }
            if (search) {
                params.push(`%${search}%`);
                conditions.push(` (title ILIKE $${params.length} OR description ILIKE $${params.length})`);
            }
            query += conditions.join(' AND');
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCourseById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
