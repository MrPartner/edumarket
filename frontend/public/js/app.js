// App State
const state = {
    currentPath: window.location.pathname,
    courses: [],
    institutions: [],
    user: null
};

// Helper to save user state (Token is handled by api.js)
// We no longer sync full user object to localStorage, we rely on the token.

// Router
const routes = {
    '/': renderHome,
    '/cursos': renderCourses,
    '/instituciones': renderInstitutions,
    '/soy-institucion': renderInstitutionLanding,
    '/perfil': renderProfile,
    '/login': renderLogin
};

// Expose functions to window for HTML access
window.login = login;
window.logout = logout;
window.navigateTo = navigateTo;

// Actions
async function login() {
    // In a real app, we would get these from a form
    // For this demo refactor, we'll use hardcoded credentials or prompt
    // But since the UI calls login() directly, let's assume we want to trigger the API
    // with the mock credentials for now to test the flow, or better, 
    // update renderLogin to actually handle the form submit.

    // For now, let's update renderLogin to call a new handleLogin function
    // and keep this login() as a placeholder or remove it.
    // But to minimize breakage, let's make login() accept credentials.

    console.error("Login should be handled by the form submit");
}

async function handleLogin(email, password) {
    try {
        const user = await window.api.login(email, password);
        state.user = user;
        showToast(`Bienvenido, ${state.user.full_name || state.user.email}`);
        navigateTo('/perfil');
        updateHeader();
    } catch (err) {
        showToast('Error al iniciar sesión', 'error');
        console.error(err);
    }
}

function logout() {
    state.user = null;
    localStorage.removeItem('token');
    window.api.token = null;
    showToast('Has cerrado sesión');
    updateHeader();
    navigateTo('/');
}

function toggleMobileMenu() {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('active');
}

function updateHeader() {
    const desktopAuth = document.getElementById('desktop-auth-container');
    const mobileAuth = document.getElementById('mobile-auth-container');

    const authHTML = state.user ? `
        <div class="user-menu">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="width: 32px; height: 32px; background: var(--color-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                    ${state.user.name.charAt(0)}
                </div>
                <span style="font-weight: 500;">${state.user.name.split(' ')[0]}</span>
            </div>
            <div class="user-dropdown">
                <a href="/perfil" class="dropdown-item">Mi Perfil</a>
                <a href="/perfil" class="dropdown-item">Mis Cursos</a>
                <div style="border-top: 1px solid var(--color-border); margin: 0.25rem 0;"></div>
                <button onclick="logout()" class="dropdown-item" style="width: 100%; text-align: left; color: var(--color-error);">Cerrar Sesión</button>
            </div>
        </div>
    ` : `
        <a href="/login" class="btn btn-primary">Ingresar</a>
    `;

    const mobileAuthHTML = state.user ? `
        <div style="text-align: center; width: 100%;">
            <div style="margin-bottom: 1rem; font-weight: bold;">Hola, ${state.user.name}</div>
            <a href="/perfil" class="btn btn-outline" style="width: 100%; margin-bottom: 0.5rem;">Mi Perfil</a>
            <button onclick="logout()" class="btn btn-outline" style="width: 100%; border-color: var(--color-error); color: var(--color-error);">Cerrar Sesión</button>
        </div>
    ` : `
        <a href="/login" class="btn btn-primary" style="width: 100%;">Ingresar</a>
    `;

    if (desktopAuth) desktopAuth.innerHTML = authHTML;
    if (mobileAuth) mobileAuth.innerHTML = mobileAuthHTML;
}

// Actions
async function toggleSave(courseId) {
    if (!state.user) {
        showToast('Debes iniciar sesión para guardar cursos', 'warning');
        return navigateTo('/login');
    }

    try {
        const res = await window.api.toggleSave(courseId);

        // Update local state based on response
        if (res.saved) {
            state.user.savedCourses.push(courseId);
            showToast('Curso guardado en tu perfil');
        } else {
            const index = state.user.savedCourses.indexOf(courseId);
            if (index > -1) state.user.savedCourses.splice(index, 1);
            showToast('Curso eliminado de guardados');
        }

        updateHeader();

        // Re-render
        const currentRenderer = routes[state.currentPath];
        if (state.currentPath.startsWith('/curso/')) {
            renderCourseDetail(parseInt(state.currentPath.split('/')[2]));
        } else if (currentRenderer) {
            currentRenderer();
        }
    } catch (err) {
        showToast('Error al guardar curso', 'error');
    }
}

