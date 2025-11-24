const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

describe('API Endpoints', () => {

    // Mock DB for tests (or use a test DB in real scenario)
    // For this MVP test, we assume the DB is running or we mock the pool.
    // Since we can't easily mock pg pool here without rewiring, 
    // we will skip DB-dependent tests if DB is not reachable, 
    // or we can mock the app.

    // Actually, let's mock the pool query to avoid needing a real DB for CI
    jest.mock('../src/config/db', () => ({
        pool: {
            query: jest.fn()
        }
    }));

    // Re-require to apply mock
    const { pool } = require('../src/config/db');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/courses', () => {
        it('should return a list of courses', async () => {
            const mockCourses = [{ id: 1, title: 'Test Course' }];
            pool.query.mockResolvedValue({ rows: mockCourses });

            const res = await request(app).get('/api/courses');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockCourses);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should fail with invalid credentials', async () => {
            pool.query.mockResolvedValue({ rows: [] }); // User not found

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'wrong@example.com', password: 'wrong' });

            expect(res.statusCode).toEqual(400);
        });
    });
});
