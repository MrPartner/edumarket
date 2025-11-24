const { pool } = require('../config/db');

exports.getMe = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, full_name as name, role, avatar_url FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = result.rows[0];

        // Fetch saved courses IDs
        const savedRes = await pool.query('SELECT course_id FROM user_saved_courses WHERE user_id = $1', [user.id]);
        user.savedCourses = savedRes.rows.map(r => r.course_id);

        // Fetch registered courses IDs
        const regRes = await pool.query('SELECT course_id FROM user_registered_courses WHERE user_id = $1', [user.id]);
        user.registeredCourses = regRes.rows.map(r => r.course_id);

        // Fetch certificates
        const certRes = await pool.query('SELECT id, course_id, url, date FROM certificates WHERE user_id = $1', [user.id]);
        user.certificates = certRes.rows;

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.toggleSavedCourse = async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.id;
    try {
        // Check if saved
        const check = await pool.query('SELECT * FROM user_saved_courses WHERE user_id = $1 AND course_id = $2', [userId, courseId]);

        if (check.rows.length > 0) {
            // Remove
            await pool.query('DELETE FROM user_saved_courses WHERE user_id = $1 AND course_id = $2', [userId, courseId]);
            res.json({ message: 'Removed from saved', saved: false });
        } else {
            // Add
            await pool.query('INSERT INTO user_saved_courses (user_id, course_id) VALUES ($1, $2)', [userId, courseId]);
            res.json({ message: 'Added to saved', saved: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.registerCourse = async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.id;
    try {
        await pool.query('INSERT INTO user_registered_courses (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, courseId]);
        res.json({ message: 'Enrolled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