async function register(courseId) {
    if (!state.user) {
        showToast('Debes iniciar sesión para inscribirte', 'warning');
        return navigateTo('/login');
    }

    if (state.user.registeredCourses.includes(courseId)) {
        showToast('Ya estás inscrito en este curso', 'info');
        return;
    }

    // Show confirmation modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Confirmar Inscripción</h2>
            <p>¿Estás seguro que deseas inscribirte a este curso?</p>
            <div class="modal-actions">
                <button class="btn btn-outline" id="cancel-register">Cancelar</button>
                <button class="btn btn-primary" id="confirm-register">Confirmar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancel-register').onclick = () => modal.remove();

    document.getElementById('confirm-register').onclick = async () => {
        try {
            await window.api.registerCourse(courseId);
            state.user.registeredCourses.push(courseId);
            modal.remove();
            showToast('¡Inscripción exitosa!', 'success');
            handleRoute(state.currentPath);
        } catch (err) {
            showToast('Error al inscribirse', 'error');
            modal.remove();
        }
    };
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Init
async function init() {
    try {
        // Load initial data
        const [courses, institutions] = await Promise.all([
            window.api.getCourses(),
            window.api.getInstitutions()
        ]);
        state.courses = courses;
        state.institutions = institutions;

        // Check auth
        if (window.api.token) {
            try {
                const user = await window.api.getMe();
                state.user = user;
            } catch (err) {
                console.warn('Token invalid or expired');
                localStorage.removeItem('token');
            }
        }
    } catch (err) {
        console.error('Failed to initialize app:', err);
        showToast('Error de conexión con el servidor', 'error');
    }

    // Handle initial route
    handleRoute(window.location.pathname);

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks && navLinks.classList.contains('active') &&
            !navLinks.contains(e.target) &&
            !mobileMenuBtn.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });

    // Browser back/forward support
    window.addEventListener('popstate', () => {
        state.currentPath = window.location.pathname;
        handleRoute(window.location.pathname);
    });

    updateHeader();
}

function navigateTo(path) {
    window.history.pushState({}, '', path);
    handleRoute(path);
}

function handleRoute(path) {
    state.currentPath = path;

    // Update Active Nav Link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === path);
    });

    // Dynamic Routes
    if (path.startsWith('/curso/')) {
        const id = parseInt(path.split('/')[2]);
        renderCourseDetail(id);
        return;
    }

    if (path.startsWith('/institucion/')) {
        const id = parseInt(path.split('/')[2]);
        renderInstitutionDetail(id);
        return;
    }

    // Close mobile menu on navigation
    const navLinks = document.getElementById('nav-links');
    if (navLinks) navLinks.classList.remove('active');

    // Dynamic Title
    const titles = {
        '/': 'EduMarket - Tu Pasaporte de Aprendizaje',
        '/cursos': 'Explora Cursos - EduMarket',
        '/instituciones': 'Instituciones Aliadas - EduMarket',
        '/soy-institucion': 'Para Instituciones - EduMarket',
        '/perfil': 'Mi Perfil - EduMarket',
        '/login': 'Iniciar Sesión - EduMarket'
    };

    if (path.startsWith('/curso/')) {
        document.title = 'Detalle del Curso - EduMarket';
    } else if (path.startsWith('/institucion/')) {
        document.title = 'Detalle de Institución - EduMarket';
    } else {
        document.title = titles[path] || 'EduMarket';
    }

    const renderer = routes[path] || renderNotFound;

    // Fade out effect (optional, simplified for now just fade in new content)
    const main = document.getElementById('main-content');
    main.classList.remove('fade-in');
    void main.offsetWidth; // Trigger reflow
    main.classList.add('fade-in');

    renderer();

    // Scroll to top
    window.scrollTo(0, 0);
}

