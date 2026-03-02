// ========== GESTION DE LA NAVIGATION TOP ==========

const topNav = document.getElementById('top-nav');
const navButtons = document.querySelectorAll('.nav-btn[data-section]');

// Navigation au click sur les boutons
navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const section = btn.getAttribute('data-section');
        window.location.hash = section;
    });
});

// ========== GESTION DES PREVIEW CARDS (HOME PAGE) ==========

let previewCardsInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
    if (previewCardsInitialized) return;
    previewCardsInitialized = true;
    
    const previewCards = document.querySelectorAll('.preview-card');
    
    previewCards.forEach((card) => {
        const section = card.getAttribute('data-section');
        
        // Cliquer n'importe où sur la carte navigue vers la section
        card.addEventListener('click', (e) => {
            window.location.hash = section;
        });
        
        // Ouvrir la card au hover
        card.addEventListener('mouseenter', () => {
            // Fermer les autres cartes d'abord
            previewCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.removeAttribute('open');
                }
            });
            // Ne pas ouvrir sur les appareils tactiles
            if (window.matchMedia("(hover: hover)").matches) {
                card.setAttribute('open', '');
            }
        });
        
        // Fermer au hover out
        card.addEventListener('mouseleave', () => {
            if (window.matchMedia("(hover: hover)").matches) {
                card.removeAttribute('open');
            }
        });
    });
});

// ========== DARK MODE ==========

const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');

// ========== LANGUE (FR/EN) ==========

