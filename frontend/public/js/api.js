const API_URL = '/api';

const api = {
    token: localStorage.getItem('token'),

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': this.token ? `Bearer ${this.token}` : ''
        };
    },

    async login(email, password) {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Login failed');
        const data = await res.json();
        this.token = data.token;
        localStorage.setItem('token', data.token);
        return data.user;
    },

    async register(email, password, fullName) {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify({ email, password, fullName }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Registration failed');
        const data = await res.json();
        this.token = data.token;
        localStorage.setItem('token', data.token);
        return data.user;
    },

    async getCourses(params = {}) {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_URL}/courses?${query}`);
        return res.json();
    },

    async getCourse(id) {
        const res = await fetch(`${API_URL}/courses/${id}`);
        if (!res.ok) throw new Error('Course not found');
        return res.json();
    },

    async getInstitutions() {
        const res = await fetch(`${API_URL}/institutions`);
        return res.json();
    },

    async getMe() {
        const res = await fetch(`${API_URL}/me`, { headers: this.getHeaders() });
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
    },

    async toggleSave(courseId) {
        const res = await fetch(`${API_URL}/me/saved`, {
            method: 'POST',
            body: JSON.stringify({ courseId }),
            headers: this.getHeaders()
        });
        return res.json();
    },

    async registerCourse(courseId) {
        const res = await fetch(`${API_URL}/me/registrations`, {
            method: 'POST',
            body: JSON.stringify({ courseId }),
            headers: this.getHeaders()
        });
        return res.json();
    }
};

// Expose to window for app.js to use
window.api = api;
