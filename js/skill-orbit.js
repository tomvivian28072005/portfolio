// Skill Orbit - Composant interactif de compétences flottantes

class SkillOrbit {
  constructor(containerElement) {
    // Accepter soit un ID soit un élément DOM
    this.container = typeof containerElement === 'string' 
      ? document.getElementById(containerElement)
      : containerElement;
      
    if (!this.container) return;

    this.tags = Array.from(this.container.querySelectorAll('.skill-tag'));
    this.particles = [];
    this.mouseX = -1000;
    this.mouseY = -1000;
    this.repulsionRadius = 120;
    this.gravityEnabled = false;
    this.frozenEnabled = false;

    this.initializeParticles();
    this.setupEventListeners();
    this.animate();
  }

  initializeParticles() {
    const containerWidth = this.container.offsetWidth;
    const containerHeight = this.container.offsetHeight;
    
    // Sauvegarder les dimensions initiales pour le redimensionnement
    this.lastWidth = containerWidth;
    this.lastHeight = containerHeight;

    this.tags.forEach((tag, index) => {
      // Forcer l'affichage temporaire pour obtenir les vraies dimensions
      const wasHidden = this.container.classList.contains('hidden');
      if (wasHidden) {
        this.container.style.visibility = 'hidden';
        this.container.classList.remove('hidden');
      }

      const tagWidth = tag.offsetWidth || 80;
      const tagHeight = tag.offsetHeight || 30;
      
      if (wasHidden) {
        this.container.classList.add('hidden');
        this.container.style.visibility = '';
      }

      const particle = {
        element: tag,
        x: containerWidth / 2 + (Math.random() - 0.5) * 100,
        y: containerHeight / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        width: tagWidth,
        height: tagHeight,
        radius: Math.max(tagWidth, tagHeight) / 2,
        speed: 0.5 + Math.random() * 1.5,
        noiseX: Math.random() * 1000,
        noiseY: Math.random() * 1000,
      };

      this.particles.push(particle);
      this.updateTagPosition(particle);
    });
  }