const i18nEn = {
    'nav.home': 'Home',
    'nav.projects': 'Projects & Experiences',
    'nav.education': 'Education',
    'nav.contact': 'Contact me',
    'theme.dark': 'Dark mode',
    'theme.light': 'Light mode',
    'hero.subtitle': 'I am an engineering student at <a href="https://www.supmicrotech.fr/" target="_blank" rel="noopener">SupMicroTech-ENSMM</a> and this is my portfolio.',
    'preview.hint': '→ Click to access the section',

    'projects.column.title': 'Projects & Experiences',
    'projects.column.hint': '- click a project to see associated skills',
    'education.column.title': 'Education path',
    'education.column.hint': '- click a path to see associated degrees',

    'orbit.skills.title': 'Hard skills',
    'orbit.skills.tag.design': 'Mechanical design',
    'orbit.skills.tag.theory': 'Theoretical physics',
    'orbit.skills.tag.python': 'Python',
    'orbit.skills.tag.web': 'HTML/CSS/JavaScript',
    'orbit.skills.tag.matlab': 'MATLAB',

    'orbit.projects.title': 'Projects &<br>Experiences',
    'orbit.projects.tag.portfolio': 'Portfolio',
    'orbit.projects.tag.formula': 'Formula Student',
    'orbit.projects.tag.tipe': 'TIPE',
    'orbit.projects.tag.operator': 'Injection press operator',
    'orbit.projects.tag.renov': 'Renovation',

    'orbit.qualities.title': 'Soft skills',
    'orbit.qualities.tag.rigorous': 'Rigorous',
    'orbit.qualities.tag.curious': 'Curious',
    'orbit.qualities.tag.autonomous': 'Autonomous',
    'orbit.qualities.tag.adaptable': 'Adaptable',
    'orbit.qualities.tag.pm': 'Project management',
    'orbit.qualities.tag.team': 'Team spirit',
    'orbit.gravity.title': 'Enable gravity',
    'orbit.freeze.title': 'Freeze items',

    'projects.title': 'My Experiences and Projects',
    'projects.skills.title': 'Skills',
    'projects.skills.python': 'Python Programming',
    'projects.skills.cad': 'CAD - PTC Creo',
    'projects.skills.system': 'Systems Engineering',
    'projects.skills.team': 'Teamwork',
    'projects.skills.rigor': 'Rigor & Adaptability',
    'projects.skills.field': 'Field culture',
    'projects.skills.pm': 'Project Management',
    'projects.skills.mrp': 'Production Management (MRP)',
    'projects.skills.metrology': 'Industrial Metrology',
    'projects.skills.iso': 'ISO / GPS Tolerancing',
    'projects.skills.control': 'Automation & Control',
    'projects.skills.java': 'Java Development',
    'projects.skills.learning': 'In progress',
    'projects.skills.acquired': 'Validated expertise',
    'projects.common.details': 'Details',
    'projects.reset.aria': 'Reset order',

    'projects.p1.title': 'Interactive Portfolio',
    'projects.p1.summary': 'Design of a modern portfolio showcasing projects and skills.',
    'projects.p1.dates': '<strong>Dates :</strong> February 2026 — 2 weeks',
    'projects.p1.goal': '<strong>Goal :</strong> Create a clear, interactive showcase to present projects.',
    'projects.p1.actionsTitle': '<strong>Key actions :</strong>',
    'projects.p1.action1': 'UI/UX design and page structure for smooth navigation.',
    'projects.p1.skills': '<strong>Skills :</strong> HTML/CSS/JS',
    'projects.p1.results': '<strong>Results :</strong> Responsive, clean, and performant site with consistent interactions and easy reading.',
    'projects.p1.details': '<strong>Detailed description :</strong> Multi-page architecture (home, projects, education, contact), UX optimization, and progressive integration of interactive elements to enhance content.',
    'projects.p1.docs': '<strong>Documents :</strong> None for the moment.',

    'projects.p2.title': 'Mu Racing Team - Formula Student',
    'projects.p2.summary': 'Internal/external organization and sponsor outreach for the motorsport association.',
    'projects.p2.dates': '<strong>Dates :</strong> October 2025–January 2026',
    'projects.p2.goal': '<strong>Goal :</strong> Structure internal/external collaboration and centralize team resources.',
    'projects.p2.sub1.title': '<strong>Collaborative Structure (Notion)</strong>',
    'projects.p2.sub1.problem': '<strong>Challenge :</strong> No centralized platform to share progress between departments.',
    'projects.p2.sub1.action': '<strong>Action :</strong> Deployment and architecture of a Notion workspace.',
    'projects.p2.sub1.result': '<strong>Result :</strong> Centralized technical documentation, real-time task tracking, improved cross-team communication.',
    'projects.p2.sub1.skills': '<strong>Skills used :</strong> <span class="skill-tag-hard">Information architecture</span> · <span class="skill-tag-soft">Project management</span> · <span class="skill-tag-soft">Change management</span>',
    'projects.p2.sub1.details': 'Some screenshots from Notion',
    'projects.p2.sub1.caption1': 'Platform structure',
    'projects.p2.sub1.caption2': 'Home page',
    'projects.p2.sub1.caption3': 'Department page (Chassis)',
    'projects.p2.sub1.caption4': 'Document center',
    'projects.p2.sub2.title': '<strong>Partnership & Manufacturing (Chassis)</strong>',
    'projects.p2.sub2.problem': '<strong>Challenge :</strong> Lack of internal equipment (laser cutting, tube bender) to manufacture the chassis.',
    'projects.p2.sub2.action': '<strong>Action :</strong> Active outreach and negotiation with subcontractors.',
    'projects.p2.sub2.result': '<strong>Result :</strong> Substantial budget savings for the team.',
    'projects.p2.sub2.skills': '<strong>Skills used :</strong> <span class="skill-tag-hard">Sourcing</span> · <span class="skill-tag-hard">Cost optimization</span> · <span class="skill-tag-soft">B2B negotiation</span>',
    'projects.p2.sub2.details': 'In progress.',
    'projects.p2.sub3.title': '<strong>Digital Showcase (Website)</strong>',
    'projects.p2.sub3.problem': '<strong>Challenge :</strong> Need visibility to attract sponsors and present progress.',
    'projects.p2.sub3.action': '<strong>Action :</strong> Design and development of a dedicated website.',
    'projects.p2.sub3.result': '<strong>Result :</strong> Professional communication support to showcase the project and attract sponsors.',
    'projects.p2.sub3.skills': '<strong>Skills used :</strong> <span class="skill-tag-hard">HTML</span> · <span class="skill-tag-hard">CSS</span> · <span class="skill-tag-hard">JavaScript</span> · <span class="skill-tag-soft">Branding</span> · <span class="skill-tag-soft">Content management</span>',
    'projects.p2.sub3.site': '<strong>Website :</strong> <a href="https://tomvivian28072005.github.io/muracingteam-site/index.html" target="_blank" rel="noopener">View the site</a>',

    'projects.p3.title': 'Plastic injection press operator',
    'projects.p3.summary': 'Summer job in plastic injection production.',
    'projects.p3.role': '<strong>Role :</strong> Injection press operator (night shift)',
    'projects.p3.dates': '<strong>Dates :</strong> July 2025 — 2 weeks',
    'projects.p3.actionsTitle': '<strong>Actions :</strong> Operating injection molding machines, monitoring production output, quality control of parts, and coordination with maintenance teams.',
    'projects.p3.action1': 'Operation of injection molding machines and production monitoring.',
    'projects.p3.action2': 'Quality control of parts and application of safety procedures.',
    'projects.p3.action3': 'Coordination with maintenance and production teams.',
    'projects.p3.skills': '<strong>Skills :</strong> <span class="skill-tag-hard">Quality control</span> · <span class="skill-tag-hard">Safety procedures</span> · <span class="skill-tag-soft">Teamwork</span> · <span class="skill-tag-soft">Field culture</span>',
    'projects.p3.results': '<strong>Results :</strong> Well-delivered work with positive feedback from the supervisor, and hands-on industrial production experience.',
    'projects.p3.details': '<strong>Detailed description :</strong> Practical experience in industrial production, quality control, and safety procedures in a night-shift context.',
    'projects.p3.docs': '<strong>Documents :</strong> None for the moment.',

    'projects.p4.title': 'TIPE – Reaction wheel desaturation',
    'projects.p4.summary': 'Study of a nanosatellite attitude control system.',
    'projects.p4.dates': '<strong>Dates :</strong> December 2024 — July 2025',
    'projects.p4.goal': '<strong>Goal :</strong> Study and simulate solutions to avoid reaction wheel saturation using magnetorquers.',
    'projects.p4.sub1.title': '<strong>Physical analysis</strong>',
    'projects.p4.sub1.action1': '<strong>Action :</strong> Study of angular momentum conservation and modeling the action–reaction principle of reaction wheels.',
    'projects.p4.sub1.action2': '<strong>Action :</strong> Analysis of the interaction between Earth’s magnetic field and satellite coils to generate a desaturation torque.',
    'projects.p4.sub2.title': '<strong>Numerical computation</strong>',
    'projects.p4.sub2.action': '<strong>Action :</strong> Development of a Python program to compute the torque each magnetorquer must produce to achieve the required desaturation torque.',
    'projects.p4.results': '<strong>Results & contributions :</strong> Validation of the desaturation strategy and critical analysis of the model, highlighting algorithm limits depending on orbit type. Demonstrated the viability of magnetorquers without fuel consumption.',
    'projects.p4.grade': '<strong>Score :</strong> 15.2/20 (CCINP competitive exam)',
    'projects.p4.sub1.skills': '<strong>Skills used :</strong> <span class="skill-tag-hard">Solid mechanics</span> · <span class="skill-tag-hard">Electromagnetism</span> · <span class="skill-tag-hard">Angular momentum</span>',
    'projects.p4.skills': '<strong>Skills used :</strong> <span class="skill-tag-hard">Python</span> · <span class="skill-tag-hard">Numerical analysis</span> · <span class="skill-tag-soft">Project management</span>',
    'projects.p4.problem': '<strong>Technical challenge :</strong> Orbital disturbances (gravity, solar radiation) saturate reaction wheels, making the satellite uncontrollable. With no fuel, nanosatellites use Earth’s magnetic field. Throughout desaturation, the satellite must maintain a constant attitude (orientation).',
    'projects.p4.docs': '<strong>Documents :</strong> <a href="assets/projects/tipe/MCOT.pdf" target="_blank" rel="noopener">MCOT — initial objectives (PDF)</a> • <a href="assets/projects/tipe/Presentation_TIPE.pdf" target="_blank" rel="noopener">Oral presentation (PDF)</a> • <a href="assets/projects/tipe/Programme_python_final.py" target="_blank" rel="noopener">Python program</a>',

    'projects.p5.title': 'Apartments renovation',
    'projects.p5.summary': 'Renovation and restoration of apartments.',
    'projects.p5.role': '<strong>Role :</strong> To be defined',
    'projects.p5.dates': '<strong>Dates :</strong> 2021–2023',
    'projects.p5.sub1.title': '<strong>Renovation works</strong>',
    'projects.p5.actionsTitle': '<strong>Actions :</strong> Participated in renovation and restoration works — painting, light masonry, interior fitting.',
    'projects.p5.skills': '<strong>Skills :</strong> <span class="skill-tag-soft">Teamwork</span> · <span class="skill-tag-soft">Rigor & Adaptability</span> · <span class="skill-tag-soft">Field culture</span>',
    'projects.p5.photos.label': 'Work overview',
    'projects.p5.results': '<strong>Results :</strong> To be defined',
    'projects.p5.details': '<strong>Detailed description :</strong> To be defined.',
    'projects.p5.docs': '<strong>Documents :</strong> None for the moment.',

    'projects.p7.title': 'Course – CAD',
    'projects.p7.summary': 'Learning CAD.',
    'projects.p7.dates': '<strong>Dates :</strong> September 2025 – 2026',
    'projects.p7.sub1.title': '<strong>Learning — PTC Creo</strong>',
    'projects.p7.sub1.context': '<strong>Context :</strong> Computer-aided design training with PTC Creo — 3D modeling, drafting, and requirements compliance.',
    'projects.p7.sub1.skills': '<strong>Skills :</strong> <span class="skill-tag-hard">CAD — PTC Creo</span>',

    'projects.category.main': 'Main projects',
    'projects.category.secondary': 'Secondary projects',

    'projects.p6.title': 'Mu Air - Design & Fabrication of an aircraft simulator',
    'projects.p6.summary': 'Pending',
    'projects.p6.dates': '<strong>Dates :</strong> 2026–Today',
    'projects.p6.sub1.title': '<strong>Design & Fabrication — In progress</strong>',
    'projects.p6.sub1.context': '<strong>Context :</strong> Design and fabrication of a flight simulator within the Mu Air association — project currently in development.',
    'projects.p6.sub1.skills': '<strong>Skills :</strong> <span class="skill-tag-hard">CAD — PTC Creo</span> · <span class="skill-tag-hard">Systems engineering</span> · <span class="skill-tag-hard">Automation</span> · <span class="skill-tag-soft">Teamwork</span> · <span class="skill-tag-soft">Project management</span>',

    'projects.p8.title': 'Personal Portfolio',
    'projects.p8.summary': 'Design and development of this personal portfolio.',
    'projects.p8.sub1.title': '<strong>Design & Development — This site</strong>',
    'projects.p8.sub1.context': '<strong>Context :</strong> Need for a digital platform to present career path, projects and skills in a structured and professional way.',
    'projects.p8.sub1.action': '<strong>Action :</strong> Thinking through content, design and usability — structuring information, choosing sections, highlighting projects and readability.',
    'projects.p8.sub1.result': '<strong>Impact :</strong> Site deployed and accessible online, serving as a professional showcase.',
    'projects.p8.sub1.skills': '<strong>Skills :</strong> <span class="skill-tag-soft">Design & UX</span> · <span class="skill-tag-soft">Information architecture</span> · <span class="skill-tag-soft">Content management</span>',

    'projects.p4.docs.label': 'Project documents',

    'projects.placeholder.title': 'Upcoming project',
    'projects.placeholder.summary': 'Next project in preparation.',
    'projects.placeholder.role': '<strong>Role :</strong> ',
    'projects.placeholder.dates': '<strong>Dates :</strong> ',
    'projects.placeholder.skills': '<strong>Skills :</strong> ',
    'projects.placeholder.details': '<strong>Detailed description :</strong> ',
    'projects.placeholder.results': '<strong>Results :</strong> ',

    'education.title': 'Education',
    'education.sidebar.title': 'Degrees / Exams',
    'education.sidebar.academic': 'Academic training',
    'education.sidebar.engineer': 'Engineering degree (in progress)',
    'education.sidebar.sst': 'SST First Aid certificate',
    'education.sidebar.ccinp': 'CCINP competitive exam',
    'education.sidebar.bac': 'General Baccalaureate',
    'education.sidebar.brevet': 'Middle School Diploma',
    'education.sidebar.extra': 'Extracurricular training',

    'education.e1.title': 'SupMicroTech<span class="project-title-sub"> — National Engineering Institute of Mechanics and Microtechnologies</span>',
    'education.e1.summary': 'Engineering school',
    'education.e1.description': '<strong>Description</strong> : Engineering school specialized in precision mechanics and micromechanics',
    'education.e1.sem1.title': 'Semester 1',
    'education.e1.sem1.dates': 'September 2025–January 2026',
    'education.e1.sem1.summary': 'First semester in engineering school',
    'education.e1.sem1.block1.title': 'Mechanical Design & Engineering',
    'education.e1.sem1.block1.item1': 'CAD Design (Creo): 3D modeling, drafting, and requirements compliance.',
    'education.e1.sem1.block1.item2': 'Machine element sizing: bearing calculations/integration and gear selection.',
    'education.e1.sem1.block1.item3': 'Kinematic analysis: study of motions and technical reading of complex drawings.',
    'education.e1.sem1.block2.title': 'Materials Science',
    'education.e1.sem1.block2.item1': 'Structure of matter: structural basics and physical properties.',
    'education.e1.sem1.block2.item2': 'Material families: in-depth study of metals (metallurgy), polymers and ceramics.',
    'education.e1.sem1.block3.title': 'Applied Mathematics & Simulation',
    'education.e1.sem1.block3.item1': 'Dynamics & Simulation (Matlab): modeling of dynamic systems and numerical solving (ODE45).',
    'education.e1.sem1.block3.item2': 'Numerical Analysis & Optimization: differentiable optimization and solving methods.',
    'education.e1.sem1.block3.item3': 'Partial Differential Equations: physical modeling (heat, Poisson, waves).',
    'education.e1.sem1.block4.title': 'Electronics & Systems',
    'education.e1.sem1.block4.item1': 'Analog electronics: diodes, transistors (BJT, N‑MOS), op-amps and multivibrator circuits.',
    'education.e1.sem1.block4.item2': 'Digital logic: combinational, sequential systems and timers (NE555).',
    'education.e1.sem1.block5.title': 'Photonics',
    'education.e1.sem1.block5.item1': 'Physical & geometric optics: matrix approach, polarization and laser technology.',
    'education.e1.sem1.block6.title': 'Languages & Communication',
    'education.e1.sem1.block6.item1': 'English',
    'education.e1.sem1.block6.item2': 'German',
    'education.e1.sem1.block6.item3': 'Communication',
    'education.e1.sst': '<strong>Certification</strong> : SST first aid certificate obtained in January 2026',

    'education.e2.title': 'CPGE (MP & MP2I)',
    'education.e2.summary': 'Victor Hugo High School',
    'education.e2.description': '<strong>Description</strong> : French intensive two-year preparatory program (CPGE) for engineering school competitive exams.',
    'education.e2.mp.title': 'MP track (advanced class)',
    'education.e2.mp.dates': '2024–2025',
    'education.e2.mp.summary': 'Advanced mathematics and physics',
    'education.e2.mp.block1.title': 'Mathematics',
    'education.e2.mp.block1.item1': 'Linear and bilinear algebra',
    'education.e2.mp.block1.item2': 'Topology and analysis',
    'education.e2.mp.block1.item3': 'Series and integrals (convergence)',
    'education.e2.mp.block1.item4': 'Probability and statistics',
    'education.e2.mp.block1.item5': 'Differential geometry',
    'education.e2.mp.block2.title': 'Physics',
    'education.e2.mp.block2.item1': 'Electromagnetism',
    'education.e2.mp.block2.item2': 'Solid mechanics',
    'education.e2.mp.block2.item3': 'Quantum and statistical physics',
    'education.e2.mp.block2.item4': 'Wave optics',
    'education.e2.mp.block2.item5': 'Statistical thermodynamics',
    'education.e2.mp.block3.title': 'Engineering Science',
    'education.e2.mp.block3.item1': 'Linear control systems',
    'education.e2.mp.block3.item2': 'Bond graph modeling',
    'education.e2.mp.block3.item3': 'Mechanism mechanics (joints, wrenches)',
    'education.e2.mp.block3.item4': 'Value analysis and design',
    'education.e2.mp.block4.title': 'Computer Science (core)',
    'education.e2.mp.block4.item1': 'Basic algorithms (Python)',
    'education.e2.mp.block4.item2': 'Data analysis and graphs',
    'education.e2.mp.block4.item3': 'Numerical simulation',
    'education.e2.mp.block4.item4': 'SQL databases (basics)',
    'education.e2.mp.block5.title': 'Languages',
    'education.e2.mp.block5.item1': 'English',
    'education.e2.mp.block5.item2': 'French / Philosophy',

    'education.e2.mp2i.title': 'MP2I track',
    'education.e2.mp2i.dates': '2023–2024',
    'education.e2.mp2i.summary': 'Mathematics, computer science and engineering science',
    'education.e2.mp2i.block1.title': 'Mathematics',
    'education.e2.mp2i.block1.item1': 'Linear algebra',
    'education.e2.mp2i.block1.item2': 'Real and complex analysis',
    'education.e2.mp2i.block1.item3': 'Number theory',
    'education.e2.mp2i.block1.item4': 'Discrete probability',
    'education.e2.mp2i.block1.item5': 'Algebraic structures',
    'education.e2.mp2i.block2.title': 'Engineering Science',
    'education.e2.mp2i.block2.item1': 'Control (feedback systems)',
    'education.e2.mp2i.block2.item2': 'Kinematics and statics',
    'education.e2.mp2i.block2.item3': 'Systems theory',
    'education.e2.mp2i.block2.item4': 'Multiphysics modeling',
    'education.e2.mp2i.block3.title': 'Computer Science',
    'education.e2.mp2i.block3.item1': 'Algorithms and complexity',
    'education.e2.mp2i.block3.item2': 'Data structures',
    'education.e2.mp2i.block3.item3': 'C programming (basics)',
    'education.e2.mp2i.block3.item4': 'Logic and computer architecture',
    'education.e2.mp2i.block4.title': 'Physics & Chemistry',
    'education.e2.mp2i.block4.item1': 'Electric circuits',
    'education.e2.mp2i.block4.item2': 'Point mechanics',
    'education.e2.mp2i.block4.item3': 'Thermodynamics',
    'education.e2.mp2i.block4.item4': 'Geometric optics',
    'education.e2.mp2i.block5.title': 'Languages',
    'education.e2.mp2i.block5.item1': 'English',
    'education.e2.mp2i.block5.item2': 'French / Philosophy',
    'education.e2.result': '<strong>Result</strong> : Passed the CCINP engineering school competitive exam and entered SupMicroTech-ENSMM',

    'education.e3.title': 'High School',
    'education.e3.summary': 'Augustin Cournot High School',
    'education.e3.description': '<strong>Description</strong> : General high school',
    'education.e3.year1': '<strong>Final year</strong> <span class="edu-year-date">2022–2023</span>',
    'education.e3.year1.info': 'General track: Math and Physics specializations',
    'education.e3.year1.options': 'Options: Advanced Math and European English track',
    'education.e3.year2': '<strong>Penultimate year</strong> <span class="edu-year-date">2021–2022</span>',
    'education.e3.year2.info': 'General track: Math, Physics and Computer Science specializations',
    'education.e3.year2.options': 'Options: European English track',
    'education.e3.year3': '<strong>10th grade</strong> <span class="edu-year-date">2020–2021</span>',
    'education.e3.year3.info': 'General track',
    'education.e3.year3.options': 'Options: TSI (Technology & Engineering Sciences) and European English track',
    'education.e3.result': '<strong>Result</strong> : General Baccalaureate with Math, Physics (and CS) specializations, European English track and Advanced Math option, grade: very good',

    'education.e4.title': 'Middle School',
    'education.e4.summary': 'Augustin Cournot Middle School',
    'education.e4.description': '<strong>Description</strong> : General middle school',
    'education.e4.result': '<strong>Result</strong> : Middle School Diploma with highest honors',

    'education.placeholder.title': 'Coming soon',
    'education.placeholder.summary': 'Coming soon',

    'contact.title': 'CONTACT ME',
    'contact.intro': 'Feel free to contact me to discuss projects, opportunities, or simply exchange. I am always open to new professional connections.',
    'contact.internship': 'I am looking for an engineering internship of 20 to 24 weeks starting from August 2026. My objective is to invest myself in a mission that bridges the gap between design office thinking and the reality of production in the workshop.',
    'contact.internship-continued': 'With concrete experience as a press operator in an industrial environment, I have gained a pragmatic vision of field challenges. I wish to put this dual approach at the service of optimizing methods, managing production, or deploying solutions related to Industry 4.0. I am particularly motivated by innovative environments where technique and organization come together to improve operational efficiency.',
    'contact.btn.email': 'Send an Email',
    'contact.btn.linkedin': 'My LinkedIn',
    'contact.btn.cv': 'Download my CV',
    'contact.btn.cv.href': 'assets/documents/VIVIAN-Tom_Resume.pdf'
};

