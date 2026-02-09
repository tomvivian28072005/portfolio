// ========== PARTICULES INTERACTIVES ==========

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn(`Canvas #${canvasId} not found`);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null };
        
        // Densité : 1 particule pour 10000 pixels carrés (moins dense)
        this.particleDensity = 0.0001; // particules par pixel carré
        this.particleCount = 0;
        
        this.connectionDistance = 150;
        this.mouseDistance = 150;
        
        // Récupérer la couleur depuis les variables CSS
        this.updateColors();
        
        // Initialiser
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    /**
     * Met à jour les couleurs depuis les variables CSS
     */
    updateColors() {
        const style = getComputedStyle(document.documentElement);
        this.particleColor = style.getPropertyValue('--particle-dot-color').trim() || style.getPropertyValue('--text-color').trim() || '#2c3e50';
        this.lineColor = style.getPropertyValue('--particle-line-color').trim() || this.particleColor;
    }
    
    /**
     * Initialise le canvas et les particules
     */
    init() {
        this.resizeCanvas();
    }
    
    /**
     * Calcule le nombre de particules en fonction de la surface de l'écran
     */
    calculateParticleCount() {
        const screenArea = this.canvas.width * this.canvas.height;
        return Math.max(30, Math.floor(screenArea * this.particleDensity));
    }
    
    /**
     * Régénère les particules
     */
    regenerateParticles() {
        const newCount = this.calculateParticleCount();
        
        // Ajouter des particules si nécessaire
        while (this.particles.length < newCount) {
            this.particles.push(new Particle(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                this.canvas.width,
                this.canvas.height
            ));
        }
        
        // Supprimer les particules excédentaires
        while (this.particles.length > newCount) {
            this.particles.pop();
        }
        
        this.particleCount = newCount;
    }
    
    /**
     * Redimensionne le canvas à la taille de la fenêtre
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Régénérer les particules avec la nouvelle densité
        this.regenerateParticles();
    }
    
    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Mouvement de la souris
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        // Souris quitte la fenêtre
        document.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
        
        // Redimensionnement de la fenêtre
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        // Détection du changement de thème
        window.addEventListener('themeChanged', () => {
            this.updateColors();
        });
        
        // Détection du changement de mode sombre via MutationObserver
        const observer = new MutationObserver(() => {
            this.updateColors();
        });
        observer.observe(document.body, { 
            attributes: true, 
            attributeFilter: ['class'] 
        });
    }
    
    /**
     * Trace une ligne entre deux points
     */
    drawLine(x1, y1, x2, y2, opacity = 1) {
        this.ctx.strokeStyle = this.lineColor;
        this.ctx.globalAlpha = opacity;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * Dessine une particule
     */
    drawParticle(x, y, radius) {
        this.ctx.fillStyle = this.particleColor;
        this.ctx.globalAlpha = 0.8;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * Calcule la distance entre deux points
     */
    distance(x1, y1, x2, y2) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Met à jour et dessine les particules
     */
    update() {
        // Nettoyer le canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Mettre à jour les particules
        this.particles.forEach(particle => {
            particle.update();
            this.drawParticle(particle.x, particle.y, particle.radius);
        });
        
        // Tracer les lignes entre particules proches (réseau)
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dist = this.distance(
                    this.particles[i].x,
                    this.particles[i].y,
                    this.particles[j].x,
                    this.particles[j].y
                );
                
                if (dist < this.connectionDistance) {
                    const opacity = 1 - (dist / this.connectionDistance);
                    this.drawLine(
                        this.particles[i].x,
                        this.particles[i].y,
                        this.particles[j].x,
                        this.particles[j].y,
                        opacity * 0.5
                    );
                }
            }
        }
        
        // Tracer les lignes vers la souris
        if (this.mouse.x !== null && this.mouse.y !== null) {
            this.particles.forEach(particle => {
                const dist = this.distance(
                    this.mouse.x,
                    this.mouse.y,
                    particle.x,
                    particle.y
                );
                
                if (dist < this.mouseDistance) {
                    const opacity = 1 - (dist / this.mouseDistance);
                    this.drawLine(
                        this.mouse.x,
                        this.mouse.y,
                        particle.x,
                        particle.y,
                        opacity * 0.9
                    );
                }
            });
        }
    }
    
    /**
     * Boucle d'animation
     */
    animate() {
        this.update();
        requestAnimationFrame(() => this.animate());
    }
}

/**
 * Classe Particle pour représenter une particule individuelle
 */
class Particle {
    constructor(x, y, maxWidth, maxHeight) {
        this.x = x;
        this.y = y;
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.radius = Math.random() * 1.5 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.8; // Vitesse X entre -0.4 et 0.4
        this.vy = (Math.random() - 0.5) * 0.8; // Vitesse Y entre -0.4 et 0.4
    }
    
    /**
     * Met à jour la position et gère le rebond
     */
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Rebond sur les bords
        if (this.x - this.radius < 0 || this.x + this.radius > this.maxWidth) {
            this.vx *= -1;
            this.x = Math.max(this.radius, Math.min(this.maxWidth - this.radius, this.x));
        }
        
        if (this.y - this.radius < 0 || this.y + this.radius > this.maxHeight) {
            this.vy *= -1;
            this.y = Math.max(this.radius, Math.min(this.maxHeight - this.radius, this.y));
        }
    }
}

// ========== INITIALISATION ==========

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Créer le canvas s'il n'existe pas
    if (!document.getElementById('particle-canvas')) {
        const canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        `;
        document.body.insertBefore(canvas, document.body.firstChild);
    }
    
    // Initialiser le système de particules
    new ParticleSystem('particle-canvas');
});