  setupEventListeners() {
    this.container.addEventListener('mousemove', (e) => {
      const containerRect = this.container.getBoundingClientRect();
      this.mouseX = e.clientX - containerRect.left;
      this.mouseY = e.clientY - containerRect.top;
    });

    this.container.addEventListener('mouseleave', () => {
      this.mouseX = -1000;
      this.mouseY = -1000;
    });

    // Bouton de gravité
    const gravityBtn = this.container.querySelector('.gravity-btn');
    if (gravityBtn) {
      gravityBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Empêcher la redirection
        this.toggleGravity();
        gravityBtn.classList.toggle('active');
      });
    }

    // Bouton de freeze
    const freezeBtn = this.container.querySelector('.freeze-btn');
    if (freezeBtn) {
      freezeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Empêcher la redirection
        this.toggleFreeze();
        freezeBtn.classList.toggle('active');
      });
    }

    window.addEventListener('resize', () => this.handleResize());
  }

  toggleGravity() {
    this.gravityEnabled = !this.gravityEnabled;
  }

  handleResize() {
    // Au lieu de réinitialiser, on ajuste proportionnellement les positions
    const newWidth = this.container.offsetWidth;
    const newHeight = this.container.offsetHeight;
    
    // Garder l'ancienne taille pour calculer le ratio
    if (!this.lastWidth) {
      this.lastWidth = newWidth;
      this.lastHeight = newHeight;
      return;
    }
    
    const widthRatio = newWidth / this.lastWidth;
    const heightRatio = newHeight / this.lastHeight;
    
    // Ajuster les positions proportionnellement
    this.particles.forEach(particle => {
      particle.x *= widthRatio;
      particle.y *= heightRatio;
      
      // S'assurer que les particules restent dans les limites
      particle.x = Math.max(particle.radius, Math.min(newWidth - particle.radius, particle.x));
      particle.y = Math.max(particle.radius, Math.min(newHeight - particle.radius, particle.y));
      
      this.updateTagPosition(particle);
    });
    
    // Mettre à jour les dimensions de référence
    this.lastWidth = newWidth;
    this.lastHeight = newHeight;
  }

  toggleFreeze() {
    this.frozenEnabled = !this.frozenEnabled;
  }

  resetToCenter() {
    const containerWidth = this.container.offsetWidth;
    const containerHeight = this.container.offsetHeight;

    this.particles.forEach(particle => {
      particle.x = containerWidth / 2 + (Math.random() - 0.5) * 100;
      particle.y = containerHeight / 2 + (Math.random() - 0.5) * 100;
      particle.vx = (Math.random() - 0.5) * 2;
      particle.vy = (Math.random() - 0.5) * 2;
      this.updateTagPosition(particle);
    });
  }

  updateTagPosition(particle) {
    particle.element.style.left = particle.x + 'px';
    particle.element.style.top = particle.y + 'px';
    particle.element.style.transform = 'translate(-50%, -50%)';
  }

  // Perlin noise simple pour un mouvement plus fluide
  noise(x) {
    const xi = Math.floor(x);
    const xf = x - xi;
    const u = xf * xf * (3.0 - 2.0 * xf);
    return Math.sin(xi * 12.9898 + u * 78.233) * 0.5 + 0.5;
  }

  checkCollision(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = p1.radius + p2.radius + 5;

    return distance < minDistance;
  }

  handleCollision(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

    // Normaliser
    const nx = dx / distance;
    const ny = dy / distance;

    // Séparer les particules
    const overlap = (p1.radius + p2.radius + 5) - distance;
    const moveX = (nx * overlap) / 2;
    const moveY = (ny * overlap) / 2;

    p1.x -= moveX;
    p1.y -= moveY;
    p2.x += moveX;
    p2.y += moveY;

    // Si la gravité n'est pas activée, appliquer le rebond
    if (!this.gravityEnabled) {
      // Calcul de la vélocité relative
      const dvx = p2.vx - p1.vx;
      const dvy = p2.vy - p1.vy;
      const dvDot = dvx * nx + dvy * ny;

      // Seulement si les particules se rapprochent
      if (dvDot < 0) {
        // Échange complet de vélocité avec rebond élastique
        const impulse = dvDot;
        
        p1.vx += impulse * nx * 0.8;
        p1.vy += impulse * ny * 0.8;
        
        p2.vx -= impulse * nx * 0.8;
        p2.vy -= impulse * ny * 0.8;
      }
    }
  }

  animate = () => {
    const containerWidth = this.container.offsetWidth;
    const containerHeight = this.container.offsetHeight;
    const time = Date.now() * 0.001;

    this.particles.forEach((particle, index) => {
      // Si frozen, ne pas animer
      if (this.frozenEnabled) {
        this.updateTagPosition(particle);
        return;
      }

      // Si gravité activée, appliquer la force de gravité
      if (this.gravityEnabled) {
        particle.vy += 0.98; // Force de gravité vers le bas (9.8 m/s² simulée)
      } else {
        // Mouvement aléatoire lisse avec noise (mode normal)
        particle.noiseX += 0.01;
        particle.noiseY += 0.01;

        const randomX = (this.noise(particle.noiseX) - 0.5) * 2;
        const randomY = (this.noise(particle.noiseY) - 0.5) * 2;

        particle.vx += randomX * 0.1;
        particle.vy += randomY * 0.1;
      }

      // Limite la vitesse
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      const maxSpeed = this.gravityEnabled ? 15 : 3;
      if (speed > maxSpeed) {
        particle.vx = (particle.vx / speed) * maxSpeed;
        particle.vy = (particle.vy / speed) * maxSpeed;
      }

      // Friction légère (plus faible après lancer)
      particle.vx *= 0.97;
      particle.vy *= 0.97;

      // Répulsion de la souris
      const dx = particle.x - this.mouseX;
      const dy = particle.y - this.mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.repulsionRadius && distance > 0) {
        const angle = Math.atan2(dy, dx);
        const force = (this.repulsionRadius - distance) / this.repulsionRadius;

        // Forte répulsion
        particle.vx += Math.cos(angle) * force * 1.5;
        particle.vy += Math.sin(angle) * force * 1.5;
      }

      // Mise à jour position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Rebond sur les bords avec élasticité
      if (particle.x - particle.radius < 0) {
        particle.x = particle.radius;
        particle.vx = Math.abs(particle.vx) * 0.9;
      }
      if (particle.x + particle.radius > containerWidth) {
        particle.x = containerWidth - particle.radius;
        particle.vx = -Math.abs(particle.vx) * 0.9;
      }
      if (particle.y - particle.radius < 0) {
        particle.y = particle.radius;
        particle.vy = Math.abs(particle.vy) * 0.9;
      }
      if (particle.y + particle.radius > containerHeight) {
        particle.y = containerHeight - particle.radius;
        particle.vy = -Math.abs(particle.vy) * 0.9;
      }

      this.updateTagPosition(particle);
    });

    // Détection de collision entre particules (toujours active)
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        if (this.checkCollision(this.particles[i], this.particles[j])) {
          this.handleCollision(this.particles[i], this.particles[j]);
        }
      }
    }

    requestAnimationFrame(this.animate);
  };
}

// Exporter la classe pour utilisation dans d'autres modules
export default SkillOrbit;
