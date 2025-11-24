const MOCK_DATA = {
    users: [
        {
            id: 1,
            name: "Daniel User",
            email: "daniel@example.com",
            role: "student",
            savedCourses: [1, 3],
            registeredCourses: [],
            certificates: [
                { id: 101, courseId: 2, date: "2024-01-15", url: "#" }
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
            fullDescription: "Este bootcamp intensivo te llevará desde cero hasta experto en desarrollo web Full Stack. Aprenderás las tecnologías más demandadas del mercado, incluyendo HTML5, CSS3, JavaScript moderno, React para el frontend y Node.js para el backend. Además, trabajarás con bases de datos SQL y NoSQL, y desplegarás tus aplicaciones en la nube.",
            syllabus: [
                "Introducción a la Web y HTML/CSS",
                "JavaScript Moderno (ES6+)",
                "Frontend con React y Redux",
                "Backend con Node.js y Express",
                "Bases de Datos (MongoDB & PostgreSQL)",
                "Proyecto Final y Despliegue"
            ],
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
            fullDescription: "Conviértete en un experto en metodologías ágiles. Este master te preparará para liderar equipos en entornos cambiantes, utilizando marcos de trabajo como Scrum y Kanban. Ideal para Project Managers que buscan actualizarse.",
            syllabus: [
                "Mindset Ágil vs Tradicional",
                "Framework Scrum en profundidad",
                "Kanban y Lean Management",
                "Liderazgo de Equipos Ágiles",
                "Escalado de Agilidad"
            ],
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
            fullDescription: "Sumérgete en el mundo del diseño de experiencia de usuario e interfaz. Aprenderás a investigar usuarios, crear wireframes, prototipar en Figma y diseñar interfaces hermosas y funcionales.",
            syllabus: [
                "Design Thinking y User Research",
                "Arquitectura de Información",
                "Wireframing y Prototipado",
                "Diseño Visual y Sistemas de Diseño",
                "Pruebas de Usabilidad"
            ],
            dates: ["2024-06-10"],
            mode: "Online",
            duration: "8 Semanas"
        },
        {
            id: 4,
            title: "Data Science & Machine Learning",
            institutionId: 1,
            price: 399,
            currency: "USD",
            rating: 4.9,
            reviews: 150,
            category: "Tecnología",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
            description: "Analiza datos y construye modelos predictivos avanzados.",
            fullDescription: "Domina el arte de extraer conocimiento de los datos. Aprenderás Python para Data Science, análisis exploratorio, visualización de datos y creación de modelos de Machine Learning.",
            syllabus: [
                "Python para Data Science",
                "Análisis y Visualización de Datos",
                "Machine Learning Supervisado",
                "Machine Learning No Supervisado",
                "Deep Learning Básico"
            ],
            dates: ["2024-07-01"],
            mode: "Online",
            duration: "16 Semanas"
        },
        {
            id: 5,
            title: "Liderazgo y Comunicación Efectiva",
            institutionId: 2,
            price: 150,
            currency: "USD",
            rating: 4.6,
            reviews: 95,
            category: "Habilidades Blandas",
            image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80",
            description: "Mejora tus habilidades directivas y de comunicación.",
            fullDescription: "Potencia tu carrera desarrollando habilidades de liderazgo y comunicación. Aprende a inspirar a otros, gestionar conflictos y comunicar tus ideas con claridad e impacto.",
            syllabus: [
                "Estilos de Liderazgo",
                "Comunicación Asertiva",
                "Gestión de Conflictos",
                "Inteligencia Emocional",
                "Presentaciones de Alto Impacto"
            ],
            dates: ["2024-05-20"],
            mode: "Presencial",
            duration: "4 Semanas"
        }
    ]
};

if (typeof window !== 'undefined') {
    window.MOCK_DATA = MOCK_DATA;
}
