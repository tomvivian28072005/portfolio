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
        
        // Sauvegarder l'ordre initial des compétences
        this.initialSkillsOrder = Array.from(this.skillFilters);
        this.initialProjectsOrder = Array.from(this.projectCards);

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
        this.initialProjectsOrder.forEach(card => {
            this.projectsList.appendChild(card);
        });
        this.moveDisabledProjectsToEnd();
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

        this.initialProjectsOrder.forEach(card => {
            this.projectsList.appendChild(card);
        });
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

                // Si on clique sur le bouton toggle ou le titre déroulant, ne pas déclencher le filtre
                if (e.target.classList.contains('toggle-details') || e.target.closest('summary')) {
                    return;
                }
                
                e.preventDefault();
                e.stopPropagation();
                
                const skills = card.getAttribute('data-skills').split(' ');
                const details = card.querySelector('.project-details');
                const toggleButton = card.querySelector('.toggle-details');
                const projectsList = this.projectsList;
                
                // Si on clique sur le projet déjà actif, on le déselectionne
                if (this.activeProject === card) {
                    // Fermer les détails
                    if (details && !details.classList.contains('hidden')) {
                        details.classList.add('hidden');
                        this.closeInnerDropdowns(card);
                        if (toggleButton) {
                            toggleButton.textContent = '▼';
                            toggleButton.classList.remove('open');
                        }
                    }
                    
                    // Réinitialiser complètement
                    this.activeProject = null;
                    this.cleanAllClasses();
                    this.resetFilters();
                    this.scrollProjectsToTop();
                    return;
                }
                
                // Fermer le projet précédemment actif s'il existe
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
                
                // Nettoyage complet de toutes les classes avant toute action
                this.cleanAllClasses();
                
                this.activeProject = card;
                this.highlightSkills(skills);
                
                // Déployer automatiquement le projet
                if (details.classList.contains('hidden')) {
                    details.classList.remove('hidden');
                    if (toggleButton) {
                        toggleButton.textContent = '▲';
                        toggleButton.classList.add('open');
                    }
                }
                
                // Scroller la colonne des projets pour remonter le projet
                if (projectsList) {
                    setTimeout(() => {
                        const cardOffsetTop = card.offsetTop;
                        projectsList.scrollTo({
                            top: cardOffsetTop - 140, // 140px de marge pour ne pas cacher le titre
                            behavior: 'smooth'
                        });
                    }, 50);
                }
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
                const details = card.querySelector('.project-details');
                
                // Toggle de l'affichage
                details.classList.toggle('hidden');
                
                // Rotation de la flèche
                if (details.classList.contains('hidden')) {
                    button.textContent = '▼';
                    button.classList.remove('open');
                    this.closeInnerDropdowns(card);
                } else {
                    button.textContent = '▲';
                    button.classList.add('open');
                }
            });
        });
    }

    /**
     * Désélectionner et fermer les détails quand on clique en dehors
     */
    setupBackgroundDeselect() {
        document.addEventListener('click', (e) => {
            if (!this.isActive()) return;
            if (!this.root.contains(e.target)) return;
            if (e.target.closest('.project-card')) return;
            if (e.target.closest('.skill-filter')) return;
            if (e.target.closest('.toggle-details')) return;

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
            filter.classList.remove('active', 'dimmed', 'is-filtered', 'highlighted');
            filter.style.pointerEvents = 'auto';
        });
        
        // Nettoyer tous les projets
        this.projectCards.forEach(card => {
            card.classList.remove('highlighted', 'dimmed', 'is-filtered');
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
                card.style.pointerEvents = 'auto';
            });
            this.moveDisabledProjectsToEnd();
            return;
        }

        // Trier les projets : correspondants en premier
        const matchingProjects = [];
        const nonMatchingProjects = [];
        const projectsList = this.projectsList;
        if (!projectsList) return;

        this.projectCards.forEach(card => {
            const cardSkills = card.getAttribute('data-skills').split(' ');
            
            if (cardSkills.includes(skill)) {
                card.classList.remove('is-filtered');
                card.classList.remove('dimmed');
                card.classList.add('highlighted');
                card.style.pointerEvents = 'auto';
                matchingProjects.push(card);
            } else {
                card.classList.add('is-filtered');
                card.classList.remove('highlighted');
                card.style.pointerEvents = 'none';
                nonMatchingProjects.push(card);
            }
        });

        // Déplacer physiquement les projets correspondants en haut du DOM
        // On inverse l'ordre pour que le premier du tableau soit bien en haut
        matchingProjects.reverse().forEach(card => {
            projectsList.prepend(card);
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
                filter.classList.add('is-filtered');
                filter.style.pointerEvents = 'none';
            } else if (skills.includes(targetSkill)) {
                filter.classList.add('highlighted');
                filter.classList.add('active');
                filter.style.pointerEvents = 'auto';
                matchingSkills.push(filter);
            } else {
                filter.classList.add('is-filtered');
                filter.style.pointerEvents = 'none';
            }
        });
        
        // Déplacer physiquement les compétences correspondantes en haut
        matchingSkills.reverse().forEach(filter => {
            skillsList.prepend(filter);
        });
        
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
                card.style.pointerEvents = 'auto';
            } else {
                card.classList.remove('highlighted');
                card.classList.add('dimmed');
                card.classList.add('is-filtered');
                card.style.pointerEvents = 'none';
            }
        });
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
            filter.classList.remove('highlighted');
            filter.style.pointerEvents = 'auto';
            
            if (filter.getAttribute('data-target-skill') === 'all') {
                filter.classList.add('active');
            }
            
            skillsList.appendChild(filter);
        });

        // Réinitialiser les projets et pointer-events
        this.projectCards.forEach(card => {
            card.classList.remove('is-filtered');
            card.classList.remove('dimmed');
            card.classList.remove('highlighted');
            card.style.pointerEvents = 'auto';
        });

        this.moveDisabledProjectsToEnd();
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
            filter.classList.remove('highlighted');
            
            if (filter.getAttribute('data-target-skill') === 'all') {
                filter.classList.add('active');
            }
        });
        
        // Remettre les compétences dans l'ordre initial
        const skillsList = this.skillsList;
        if (!skillsList) return;
        
        this.initialSkillsOrder.forEach(filter => {
            skillsList.appendChild(filter);
        });

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