// Renderers
function renderCourseDetail(id) {
    const course = state.courses.find(c => c.id === id);
    if (!course) return renderNotFound();

    const institution = state.institutions.find(i => i.id === course.institutionId);
    const isSaved = state.user?.savedCourses?.includes(course.id) || false;
    const isRegistered = state.user?.registeredCourses?.includes(course.id) || false;

    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div style="background: linear-gradient(to right, #1a1f2c, #2d3748); color: white; padding: 4rem 0;">
            <div class="container">
                <div style="display: flex; gap: 2rem; align-items: flex-start; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 300px;">
                        <span style="background: var(--color-accent); color: var(--color-text-main); padding: 0.25rem 0.75rem; border-radius: 99px; font-weight: bold; font-size: 0.875rem; text-transform: uppercase;">${course.category}</span>
                        <h1 style="font-size: 2.5rem; margin: 1rem 0; color: white;">${course.title}</h1>
                        <p style="font-size: 1.25rem; color: #cbd5e1; margin-bottom: 2rem;">${course.description}</p>
                        
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                            <img src="${institution.logo}" alt="${institution.name}" style="width: 48px; height: 48px; border-radius: 50%; border: 2px solid white;">
                            <div>
                                <div style="font-weight: bold;">Creado por <a href="/institucion/${institution.id}" style="text-decoration: underline;">${institution.name}</a></div>
                                <div style="font-size: 0.875rem; color: #cbd5e1;">Última actualización: ${course.dates[0]}</div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 2rem; font-size: 0.875rem;">
                            <div>
                                <span style="display: block; color: #94a3b8;">Duración</span>
                                <span style="font-weight: bold;">${course.duration || 'Flexible'}</span>
                            </div>
                            <div>
                                <span style="display: block; color: #94a3b8;">Modalidad</span>
                                <span style="font-weight: bold;">${course.mode}</span>
                            </div>
                            <div>
                                <span style="display: block; color: #94a3b8;">Valoración</span>
                                <span style="font-weight: bold; color: var(--color-warning);">★ ${course.rating} (${course.reviews} reseñas)</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: white; color: var(--color-text-main); padding: 2rem; border-radius: var(--radius-lg); width: 350px; box-shadow: var(--shadow-premium);">
                        <div style="height: 200px; background-image: url('${course.image}'); background-size: cover; border-radius: var(--radius-md); margin-bottom: 1.5rem;"></div>
                        <div style="font-size: 2rem; font-weight: 800; margin-bottom: 1rem;">$${course.price} <span style="font-size: 1rem; font-weight: normal; color: var(--color-text-muted);">${course.currency}</span></div>
                        
                        ${isRegistered
            ? `<button class="btn btn-outline" style="width: 100%; border-color: var(--color-success); color: var(--color-success); cursor: default; margin-bottom: 1rem;">Ya estás inscrito ✓</button>`
            : `<button onclick="register(${course.id})" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;">Inscribirse Ahora</button>`
        }
                        
                        <button onclick="toggleSave(${course.id})" class="btn btn-outline" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                            ${isSaved ? 'Quitar de guardados' : 'Guardar curso'}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="container" style="padding: 4rem 0;">
            <div style="max-width: 800px;">
                <h2 style="margin-bottom: 1.5rem;">Lo que aprenderás</h2>
                <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--color-border); margin-bottom: 3rem;">
                    <p style="margin-bottom: 1rem;">${course.fullDescription || course.description}</p>
                    <ul style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; list-style: none;">
                        ${(course.syllabus || ['Contenido pendiente']).map(item => `
                            <li style="display: flex; gap: 0.5rem;">
                                <span style="color: var(--color-success);">✓</span> ${item}
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <h2 style="margin-bottom: 1.5rem;">Instructor</h2>
                <div style="display: flex; gap: 1.5rem; align-items: center; margin-bottom: 3rem;">
                     <img src="${institution.logo}" alt="${institution.name}" style="width: 80px; height: 80px; border-radius: 50%;">
                     <div>
                        <h3 style="margin-bottom: 0.25rem;">${institution.name}</h3>
                        <p style="color: var(--color-text-muted);">${institution.description}</p>
                     </div>
                </div>
            </div>
        </div>
    `;
}

function renderInstitutionDetail(id) {
    const institution = state.institutions.find(i => i.id === id);
    if (!institution) return renderNotFound();

    const instCourses = state.courses.filter(c => c.institutionId === id);

    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div style="background: white; border-bottom: 1px solid var(--color-border); padding: 4rem 0;">
            <div class="container" style="text-align: center;">
                <img src="${institution.logo}" alt="${institution.name}" style="width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 1.5rem; border: 4px solid white; box-shadow: var(--shadow-lg);">
                <h1 style="margin-bottom: 0.5rem;">${institution.name}</h1>
                <p style="color: var(--color-text-muted); max-width: 600px; margin: 0 auto 1.5rem;">${institution.description}</p>
                <div style="display: inline-flex; gap: 2rem;">
                    <div style="text-align: center;">
                        <div style="font-weight: 800; font-size: 1.5rem;">${instCourses.length}</div>
                        <div style="font-size: 0.875rem; color: var(--color-text-muted);">Cursos Activos</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-weight: 800; font-size: 1.5rem;">${institution.rating}</div>
                        <div style="font-size: 0.875rem; color: var(--color-text-muted);">Valoración</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container" style="padding: 4rem 0;">
            <h2 style="margin-bottom: 2rem;">Cursos de ${institution.name}</h2>
            <div class="course-grid">
                ${instCourses.map(course => createCourseCard(course)).join('')}
            </div>
        </div>
    `;
}

function renderHome() {
    const main = document.getElementById('main-content');

    // Get featured courses (first 3)
    const featuredCourses = state.courses.slice(0, 3);

    main.innerHTML = `
        <section class="hero">
            <div class="container">
                <h1>Descubre tu próximo <span class="text-gradient">salto profesional</span></h1>
                <p>La plataforma líder que conecta estudiantes con las mejores instituciones educativas. Encuentra cursos, talleres y seminarios en un solo lugar.</p>
                <p class="hero-subcopy" style="color: #cbd5e1; font-size: 1.1rem; margin-top: -1rem; margin-bottom: 2rem;">
                    Guarda todos tus cursos y certificados en un solo perfil y construye tu pasaporte de aprendizaje.
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="/cursos" class="btn btn-primary">Explorar Cursos</a>
                    <a href="/soy-institucion" class="btn btn-outline">Soy una Institución</a>
                </div>
            </div>
        </section>

        <section class="passport-section">
            <div class="container" style="text-align: center;">
                <h2 style="color: white; margin-bottom: 1rem;">Tu Pasaporte de Aprendizaje</h2>
                <p style="color: #94a3b8; max-width: 600px; margin: 0 auto 3rem;">Centraliza todos tus logros. Guarda tus certificados, gestiona tu historial académico y comparte tu perfil profesional con el mundo.</p>
                
                <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 1rem;">
                    <div class="passport-badge">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        <span>Certificados Verificados</span>
                    </div>
                    <div class="passport-badge">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                        <span>Perfil Compartible</span>
                    </div>
                    <div class="passport-badge">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        <span>Historial Unificado</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="featured-courses container">
            <div style="display: flex; justify-content: space-between; align-items: end; margin-bottom: var(--spacing-xl);">
                <h2>Cursos Destacados</h2>
                <a href="/cursos" style="color: var(--color-primary); font-weight: 600;">Ver todos &rarr;</a>
            </div>
            <div class="course-grid">
                ${featuredCourses.map(course => createCourseCard(course)).join('')}
            </div>
        </section>
    `;
}

function renderCourses() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="container" style="padding-top: 2rem;">
            <h1>Explorar Cursos</h1>
            <div class="filters">
                <input type="text" placeholder="Buscar cursos..." class="search-input" id="search-input">
                <select class="category-select" id="category-select">
                    <option value="">Todas las categorías</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Negocios">Negocios</option>
                    <option value="Diseño">Diseño</option>
                    <option value="Habilidades Blandas">Habilidades Blandas</option>
                </select>
            </div>
            <div class="course-grid" id="courses-list">
                ${state.courses.map(course => createCourseCard(course)).join('')}
            </div>
        </div>
    `;

    // Add Event Listeners
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('category-select');
    const coursesList = document.getElementById('courses-list');

    function filterCourses() {
        const query = searchInput.value.toLowerCase();
        const category = categorySelect.value;

        const filtered = state.courses.filter(course => {
            const matchesQuery = course.title.toLowerCase().includes(query) ||
                course.description.toLowerCase().includes(query);
            const matchesCategory = category ? course.category === category : true;
            return matchesQuery && matchesCategory;
        });

        if (filtered.length > 0) {
            coursesList.innerHTML = filtered.map(course => createCourseCard(course)).join('');
        } else {
            coursesList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted);">No se encontraron cursos.</p>';
        }
    }

    searchInput.addEventListener('input', filterCourses);
    categorySelect.addEventListener('change', filterCourses);
}

