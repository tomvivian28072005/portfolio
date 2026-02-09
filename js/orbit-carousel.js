// Orbit Carousel - Navigation entre différentes sections (Compétences, Lieux de vacances, etc.)

import SkillOrbit from './skill-orbit.js';

class OrbitCarousel {
  constructor() {
    this.currentSection = 'projects';
    this.sections = ['skills', 'projects', 'qualities'];
    this.orbitElements = {};
    this.indicators = {};
    this.orbitInstances = {};
    
    this.initElements();
    this.setupEventListeners();
    this.initializeAllOrbits();
  }

  initElements() {
    // Récupérer tous les éléments skill-orbit
    const orbits = document.querySelectorAll('.skill-orbit[data-section]');
    orbits.forEach(orbit => {
      this.orbitElements[orbit.dataset.section] = orbit;
    });

    // Récupérer tous les indicateurs
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach(indicator => {
      this.indicators[indicator.dataset.section] = indicator;
    });

    // Afficher la section initiale
    this.showSection('projects');
  }
  
  initializeAllOrbits() {
    // Créer une instance SkillOrbit pour chaque section
    Object.keys(this.orbitElements).forEach(sectionName => {
      const orbitElement = this.orbitElements[sectionName];
      this.orbitInstances[sectionName] = new SkillOrbit(orbitElement);
    });
  }

  setupEventListeners() {
    const prevBtn = document.getElementById('orbit-prev');
    const nextBtn = document.getElementById('orbit-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousSection());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextSection());
    }

    // Clics sur les indicateurs
    document.querySelectorAll('.indicator').forEach(indicator => {
      indicator.addEventListener('click', () => {
        this.showSection(indicator.dataset.section);
      });
    });

    // Rendre les conteneurs skill-orbit cliquables pour redirection
    Object.keys(this.orbitElements).forEach(sectionName => {
      const orbitElement = this.orbitElements[sectionName];
      const link = orbitElement.dataset.link;
      
      if (link) {
        orbitElement.addEventListener('click', (e) => {
          // Ne pas rediriger si on clique sur un skill-tag
          if (!e.target.classList.contains('skill-tag')) {
            window.location.href = link;
          }
        });
      }
    });
  }

  showSection(sectionName) {
    if (!this.sections.includes(sectionName)) return;

    // Désactiver la gravité de la section précédente
    if (this.currentSection && this.orbitInstances[this.currentSection]) {
      const previousOrbit = this.orbitInstances[this.currentSection];
      if (previousOrbit.gravityEnabled) {
        previousOrbit.toggleGravity();
        const previousBtn = this.orbitElements[this.currentSection].querySelector('.gravity-btn');
        if (previousBtn) {
          previousBtn.classList.remove('active');
        }
      }
    }

    // Masquer toutes les sections
    Object.keys(this.orbitElements).forEach(key => {
      this.orbitElements[key].classList.add('hidden');
    });

    // Désactiver tous les indicateurs
    Object.keys(this.indicators).forEach(key => {
      this.indicators[key].classList.remove('active');
    });

    // Afficher la nouvelle section
    const newOrbit = this.orbitElements[sectionName];
    if (newOrbit) {
      newOrbit.classList.remove('hidden');
      
      // Réinitialiser les blocs au centre
      if (this.orbitInstances[sectionName]) {
        this.orbitInstances[sectionName].resetToCenter();
      }
    }

    // Activer le nouvel indicateur
    const newIndicator = this.indicators[sectionName];
    if (newIndicator) {
      newIndicator.classList.add('active');
    }

    this.currentSection = sectionName;
  }

  previousSection() {
    const currentIndex = this.sections.indexOf(this.currentSection);
    const newIndex = (currentIndex - 1 + this.sections.length) % this.sections.length;
    this.showSection(this.sections[newIndex]);
  }

  nextSection() {
    const currentIndex = this.sections.indexOf(this.currentSection);
    const newIndex = (currentIndex + 1) % this.sections.length;
    this.showSection(this.sections[newIndex]);
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  new OrbitCarousel();
});
