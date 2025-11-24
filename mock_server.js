const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
// Adjusted path to point to the new frontend location
const PUBLIC_DIR = path.join(__dirname, 'frontend/public');

// --- MOCK DATA STORE (In-Memory Database) ---
const MOCK_DATA = {
    users: [
        {
            id: 1,
            name: "Daniel User",
            email: "daniel@example.com",
            role: "student",
            savedCourses: [1, 3],
            registeredCourses: [2],
            certificates: [
                { id: 101, courseId: 2, url: "#", date: "2024-01-15" }
            ]
        }
    ],
    institutions: [
        {
            id: 1,
            name: "Tech University",
            logo: "https://ui-avatars.com/api/?name=Tech+University&background=0D8ABC&color=fff",
            description: "Líderes en formación tecnológica y digital.",
            rating: 4.8
        },
        {
            id: 2,
            name: "Business School Global",
            logo: "https://ui-avatars.com/api/?name=BSG&background=6366f1&color=fff",
            description: "Formando a los líderes empresariales del mañana.",
            rating: 4.9
        },
        {
            id: 3,
            name: "Design Institute",
            logo: "https://ui-avatars.com/api/?name=DI&background=ec4899&color=fff",
            description: "Creatividad e innovación en cada curso.",
            rating: 4.7
        }
    ],
    courses: [
        {
            id: 1,
            title: "Full Stack Web Development Bootcamp",
            institutionId: 1,
            price: 299,
            currency: "USD",
            rating: 4.9,
            reviews: 128,
            category: "Tecnología",
            image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
            description: "Domina el desarrollo web moderno con React, Node.js y más.",
            fullDescription: "Este bootcamp intensivo te llevará desde cero hasta experto en desarrollo web Full Stack.",
            syllabus: ["HTML/CSS", "JavaScript", "React", "Node.js", "SQL/NoSQL"],
            dates: ["2024-06-01", "2024-08-01"],
            mode: "Online",
            duration: "12 Semanas"
        },
        {
            id: 2,
            title: "Master en Gestión de Proyectos Ágiles",
            institutionId: 2,
            price: 450,
            currency: "USD",
            rating: 4.8,
            reviews: 85,
            category: "Negocios",
            image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
            description: "Aprende Scrum, Kanban y liderazgo de equipos de alto rendimiento.",
            fullDescription: "Conviértete en un experto en metodologías ágiles.",
            syllabus: ["Scrum", "Kanban", "Liderazgo"],
            dates: ["2024-05-15"],
            mode: "Híbrido",
            duration: "6 Meses"
        },
        {
            id: 3,
            title: "UX/UI Design Fundamentals",
            institutionId: 3,
            price: 199,
            currency: "USD",
            rating: 4.7,
            reviews: 210,
            category: "Diseño",
            image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80",
            description: "Crea experiencias de usuario impactantes y diseños visuales atractivos.",
            fullDescription: "Sumérgete en el mundo del diseño de experiencia de usuario e interfaz.",
            syllabus: ["Design Thinking", "Wireframing", "Prototyping"],
            dates: ["2024-06-10"],
            mode: "Online",
            duration: "8 Semanas"
        }
    ]
};

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
};

// Helper to send JSON response
const sendJSON = (res, data, status = 200) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

// Helper to parse body
const parseBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                resolve({});
            }
        });
    });
};

const server = http.createServer(async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // --- API ROUTES ---
    if (req.url.startsWith('/api/')) {
        try {
            // Auth: Login
            if (req.url === '/api/auth/login' && req.method === 'POST') {
                const body = await parseBody(req);
                const user = MOCK_DATA.users.find(u => u.email === body.email);
                if (user) {
                    return sendJSON(res, { token: 'mock-jwt-token', user });
                }
                return sendJSON(res, { message: 'Invalid credentials' }, 401);
            }

            // Auth: Register
            if (req.url === '/api/auth/register' && req.method === 'POST') {
                return sendJSON(res, { token: 'mock-jwt-token', user: MOCK_DATA.users[0] });
            }

            // Get Me
            if (req.url === '/api/me' && req.method === 'GET') {
                return sendJSON(res, MOCK_DATA.users[0]);
            }

            // Get Courses
            if (req.url.startsWith('/api/courses') && req.method === 'GET') {
                const url = new URL(req.url, `http://${req.headers.host}`);
                const id = url.pathname.split('/')[3];

                if (id) {
                    const course = MOCK_DATA.courses.find(c => c.id === parseInt(id));
                    if (course) return sendJSON(res, course);
                    return sendJSON(res, { message: 'Not found' }, 404);
                }
                return sendJSON(res, MOCK_DATA.courses);
            }

            // Get Institutions
            if (req.url.startsWith('/api/institutions') && req.method === 'GET') {
                return sendJSON(res, MOCK_DATA.institutions);
            }

            // Toggle Saved
            if (req.url === '/api/me/saved' && req.method === 'POST') {
                const body = await parseBody(req);
                const user = MOCK_DATA.users[0];
                const index = user.savedCourses.indexOf(body.courseId);
                let saved = false;
                if (index === -1) {
                    user.savedCourses.push(body.courseId);
                    saved = true;
                } else {
                    user.savedCourses.splice(index, 1);
                    saved = false;
                }
                return sendJSON(res, { saved });
            }

            // Register Course
            if (req.url === '/api/me/registrations' && req.method === 'POST') {
                const body = await parseBody(req);
                const user = MOCK_DATA.users[0];
                if (!user.registeredCourses.includes(body.courseId)) {
                    user.registeredCourses.push(body.courseId);
                }
                return sendJSON(res, { message: 'Enrolled' });
            }

            return sendJSON(res, { message: 'Not Found' }, 404);

        } catch (err) {
            console.error(err);
            return sendJSON(res, { message: 'Server Error' }, 500);
        }
    }

    // --- STATIC FILE SERVING ---
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);

    // Prevent directory traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // SPA Fallback: If file not found and it's not an asset, serve index.html
                if (!extname || extname === '.html') {
                    fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err, content) => {
                        if (err) {
                            res.writeHead(500);
                            res.end('Error loading index.html');
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(content, 'utf-8');
                        }
                    });
                } else {
                    res.writeHead(404);
                    res.end('Not Found');
                }
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