function renderInstitutions() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="container" style="padding-top: 2rem;">
            <h1>Nuestras Instituciones Aliadas</h1>
            <div class="course-grid">
                ${state.institutions.map(inst => `
                    <a href="/institucion/${inst.id}" class="course-card" style="padding: 2rem; text-align: center; display: block; color: inherit;">
                        <img src="${inst.logo}" alt="${inst.name}" style="width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 1rem;">
                        <h3>${inst.name}</h3>
                        <p style="color: var(--color-text-muted); margin-bottom: 1rem;">${inst.description}</p>
                        <div style="color: var(--color-warning); font-weight: bold;">★ ${inst.rating}</div>
                    </a>
                `).join('')}
            </div>
        </div>
    `;
}

function renderInstitutionLanding() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div style="background: var(--color-text-main); color: white; padding: 5rem 0;">
            <div class="container" style="text-align: center;">
                <h1 style="font-size: 3rem; margin-bottom: 1.5rem;">Más alumnos, menos esfuerzo</h1>
                <p style="font-size: 1.25rem; color: #cbd5e1; max-width: 700px; margin: 0 auto 2.5rem;">
                    EduMarket es el canal especializado que conecta tu oferta educativa con miles de estudiantes activos. 
                    Publica tus cursos, gestiona inscripciones y mide tu ROI en tiempo real.
                </p>
                <button class="btn btn-primary" style="padding: 1rem 2rem; font-size: 1.1rem;">Empezar Ahora</button>
            </div>
        </div>

        <div class="container" style="padding: 4rem 0;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem;">
                <div style="text-align: center; padding: 2rem; border: 1px solid var(--color-border); border-radius: var(--radius-lg);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎯</div>
                    <h3>Audiencia Calificada</h3>
                    <p style="color: var(--color-text-muted);">Llega directo a estudiantes y profesionales que buscan activamente formación.</p>
                </div>
                <div style="text-align: center; padding: 2rem; border: 1px solid var(--color-border); border-radius: var(--radius-lg);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                    <h3>Métricas Claras</h3>
                    <p style="color: var(--color-text-muted);">Panel de control con visualizaciones, clics y tasas de conversión.</p>
                </div>
                <div style="text-align: center; padding: 2rem; border: 1px solid var(--color-border); border-radius: var(--radius-lg);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🚀</div>
                    <h3>Posicionamiento</h3>
                    <p style="color: var(--color-text-muted);">Destaca tu marca junto a las mejores instituciones educativas.</p>
                </div>
            </div>
        </div>
    `;
}

