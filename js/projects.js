/**
 * Gestion de la page Projets
 * - Filtrage par compétences
 * - Mise en évidence des tags
 * - Accordéon pour les détails
 */

class ProjectsManager {
    constructor(root = document) {
        this.root = root;
        this.section = root instanceof Element ? root.closest('.page-section') : null;
        this.skillFilters = this.root.querySelectorAll('.skill-filter');
        this.projectCards = this.root.querySelectorAll('.project-card');
        this.toggleButtons = this.root.querySelectorAll('.toggle-details');
        this.skillsList = this.root.querySelector('.skills-list');
        this.skillsSidebar = this.root.querySelector('.skills-sidebar');
        this.projectsList = this.root.querySelector('.projects-list');
        this.resetButton = this.root.querySelector('.projects-reset-btn');
        
        this.activeSkill = 'all';
        this.activeProject = null;
        
        // Sauvegarder l'ordre initial des compétences et tous les enfants de la liste
        this.skillFilters = this.root.querySelectorAll('.skill-filter');
        this.initialSkillsOrder = Array.from(this.skillFilters);
        // Sauvegarder TOUS les enfants de skills-list (y compris <hr>)
        if (this.skillsList) {
            this.initialSkillsChildren = Array.from(this.skillsList.children);
        }
        this.initialProjectsOrder = [];

        if (!this.skillFilters.length && !this.projectCards.length) {
            return;
        }
        
        this.init();
    }

    isActive() {
        if (!this.section) return true;
        return this.section.classList.contains('active');
    }

    init() {
        this.setupSkillFilters();
        this.setupProjectCards();
        this.setupToggleButtons();
        this.setupBackgroundDeselect();
        this.setupImageLightbox();
        this.setupResetButton();
        this.sortProjectsByEndDate();
        this.moveDisabledProjectsToEnd();
        this.setupSectionReset();
    }

    setupSectionReset() {
        if (!this.section) return;
        this.section.addEventListener('sectionReset', () => {
            this.restoreInitialOrder();
        });
    }

    sortProjectsByEndDate() {
        if (!this.projectsList) return;

        const getProjectEndYear = (card) => {
            const yearEl = card.querySelector('.project-years');
            if (!yearEl) return -Infinity;
            const text = yearEl.textContent || '';
            const matches = text.match(/\b\d{4}\b/g);
            if (!matches || !matches.length) return -Infinity;
            const lastYear = matches[matches.length - 1];
            return Number.parseInt(lastYear, 10) || -Infinity;
        };

        // Trier les projets par date de fin, DANS chaque catégorie (principal / secondaire)
        const children = Array.from(this.projectsList.children);
        const sections = [];
        let currentSection = [];

        children.forEach(child => {
            if (child.classList.contains('projects-separator')) {
                if (currentSection.length) sections.push(currentSection);
                currentSection = [child];
            } else {
                currentSection.push(child);
            }
        });
        if (currentSection.length) sections.push(currentSection);

        // Pour chaque section, trier uniquement les project-cards par date
        sections.forEach(section => {
            const cards = section.filter(el => el.classList.contains('project-card'));
            const nonCards = section.filter(el => !el.classList.contains('project-card'));
            cards.sort((a, b) => getProjectEndYear(b) - getProjectEndYear(a));
            nonCards.forEach(el => this.projectsList.appendChild(el));
            cards.forEach(el => this.projectsList.appendChild(el));
        });

        this.initialProjectsOrder = Array.from(this.projectCards);

        // Sauvegarder TOUS les enfants de projects-list (cartes + séparateurs + labels)
        this.initialProjectsChildren = Array.from(this.projectsList.children);
    }