const updateThemeLabel = () => {
    const themeLabel = document.getElementById('theme-label');
    const currentLang = localStorage.getItem('lang') || 'fr';
    const isDark = document.body.classList.contains('dark-mode');
    
    if (themeLabel) {
        if (isDark) {
            themeLabel.textContent = currentLang === 'en' ? 'Dark mode' : 'Mode sombre';
            themeLabel.setAttribute('data-i18n', 'theme.dark');
        } else {
            themeLabel.textContent = currentLang === 'en' ? 'Light mode' : 'Mode clair';
            themeLabel.setAttribute('data-i18n', 'theme.light');
        }
    }
};

const applyLanguage = (lang) => {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const mode = el.getAttribute('data-i18n-mode') || 'text';

        if (!el.dataset.i18nFr) {
            el.dataset.i18nFr = mode === 'html' ? el.innerHTML : el.textContent;
        }

        const value = lang === 'en' ? i18nEn[key] : el.dataset.i18nFr;
        if (typeof value !== 'string') return;

        if (mode === 'html') {
            el.innerHTML = value;
        } else {
            el.textContent = value;
        }
    });

    const attrElements = document.querySelectorAll('[data-i18n-attr][data-i18n-attr-key]');
    attrElements.forEach(el => {
        const attr = el.getAttribute('data-i18n-attr');
        const key = el.getAttribute('data-i18n-attr-key');
        if (!attr || !key) return;

        if (!el.dataset.i18nAttrFr) {
            el.dataset.i18nAttrFr = el.getAttribute(attr) || '';
        }

        const value = lang === 'en' ? i18nEn[key] : el.dataset.i18nAttrFr;
        if (typeof value === 'string') {
            el.setAttribute(attr, value);
        }
    });

    if (langToggle) {
        const langOptions = langToggle.querySelectorAll('.lang-option');
        langOptions.forEach(option => {
            const optionLang = option.getAttribute('data-lang');
            if (optionLang === lang) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'fr');
    localStorage.setItem('lang', lang);
    
    // Mettre à jour le label du thème selon la langue
    updateThemeLabel();
};

// Charger la préférence depuis localStorage au chargement
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const savedLang = localStorage.getItem('lang');
    const themeIcon = document.getElementById('theme-icon');
    
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const effectiveTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    if (effectiveTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.src = 'assets/icons/moon.svg';
        themeIcon.alt = 'Dark mode';
    } else {
        themeIcon.src = 'assets/icons/sun.svg';
        themeIcon.alt = 'Light mode';
    }
    
    // Appliquer la langue au chargement
    const browserLang = (navigator.language || '').toLowerCase();
    const systemLang = browserLang.startsWith('en') ? 'en' : 'fr';
    const effectiveLang = savedLang || systemLang;
    applyLanguage(effectiveLang);
    
    // Mettre à jour le label du thème
    updateThemeLabel();
});