function renderProfile() {
    if (!state.user) {
        showToast('Debes iniciar sesión primero', 'warning');
        return navigateTo('/login');
    }

    const main = document.getElementById('main-content');
    const user = state.user;

    // Resolve courses
    const savedCourses = state.courses.filter(c => state.user.savedCourses.includes(c.id));
    const registeredCourses = state.courses.filter(c => state.user.registeredCourses.includes(c.id));

    // Certificates logic
    const certificates = state.user.certificates || [];
    const certificatesHtml = certificates.map(cert => {
        const course = state.courses.find(c => c.id === cert.courseId);
        return `
            <div class="course-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                <div class="course-content">
                    <div class="course-category">Certificado</div>
                    <h3 class="course-title">${course ? course.title : 'Curso Desconocido'}</h3>
                    <p class="course-meta">Completado: ${cert.date}</p>
                </div>
                <div style="padding: 1.5rem; padding-top: 0;">
                    <button class="btn btn-outline" style="width: 100%;">Ver Certificado</button>
                </div>
            </div>
        `;
    }).join('');

    main.innerHTML = `
        <div class="container" style="padding-top: 2rem;">
            <div class="profile-header">
                <div class="profile-avatar">${state.user.name.charAt(0)}</div>
                <div>
                    <h1>${state.user.name}</h1>
                    <p>${state.user.email}</p>
                </div>
            </div>

            <div class="tabs">
                <button class="tab active" onclick="switchTab('registered')">Mis Inscripciones</button>
                <button class="tab" onclick="switchTab('saved')">Guardados</button>
                <button class="tab" onclick="switchTab('certificates')">Mis Certificados</button>
            </div>

            <div id="tab-registered" class="tab-content active">
                ${registeredCourses.length > 0 ?
            `<div class="course-grid">${registeredCourses.map(c => createCourseCard(c)).join('')}</div>` :
            '<p>No tienes inscripciones activas.</p>'}
            </div>

            <div id="tab-saved" class="tab-content">
                ${savedCourses.length > 0 ?
            `<div class="course-grid">${savedCourses.map(c => createCourseCard(c)).join('')}</div>` :
            '<p>No tienes cursos guardados.</p>'}
            </div>

            <div id="tab-certificates" class="tab-content">
                ${certificates.length > 0 ?
            `<div class="course-grid">${certificatesHtml}</div>` :
            '<p>Aún no tienes certificados.</p>'}
            </div>
        </div>
    `;
}

