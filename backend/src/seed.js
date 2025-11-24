const { pool } = require('../config/db');

// Mock Data (Copied from data.js for seeding purposes)
const MOCK_DATA = {
    users: [
        {
            full_name: "Daniel User",
            email: "daniel@example.com",
            password: "password", // Will be hashed in real app, but for seed we might need to hash it or insert directly if we handle it. 
            // For simplicity in seed, let's assume we insert a raw hash or use a helper if we had bcrypt here.
            // Let's use a placeholder hash for 'password'
            password_hash: "$2b$10$YourHashedPasswordHere...",
            role: "student"
        }
    ],
    institutions: [
        {
            name: "Tech University",
            logo_url: "https://ui-avatars.com/api/?name=Tech+University&background=0D8ABC&color=fff",
            description: "Líderes en formación tecnológica y digital.",
            rating: 4.8
        },
        {
            name: "Business School Global",
            logo_url: "https://ui-avatars.com/api/?name=BSG&background=6366f1&color=fff",
            description: "Formando a los líderes empresariales del mañana.",
            rating: 4.9
        },
        {
            name: "Design Institute",
            logo_url: "https://ui-avatars.com/api/?name=DI&background=ec4899&color=fff",
            description: "Creatividad e innovación en cada curso.",
            rating: 4.7
        }
    ],
    courses: [
        {
            title: "Full Stack Web Development Bootcamp",
            institution_index: 0, // Reference to MOCK_DATA.institutions index
            price: 299,
            currency: "USD",
            rating: 4.9,
            reviews_count: 128,
            category: "Tecnología",
            image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
            description: "Domina el desarrollo web moderno con React, Node.js y más.",
            full_description: "Este bootcamp intensivo te llevará desde cero hasta experto en desarrollo web Full Stack.",
            syllabus: JSON.stringify(["HTML/CSS", "JavaScript", "React", "Node.js", "SQL/NoSQL"]),
            dates: JSON.stringify(["2024-06-01", "2024-08-01"]),
            mode: "Online",
            duration: "12 Semanas"
        },
        {
            title: "Master en Gestión de Proyectos Ágiles",
            institution_index: 1,
            price: 450,
            currency: "USD",
            rating: 4.8,
            reviews_count: 85,
            category: "Negocios",
            image_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
            description: "Aprende Scrum, Kanban y liderazgo de equipos de alto rendimiento.",
            full_description: "Conviértete en un experto en metodologías ágiles.",
            syllabus: JSON.stringify(["Scrum", "Kanban", "Liderazgo"]),
            dates: JSON.stringify(["2024-05-15"]),
            mode: "Híbrido",
            duration: "6 Meses"
        },
        {
            title: "UX/UI Design Fundamentals",
            institution_index: 2,
            price: 199,
            currency: "USD",
            rating: 4.7,
            reviews_count: 210,
            category: "Diseño",
            image_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80",
            description: "Crea experiencias de usuario impactantes y diseños visuales atractivos.",
            full_description: "Sumérgete en el mundo del diseño de experiencia de usuario e interfaz.",
            syllabus: JSON.stringify(["Design Thinking", "Wireframing", "Prototyping"]),
            dates: JSON.stringify(["2024-06-10"]),
            mode: "Online",
            duration: "8 Semanas"
        }
    ]
};

const seed = async () => {
    try {
        console.log('Seeding database...');

        // Clear existing data
        await pool.query('TRUNCATE TABLE user_registered_courses, user_saved_courses, certificates, courses, institutions, users RESTART IDENTITY CASCADE');

        // Insert Users
        // Note: In a real scenario, use bcrypt to hash the password
        // const hash = await bcrypt.hash('password', 10);
        const passwordHash = '$2b$10$X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7'; // Dummy hash for 'password'

        for (const user of MOCK_DATA.users) {
            await pool.query(
                'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
                [user.full_name, user.email, passwordHash, user.role]
            );
        }
        console.log('Users seeded');

        // Insert Institutions
        const institutionIds = [];
        for (const inst of MOCK_DATA.institutions) {
            const res = await pool.query(
                'INSERT INTO institutions (name, logo_url, description, rating) VALUES ($1, $2, $3, $4) RETURNING id',
                [inst.name, inst.logo_url, inst.description, inst.rating]
            );
            institutionIds.push(res.rows[0].id);
        }
        console.log('Institutions seeded');

        // Insert Courses
        for (const course of MOCK_DATA.courses) {
            const instId = institutionIds[course.institution_index];
            await pool.query(
                `INSERT INTO courses 
                (institution_id, title, price, currency, rating, reviews_count, category, image_url, description, full_description, syllabus, dates, mode, duration) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                [
                    instId,
                    course.title,
                    course.price,
                    course.currency,
                    course.rating,
                    course.reviews_count,
                    course.category,
                    course.image_url,
                    course.description,
                    course.full_description,
                    course.syllabus,
                    course.dates,
                    course.mode,
                    course.duration
                ]
            );
        }
        console.log('Courses seeded');

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seed();