// ========== NAVIGATION SPA ==========

const initSpaNavigation = () => {
    const sections = document.querySelectorAll('.page-section');
    if (!sections.length) return;

    const updateActiveSection = () => {
        let targetId = window.location.hash.replace('#', '').trim();
        if (!targetId) {
            targetId = 'home';
        }

        const targetSection = document.getElementById(targetId);
        if (!targetSection) {
            targetId = 'home';
        }

        sections.forEach(section => {
            section.classList.toggle('active', section.id === targetId);
        });

        // Mettre à jour l'état actif de la navigation
        document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-section') === targetId);
        });


    };

    updateActiveSection();
    window.addEventListener('hashchange', updateActiveSection);
};

window.addEventListener('DOMContentLoaded', () => {
    initSpaNavigation();
});

// Toggle Dark Mode
const themeIcon = document.getElementById('theme-icon');

themeToggle.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Sauvegarder la position de scroll pour chaque section
    const scrollPositions = new Map();
    document.querySelectorAll('.page-section').forEach(section => {
        const projectsList = section.querySelector('.projects-list');
        const skillsSidebar = section.querySelector('.skills-sidebar');
        if (projectsList) {
            scrollPositions.set(`${section.id}-projects`, projectsList.scrollTop);
        }
        if (skillsSidebar) {
            scrollPositions.set(`${section.id}-skills`, skillsSidebar.scrollTop);
        }
    });
    
    document.body.classList.toggle('dark-mode');
    
    // Mettre à jour l'icône et le label
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.src = 'assets/icons/moon.svg';
        themeIcon.alt = 'Dark mode';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.src = 'assets/icons/sun.svg';
        themeIcon.alt = 'Light mode';
        localStorage.setItem('theme', 'light');
    }
    
    updateThemeLabel();
    
    // Restaurer les positions de scroll
    requestAnimationFrame(() => {
        document.querySelectorAll('.page-section').forEach(section => {
            const projectsList = section.querySelector('.projects-list');
            const skillsSidebar = section.querySelector('.skills-sidebar');
            if (projectsList) {
                const scrollPos = scrollPositions.get(`${section.id}-projects`);
                if (scrollPos !== undefined) projectsList.scrollTop = scrollPos;
            }
            if (skillsSidebar) {
                const scrollPos = scrollPositions.get(`${section.id}-skills`);
                if (scrollPos !== undefined) skillsSidebar.scrollTop = scrollPos;
            }
        });
    });
});

if (langToggle) {
    document.addEventListener('DOMContentLoaded', () => {
        // Toggle langue en cliquant sur l'icône
        langToggle.querySelector('.nav-icon')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const currentLang = localStorage.getItem('lang') || 'fr';
            const targetLang = currentLang === 'fr' ? 'en' : 'fr';
            
            applyLanguage(targetLang);
        });
        
        // Clic sur EN/FR
        const langOptions = langToggle.querySelectorAll('.lang-option');
        
        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const targetLang = option.getAttribute('data-lang');
                const currentLang = localStorage.getItem('lang') || 'fr';
                
                // Ne rien faire si on clique sur la langue déjà active
                if (targetLang === currentLang) return;
                
                applyLanguage(targetLang);
            });
        });
    });
}

// Alignment script removed — using CSS centering instead