window.switchTab = function (tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Find the button that was clicked (approximate since we don't have the event)
    // In a real app we'd pass the event or use ID
    const buttons = document.querySelectorAll('.tab');
    if (tabName === 'registered') buttons[0].classList.add('active');
    if (tabName === 'saved') buttons[1].classList.add('active');
    if (tabName === 'certificates') buttons[2].classList.add('active');

    document.getElementById(`tab-${tabName}`).classList.add('active');
};

function renderLogin() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="container" style="padding-top: 4rem; max-width: 400px;">
            <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-md);">
                <h1 style="text-align: center; margin-bottom: 2rem;">Iniciar Sesión</h1>
                <form id="login-form">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Email</label>
                        <input type="email" id="login-email" value="daniel@example.com" required style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: var(--radius-md);">
                    </div>
                    <div style="margin-bottom: 2rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Contraseña</label>
                        <input type="password" id="login-password" value="password" required style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: var(--radius-md);">
                    </div>
                    <button type="button" onclick="handleLogin(document.getElementById('login-email').value, document.getElementById('login-password').value)" class="btn btn-primary" style="width: 100%;">Ingresar</button>
                </form>
                <p style="text-align: center; margin-top: 1rem; font-size: 0.875rem; color: var(--color-text-muted);">
                    ¿No tienes cuenta? <a href="#" style="color: var(--color-primary);">Regístrate</a>
                </p>
            </div>
        </div>
    `;
}

function renderNotFound() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="container" style="text-align: center; padding-top: 4rem;">
            <h1>404</h1>
            <p>Página no encontrada</p>
            <a href="/" class="btn btn-primary" style="margin-top: 1rem;">Volver al Inicio</a>
        </div>
    `;
}

// Helper: Create Course Card HTML
function createCourseCard(course) {
    const institution = state.institutions.find(i => i.id === course.institutionId);
    const isSaved = state.user?.savedCourses?.includes(course.id) || false;
    const isRegistered = state.user?.registeredCourses?.includes(course.id) || false;
    const isPopular = course.rating >= 4.8;

    return `
        <div class="course-card">
            <div class="course-image" style="background-image: url('${course.image}');">
                ${isPopular ? '<span style="position: absolute; top: 10px; left: 10px; background: #fbbf24; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">Popular</span>' : ''}
                <button class="btn-save ${isSaved ? 'active' : ''}" onclick="event.preventDefault(); toggleSave(${course.id})" aria-label="Guardar curso">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
            </div>
            <div class="course-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div class="course-category">${course.category}</div>
                    <div style="font-size: 0.75rem; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${course.mode}</div>
                </div>
                <h3 class="course-title">${course.title}</h3>
                <p class="course-institution">${institution ? institution.name : 'Institución'}</p>
                <div class="course-meta">
                    <span class="course-price">$${course.price} ${course.currency}</span>
        }
                </div>
            </div>
        </div>
    `;
}

// Initialize App
document.addEventListener('DOMContentLoaded', init);