    /**
     * Gestion des filtres de compétences
     */
    setupSkillFilters() {
        this.skillFilters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                if (!this.isActive()) return;
                e.preventDefault();
                e.stopPropagation();

                const skill = filter.getAttribute('data-target-skill') || '';

                // Fermer tous les détails ouverts avant filtrage
                this.projectCards.forEach(card => {
                    const details = card.querySelector('.project-details');
                    const toggleButton = card.querySelector('.toggle-details');
                    if (details && !details.classList.contains('hidden')) {
                        details.classList.add('hidden');
                        this.closeInnerDropdowns(card);
                    }
                    if (toggleButton) {
                        toggleButton.textContent = '▼';
                        toggleButton.classList.remove('open');
                    }
                });

                this.activeProject = null;

                // Si clic sur le même filtre ou filtre vide : réinitialiser
                if (!skill || this.activeSkill === skill) {
                    this.resetFilters();
                    this.scrollProjectsToTop();
                    return;
                }

                this.activeSkill = skill;
                this.filterBySkill(skill);
                this.applySkillFilterState(skill);
            });
        });
    }

    setupResetButton() {
        if (!this.resetButton || !this.projectsList) return;

        this.resetButton.addEventListener('click', (e) => {
            if (!this.isActive()) return;
            e.preventDefault();
            e.stopPropagation();
            this.restoreInitialOrder();
        });
    }

    restoreInitialOrder() {
        if (!this.projectsList) return;

        // Fermer tous les détails ouverts
        this.projectCards.forEach(card => {
            const details = card.querySelector('.project-details');
            const toggleButton = card.querySelector('.toggle-details');
            if (details && !details.classList.contains('hidden')) {
                details.classList.add('hidden');
                this.closeInnerDropdowns(card);
            }
            if (toggleButton) {
                toggleButton.textContent = '▼';
                toggleButton.classList.remove('open');
            }
        });

        this.activeProject = null;
        this.cleanAllClasses();
        this.resetFilters();

        if (this.initialProjectsChildren && this.initialProjectsChildren.length) {
            this.initialProjectsChildren.forEach(child => {
                this.projectsList.appendChild(child);
            });
        }
        this.moveDisabledProjectsToEnd();
    }

    /**
     * Gestion du clic sur les cartes de projets
     */
    setupProjectCards() {
        this.projectCards.forEach(card => {
            if (card.getAttribute('data-clickable') === 'false') {
                return;
            }
            const projectTitle = card.querySelector('.project-title');
            if (projectTitle) {
                projectTitle.addEventListener('mouseenter', () => {
                    if (card.classList.contains('project-card-open')) {
                        card.classList.add('title-hover');
                    }
                });
                projectTitle.addEventListener('mouseleave', () => {
                    card.classList.remove('title-hover');
                });
            }
            // Empêcher la fermeture lors du clic sur un lien dans la carte
            card.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            });
            card.querySelectorAll('.project-subdetails-photos img').forEach(img => {
                img.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            });
            // Fonction commune pour gérer le clic
            const handleCardClick = (e) => {
                if (!this.isActive()) return;
                // Si on clique sur un lien, ne pas déclencher le filtre
                if (e.target.closest('a')) {
                    return;
                }

                // Si on clique sur un summary interne, ne pas déclencher le filtre de carte
                if (e.target.closest('summary')) {
                    return;
                }
                
                e.preventDefault();
                e.stopPropagation();

                const isToggleClick = e.target.classList.contains('toggle-details');
                const isTitleClick = !!e.target.closest('.project-title');

                // Un projet déjà ouvert ne se referme que via flèche ou titre
                this.activateProject(card, { canCloseActive: isToggleClick || isTitleClick });
            };
            
            // Ajouter l'event listener sur toute la carte
            card.addEventListener('click', handleCardClick);
        });
    }

    /**
     * Gestion des boutons d'accordéon
     */
    setupToggleButtons() {
        this.toggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (!this.isActive()) return;
                e.stopPropagation(); // Empêche la propagation au parent
                const card = button.closest('.project-card');
                if (!card) return;
                this.activateProject(card, { canCloseActive: true });
            });
        });
    }

    activateProject(card, options = {}) {
        if (!card) return;
        const { canCloseActive = false } = options;
        const details = card.querySelector('.project-details');
        const toggleButton = card.querySelector('.toggle-details');
        const projectsList = this.projectsList;

        // Si on clique sur le projet deja actif, on le deselectionne
        if (this.activeProject === card) {
            if (!canCloseActive) {
                return;
            }

            if (details && !details.classList.contains('hidden')) {
                details.classList.add('hidden');
                this.closeInnerDropdowns(card);
                if (toggleButton) {
                    toggleButton.textContent = '▼';
                    toggleButton.classList.remove('open');
                }
            }

            this.activeProject = null;
            this.cleanAllClasses();
            this.resetFilters();
            this.scrollProjectsToTop();
            return;
        }

        // Fermer le projet precedemment actif s'il existe
        if (this.activeProject && this.activeProject !== card) {
            const previousDetails = this.activeProject.querySelector('.project-details');
            const previousToggle = this.activeProject.querySelector('.toggle-details');

            if (previousDetails && !previousDetails.classList.contains('hidden')) {
                previousDetails.classList.add('hidden');
                this.closeInnerDropdowns(this.activeProject);
                if (previousToggle) {
                    previousToggle.textContent = '▼';
                    previousToggle.classList.remove('open');
                }
            }
        }

        this.cleanAllClasses();
        this.activeProject = card;

        const skills = card.getAttribute('data-skills').split(' ');
        this.highlightSkills(skills);

        if (details && details.classList.contains('hidden')) {
            details.classList.remove('hidden');
            card.classList.add('project-card-open');
            if (toggleButton) {
                toggleButton.classList.add('open');
            }
        }

        if (projectsList) {
            projectsList.prepend(card);
            this.moveDisabledProjectsToEnd();
            projectsList.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    /**
     * Désélectionner et fermer les détails quand on clique en dehors
     */
    setupBackgroundDeselect() {
        document.addEventListener('click', (e) => {
            if (!this.isActive()) return;
            
            // Si on clique sur une carte de projet, un filtre ou un bouton, ne rien faire
            if (e.target.closest('.project-card')) return;
            if (e.target.closest('.skill-filter')) return;
            if (e.target.closest('.toggle-details')) return;
            if (e.target.closest('.projects-reset-btn')) return;
            if (e.target.closest('.top-nav')) return;

            // Si on clique en dehors de ces éléments, désélectionner tout
            // Fermer tous les détails ouverts
            this.projectCards.forEach(card => {
                const details = card.querySelector('.project-details');
                const toggleButton = card.querySelector('.toggle-details');
                if (details && !details.classList.contains('hidden')) {
                    details.classList.add('hidden');
                    this.closeInnerDropdowns(card);
                }
                if (toggleButton) {
                    toggleButton.textContent = '▼';
                    toggleButton.classList.remove('open');
                }
            });

            this.activeProject = null;
            this.cleanAllClasses();
            this.resetFilters();
            this.scrollProjectsToTop();
        });
    }

    /**
     * Fermer tous les sous-menus déroulants d'une carte
     */
    closeInnerDropdowns(card) {
        const innerDropdowns = card.querySelectorAll('.edu-dropdown[open]');
        innerDropdowns.forEach(dropdown => dropdown.removeAttribute('open'));
        const projectDetails = card.querySelectorAll('.project-subdetails[open]');
        projectDetails.forEach(detail => detail.removeAttribute('open'));
    }

    /**
     * Nettoyage complet de toutes les classes de filtrage
     */
    cleanAllClasses() {
        // Nettoyer toutes les compétences
        this.skillFilters.forEach(filter => {
            filter.classList.remove('active', 'dimmed', 'is-filtered', 'is-hidden', 'highlighted');
            filter.style.pointerEvents = 'auto';
        });
        
        // Nettoyer tous les séparateurs et labels
        if (this.skillsList) {
            this.skillsList.querySelectorAll('.skills-separator').forEach(s => s.classList.remove('is-filtered'));
            this.skillsList.querySelectorAll('.skills-learning-label').forEach(l => l.classList.remove('is-filtered'));
        }
        // Nettoyer les séparateurs/labels de projets
        if (this.projectsList) {
            this.projectsList.querySelectorAll('.projects-separator').forEach(s => s.classList.remove('is-filtered'));
            this.projectsList.querySelectorAll('.projects-category-label').forEach(l => l.classList.remove('is-filtered'));
        }
        
        // Nettoyer tous les projets
        this.projectCards.forEach(card => {
            card.classList.remove('highlighted', 'dimmed', 'is-filtered', 'is-hidden', 'project-card-open', 'title-hover');
            card.style.pointerEvents = 'auto';
        });
    }

    /**
     * Filtrage des projets par compétence
     */
    filterBySkill(skill) {
        // Mise à jour des tags actifs
        this.skillFilters.forEach(filter => {
            filter.classList.remove('active');
            filter.classList.remove('dimmed');
        });

        this.projectCards.forEach(card => {
            card.classList.remove('is-hidden');
        });

        const activeFilter = this.root.querySelector(`[data-target-skill="${skill}"]`);
        if (activeFilter) {
            activeFilter.classList.add('active');
        }

        // Réinitialiser la mise en évidence des projets
        this.activeProject = null;

        if (skill === 'all') {
            // Afficher tous les projets et retirer is-filtered
            this.projectCards.forEach(card => {
                card.classList.remove('is-filtered');
                card.classList.remove('dimmed');
                card.classList.remove('highlighted');
                card.classList.remove('is-hidden');
                card.style.pointerEvents = 'auto';
            });
            // Retirer les classes is-filtered de tous les séparateurs et labels
            if (this.skillsList) {
                this.skillsList.querySelectorAll('.skills-separator').forEach(s => s.classList.remove('is-filtered'));
                this.skillsList.querySelectorAll('.skills-learning-label').forEach(l => l.classList.remove('is-filtered'));
            }
            // Retirer is-filtered des séparateurs/labels de projets
            if (this.projectsList) {
                this.projectsList.querySelectorAll('.projects-separator').forEach(s => s.classList.remove('is-filtered'));
                this.projectsList.querySelectorAll('.projects-category-label').forEach(l => l.classList.remove('is-filtered'));
            }
            this.moveDisabledProjectsToEnd();
            return;
        }

        // Trier les projets : correspondants en premier
        const matchingProjects = [];
        const nonMatchingProjects = [];
        const projectsList = this.projectsList;
        if (!projectsList) return;

        // Appliquer is-filtered aux séparateurs et labels (compétences)
        if (this.skillsList) {
            this.skillsList.querySelectorAll('.skills-separator').forEach(s => s.classList.add('is-filtered'));
            this.skillsList.querySelectorAll('.skills-learning-label').forEach(l => l.classList.add('is-filtered'));
        }
        // Garder les séparateurs/labels de catégories de projets visibles
        if (this.projectsList) {
            this.projectsList.querySelectorAll('.projects-separator').forEach(s => s.classList.remove('is-filtered'));
            this.projectsList.querySelectorAll('.projects-category-label').forEach(l => l.classList.remove('is-filtered'));
        }

        this.projectCards.forEach(card => {
            const cardSkills = card.getAttribute('data-skills').split(' ');
            if (cardSkills.includes(skill)) {
                card.classList.remove('is-filtered');
                card.classList.remove('dimmed');
                card.classList.add('highlighted');
                card.classList.remove('is-hidden');
                card.style.pointerEvents = 'auto';
                matchingProjects.push(card);
            } else {
                card.classList.remove('highlighted');
                card.classList.remove('dimmed');
                card.classList.add('is-hidden'); // hide completely
                card.classList.remove('is-filtered');
                card.style.pointerEvents = 'none';
                nonMatchingProjects.push(card);
            }
        });

        this.moveDisabledProjectsToEnd();
        
        // Scroll en haut de la liste des projets avec animation douce
        projectsList.scrollTo({top: 0, behavior: 'smooth'});
    }

    /**
     * Mise en évidence des compétences associées à un projet
     */
    highlightSkills(skills) {
        const skillsList = this.skillsList;
        const skillsSidebar = this.skillsSidebar;
        if (!skillsList || !skillsSidebar) return;
        const matchingSkills = [];
        
        // Réinitialiser tous les filtres
        this.skillFilters.forEach(filter => {
            filter.classList.remove('active');
            filter.classList.remove('dimmed');
            filter.classList.remove('is-filtered');
            filter.classList.remove('highlighted');
        });

        // Identifier et collecter les compétences correspondantes
        this.skillFilters.forEach(filter => {
            const targetSkill = filter.getAttribute('data-target-skill');

            if (targetSkill === 'all') {
                filter.classList.add('is-hidden');
                filter.style.pointerEvents = 'none';
            } else if (skills.includes(targetSkill)) {
                filter.classList.add('highlighted');
                filter.classList.add('active');
                filter.style.pointerEvents = 'auto';
                matchingSkills.push(filter);
            } else {
                filter.classList.add('is-hidden');
                filter.style.pointerEvents = 'none';
            }
        });
        
        // Garder les séparateurs et labels visibles (ne PAS ajouter is-filtered)
        // Les catégories restent affichées
        
        // Réordonner les compétences :
        // - associées en haut de la section "acquises"
        // - associées en haut de la section "en cours d'acquisition"
        this.reorderSkillsWithinSections(skills, matchingSkills);
        
        // Scroll vers le haut de la sidebar après un court délai pour la reorganisation du DOM
        setTimeout(() => {
            skillsSidebar.scrollTo({top: 0, behavior: 'smooth'});
        }, 10);

        // Estomper les autres projets et forcer pointer-events
        this.projectCards.forEach(card => {
            if (card === this.activeProject) {
                card.classList.add('highlighted');
                card.classList.remove('dimmed');
                card.classList.remove('is-filtered');
                card.classList.remove('is-hidden');
                card.style.pointerEvents = 'auto';
            } else {
                card.classList.remove('highlighted');
                card.classList.remove('dimmed');
                card.classList.remove('is-filtered');
                card.classList.add('is-hidden');
                card.style.pointerEvents = 'none';
            }
        });

        // Masquer les séparateurs/labels de catégories de projets
        if (this.projectsList) {
            this.projectsList.querySelectorAll('.projects-separator').forEach(s => s.classList.add('is-filtered'));
            this.projectsList.querySelectorAll('.projects-category-label').forEach(l => l.classList.add('is-filtered'));
        }
    }

    reorderSkillsWithinSections(skills, matchingSkills = []) {
        const skillsList = this.skillsList;
        if (!skillsList || !this.initialSkillsChildren || !this.initialSkillsChildren.length) return;

        // Trouver tous les séparateurs et labels dans l'ordre initial
        const separators = this.initialSkillsChildren.filter(child => child.classList && child.classList.contains('skills-separator'));
        const labels = this.initialSkillsChildren.filter(child => child.classList && child.classList.contains('skills-learning-label'));

        // Séparer les skills en 2 catégories basé sur la structure HTML d'origine
        // Structure : sep1 → label1 → [skills acquises] → sep2 → label2 → [skills en cours]
        const acquiredSeparator = separators[0] || null;
        const acquiredLabel = labels[0] || null;
        const learningSeparator = separators[1] || null;
        const learningLabel = labels[1] || null;

        const acquiredSkills = [];
        const learningSkills = [];

        let section = 0; // 0 = avant tout, 1 = acquises, 2 = en cours
        this.initialSkillsChildren.forEach(child => {
            if (child === acquiredLabel) {
                section = 1;
                return;
            }
            if (child === learningLabel) {
                section = 2;
                return;
            }
            if (child.classList && child.classList.contains('skill-filter')) {
                if (section === 2) {
                    learningSkills.push(child);
                } else {
                    acquiredSkills.push(child);
                }
            }
        });

        const matches = new Set(matchingSkills.length ? matchingSkills : this.skillFilters);
        const isAssociated = (filter) => matches.has(filter) && skills.includes(filter.getAttribute('data-target-skill'));

        const acquiredTop = acquiredSkills.filter(isAssociated);
        const acquiredRest = acquiredSkills.filter(filter => !isAssociated(filter));
        const learningTop = learningSkills.filter(isAssociated);
        const learningRest = learningSkills.filter(filter => !isAssociated(filter));

        // Reconstruire le DOM dans l'ordre : sep1 → label1 → skills acquises → sep2 → label2 → skills en cours
        if (acquiredSeparator) skillsList.appendChild(acquiredSeparator);
        if (acquiredLabel) skillsList.appendChild(acquiredLabel);
        acquiredTop.forEach(filter => skillsList.appendChild(filter));
        acquiredRest.forEach(filter => skillsList.appendChild(filter));
        if (learningSeparator) skillsList.appendChild(learningSeparator);
        if (learningLabel) skillsList.appendChild(learningLabel);
        learningTop.forEach(filter => skillsList.appendChild(filter));
        learningRest.forEach(filter => skillsList.appendChild(filter));
    }

    /**
     * Réinitialisation des filtres de compétences
     */
    resetFilters() {
        this.activeSkill = 'all';
        
        const skillsList = this.skillsList;
        if (!skillsList) return;
        
        // Remettre les compétences dans l'ordre initial et réinitialiser les styles
        this.initialSkillsOrder.forEach(filter => {
            filter.classList.remove('active');
            filter.classList.remove('dimmed');
            filter.classList.remove('is-filtered');
            filter.classList.remove('is-hidden');
            filter.classList.remove('highlighted');
            filter.style.pointerEvents = 'auto';
            
            if (filter.getAttribute('data-target-skill') === 'all') {
                filter.classList.add('active');
            }
        });
        
        // Retirer les classes is-filtered du séparateur et du label "En cours d'acquisition"
        const separators = skillsList.querySelectorAll('.skills-separator');
        const learningLabels = skillsList.querySelectorAll('.skills-learning-label');
        separators.forEach(s => s.classList.remove('is-filtered'));
        learningLabels.forEach(l => l.classList.remove('is-filtered'));
        
        // Restaurer tous les enfants (boutons + ligne) dans l'ordre initial
        if (this.initialSkillsChildren) {
            this.initialSkillsChildren.forEach(child => {
                skillsList.appendChild(child);
            });
        }

        // Réinitialiser les projets et pointer-events
        this.projectCards.forEach(card => {
            card.classList.remove('is-filtered');
            card.classList.remove('dimmed');
            card.classList.remove('highlighted');
            card.classList.remove('is-hidden');
            card.style.pointerEvents = 'auto';
        });

        // Retirer is-filtered des séparateurs/labels de projets
        if (this.projectsList) {
            this.projectsList.querySelectorAll('.projects-separator').forEach(s => s.classList.remove('is-filtered'));
            this.projectsList.querySelectorAll('.projects-category-label').forEach(l => l.classList.remove('is-filtered'));
        }

        // Remettre tous les enfants de projects-list dans l'ordre initial (cartes + séparateurs)
        if (this.projectsList && this.initialProjectsChildren && this.initialProjectsChildren.length) {
            this.initialProjectsChildren.forEach(child => {
                this.projectsList.appendChild(child);
            });
        }

        this.moveDisabledProjectsToEnd();
    }

    applySkillFilterState(skill) {
        this.skillFilters.forEach(filter => {
            filter.classList.remove('active', 'dimmed', 'is-filtered', 'highlighted');
            filter.style.pointerEvents = 'auto';
        });

        this.skillFilters.forEach(filter => {
            const targetSkill = filter.getAttribute('data-target-skill');
            if (targetSkill === skill) {
                filter.classList.add('active', 'highlighted');
            } else {
                filter.classList.add('dimmed');
            }
        });
    }

    /**
     * Réinitialisation de la mise en évidence du projet
     */
    resetProjectHighlight() {
        this.activeProject = null;
        
        // Réinitialiser les filtres de compétences
        this.skillFilters.forEach(filter => {
            filter.classList.remove('active');
            filter.classList.remove('dimmed');
            filter.classList.remove('is-filtered');
            filter.classList.remove('is-hidden');
            filter.classList.remove('highlighted');

            if (filter.getAttribute('data-target-skill') === 'all') {
                filter.classList.add('active');
            }
        });
        
        // Remettre les compétences dans l'ordre initial
        const skillsList = this.skillsList;
        if (!skillsList) return;
        
        // Restaurer tous les enfants (boutons + ligne) dans l'ordre initial
        if (this.initialSkillsChildren) {
            this.initialSkillsChildren.forEach(child => {
                skillsList.appendChild(child);
            });
        }

        // Réinitialiser les projets
        this.projectCards.forEach(card => {
            card.classList.remove('is-filtered');
            card.classList.remove('dimmed');
            card.classList.remove('highlighted');
        });

        this.moveDisabledProjectsToEnd();
    }

    /**
     * Garder les projets désactivés en dernier
     */
    moveDisabledProjectsToEnd() {
        const projectsList = this.projectsList;
        if (!projectsList) return;
        const disabledProjects = projectsList.querySelectorAll('.project-card--disabled');
        disabledProjects.forEach(card => projectsList.appendChild(card));
    }

    /**
     * Revenir en haut de la liste des projets
     */
    scrollProjectsToTop() {
        if (!this.projectsList) return;
        this.projectsList.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Lightbox pour les images des détails
     */
    setupImageLightbox() {
        const lightbox = document.getElementById('image-lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const closeBtn = lightbox?.querySelector('.lightbox-close');

        if (!lightbox || !lightboxImg) return;

        const openLightbox = (img) => {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt || '';
            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
        };

        this.root.querySelectorAll('.project-subdetails-photos img').forEach(img => {
            img.addEventListener('click', (e) => {
                if (!this.isActive()) return;
                e.stopPropagation();
                openLightbox(img);
            });
        });

        this.root.querySelectorAll('.project-subdetails-photos figcaption').forEach(caption => {
            caption.addEventListener('click', (e) => {
                if (!this.isActive()) return;
                e.stopPropagation();
                const img = caption.closest('figure')?.querySelector('img');
                if (!img) return;
                openLightbox(img);
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
            lightboxImg.src = '';
        };

        if (!ProjectsManager.lightboxListenersAdded) {
            lightbox.addEventListener('click', (e) => {
                e.stopPropagation();
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });

            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeLightbox();
                });
            }

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && lightbox.classList.contains('open')) {
                    closeLightbox();
                }
            });

            ProjectsManager.lightboxListenersAdded = true;
        }
    }
}

ProjectsManager.lightboxListenersAdded = false;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.projects-container');
    containers.forEach(container => new ProjectsManager(container));
});
