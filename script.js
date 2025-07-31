/**
 * Resume Quest - Interactive Portfolio Game
 * A pixel art adventure showcasing professional experience and skills
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        // Game dimensions
        this.tileSize = 48; // Environment tiles
        this.characterSize = 32; // Character sprites
        this.mapWidth = 32;
        this.mapHeight = 24;
        
        // Player configuration
        this.player = {
            x: 8,
            y: 12,
            sprite: 0,
            animFrame: 0,
            facing: 'down'
        };
        
        // Game state
        this.camera = { x: 0, y: 0 };
        this.keys = {};
        this.lastTime = 0;
        this.animTimer = 0;
        this.moveTimer = 0;
        this.moveDelay = 200;
        this.showingDialog = false;
        
        this.dialogBox = document.getElementById('dialogBox');
        
        this.initializeGame();
    }
    
    /**
     * Initialize all game components
     */
    initializeGame() {
        this.initializeMap();
        this.initializeNPCs();
        this.setupControls();
        this.gameLoop();
    }
    
    /**
     * Generate the game world map
     */
    initializeMap() {
        this.map = [];
        for (let y = 0; y < this.mapHeight; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                if (y === 0 || y === this.mapHeight - 1 || x === 0 || x === this.mapWidth - 1) {
                    this.map[y][x] = 2; // Water border
                } else if (Math.random() < 0.1) {
                    this.map[y][x] = 3; // Random trees
                } else if (Math.random() < 0.05) {
                    this.map[y][x] = 1; // Random stones
                } else {
                    this.map[y][x] = 0; // Grass
                }
            }
        }
        
        // Clear areas around NPCs and player spawn
        const clearPositions = [[12, 8], [10, 15], [15, 10], [8, 20], [18, 25]];
        clearPositions.forEach(([y, x]) => {
            if (this.map[y] && this.map[y][x] !== undefined) {
                this.map[y][x] = 0;
            }
        });
    }
    
    /**
     * Initialize Non-Player Characters with resume information
     */
    initializeNPCs() {
        this.npcs = [
            {
                x: 15, y: 10, sprite: 1, name: "Experience Keeper",
                dialog: "🏢 WORK EXPERIENCE\n\n• Project Coordinator\n  Deluxe Media Inc. - Managed subtitle and script projects for major entertainment companies including Amazon, Netflix, Disney, Lionsgate, MGM, Sony, Universal, and Warner. Improved team productivity while maintaining perfect on-time delivery.\n\n  -Collaborated with Creative, Order Management, Asset, Language Services, and Quality Control teams for smooth localization processes. Used Sfera platform to maintain quality standards and prevent client issues.\n\n -Streamlined cross-departmental workflows by managing linguist schedules, processing payments, and coordinating global team handovers. Resolved asset delays and vendor communication issues to keep projects on schedule."
            },
            {
                x: 10, y: 15, sprite: 2, name: "Skills Master",
                dialog: "⚡ SIDE-PROJECTS/AWARDS\n\n🚀 Pokémon Essentials v13 Project:\n -Conceived an original region, storyline, and character set, applying a consistent pixel-art style and color palette.\n -Customized base assets in Pokémon Essentials: added new starters, balanced early-game encounter tables, and tweaked battle mechanics.\n\n🛠️ Game Boy Advance ROM Hacks:\n -De-compiled and rebuilt GBA ROMs, overhauling level layouts with AdvanceMap 1.92 and repointing tilesets to expand world size beyond vanilla limits.\n -Balanced custom regional Pokédex entries in YAPE 0.9, adjusting base stats, movesets, evolution data, and experience curves for competitive parity.\n -Re-scripted in-game events and added new items through open-source hex editors and community scripting tools (XSE, A-Text), learning memory offsets and pointer tables\n\n☁️ Award:\n -Robotics Camp Winner - First Edition (Science Centre, Mizoram)"
            },
            {
                x: 20, y: 8, sprite: 3, name: "Education Sage",
                dialog: "🎓 EDUCATION & CERTIFICATIONS\n\n📚 Bachelor of Technology (Computer Science & Engineering)\nNIT Mizoram\n\nPositions: State Co-Convener of Think India: Mizoram, Event Host/Emcee/Anchor, Assistant Sports Secretary\n\n🏆 Certifications:\n• Ethical Hacking and Penetration Testing (CDAC, Noida)\n• Foundation Program on Nano Science and Technology (IISc Bengaluru)\n\n🌟 Projects:\n• College Healthcare Facilities: Enhanced accessibility and quality of healthcare for college students through a website providing information on medical services, enabling appointment booking, online consultations, and feedback submission, alongside managing health records and statistics."
            },
            {
                x: 25, y: 18, sprite: 4, name: "Contact Oracle",
                dialog: "📬 GET IN TOUCH\n\n📧 Email: ixrindika@gmail.com\n🔗 LinkedIn: linkedin.com/in/rindika"
            }
        ];
    }
    
    /**
     * Setup keyboard controls and interaction handlers
     */
    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleInteraction();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Click to close dialog
        this.dialogBox.addEventListener('click', () => {
            this.hideDialog();
        });
    }
    
    /**
     * Handle player interaction with NPCs
     */
    handleInteraction() {
        if (this.showingDialog) {
            this.hideDialog();
            return;
        }
        
        // Check for nearby NPCs
        for (let npc of this.npcs) {
            const distance = Math.abs(this.player.x - npc.x) + Math.abs(this.player.y - npc.y);
            if (distance <= 1) {
                this.showDialog(npc.dialog);
                return;
            }
        }
    }
    
    /**
     * Display dialog box with NPC information
     */
    showDialog(text) {
        this.dialogBox.innerHTML = text.replace(/\n/g, '<br>');
        this.dialogBox.style.display = 'block';
        this.showingDialog = true;
    }
    
    /**
     * Hide dialog box
     */
    hideDialog() {
        this.dialogBox.style.display = 'none';
        this.showingDialog = false;
    }
    
    /**
     * Update game state
     */
    update(deltaTime) {
        if (this.showingDialog) return;
        
        this.updateAnimation(deltaTime);
        this.updateMovement(deltaTime);
        this.updateCamera();
    }
    
    /**
     * Update character animations
     */
    updateAnimation(deltaTime) {
        this.animTimer += deltaTime;
        if (this.animTimer > 500) {
            this.player.animFrame = (this.player.animFrame + 1) % 2;
            this.animTimer = 0;
        }
    }
    
    /**
     * Handle player movement
     */
    updateMovement(deltaTime) {
        this.moveTimer += deltaTime;
        
        let newX = this.player.x;
        let newY = this.player.y;
        let moving = false;
        
        if (this.moveTimer >= this.moveDelay) {
            if (this.keys['KeyW'] || this.keys['ArrowUp']) {
                newY--;
                this.player.facing = 'up';
                moving = true;
                this.moveTimer = 0;
            }
            if (this.keys['KeyS'] || this.keys['ArrowDown']) {
                newY++;
                this.player.facing = 'down';
                moving = true;
                this.moveTimer = 0;
            }
            if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
                newX--;
                this.player.facing = 'left';
                moving = true;
                this.moveTimer = 0;
            }
            if (this.keys['KeyD'] || this.keys['ArrowRight']) {
                newX++;
                this.player.facing = 'right';
                moving = true;
                this.moveTimer = 0;
            }
        }
        
        if (moving && this.canMoveTo(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
        }
        
        if (!moving) {
            this.player.animFrame = 0;
        }
    }
    
    /**
     * Update camera position to follow player
     */
    updateCamera() {
        this.camera.x = Math.max(0, Math.min(
            this.player.x * this.tileSize - this.canvas.width / 2, 
            this.mapWidth * this.tileSize - this.canvas.width
        ));
        this.camera.y = Math.max(0, Math.min(
            this.player.y * this.tileSize - this.canvas.height / 2, 
            this.mapHeight * this.tileSize - this.canvas.height
        ));
    }
    
    /**
     * Check if player can move to specified position
     */
    canMoveTo(x, y) {
        // Boundary check
        if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) return false;
        
        // Tile collision check
        const tile = this.map[y][x];
        if (tile === 2 || tile === 3) return false; // Water and trees are solid
        
        // NPC collision check
        for (let npc of this.npcs) {
            if (npc.x === x && npc.y === y) return false;
        }
        
        return true;
    }
    
    /**
     * Render the game world
     */
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderTiles();
        this.renderNPCs();
        this.renderPlayer();
    }
    
    /**
     * Render environment tiles
     */
    renderTiles() {
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const screenX = x * this.tileSize - this.camera.x;
                const screenY = y * this.tileSize - this.camera.y;
                
                // Cull off-screen tiles
                if (screenX < -this.tileSize || screenX > this.canvas.width ||
                    screenY < -this.tileSize || screenY > this.canvas.height) continue;
                
                this.drawTile(this.map[y][x], screenX, screenY);
            }
        }
    }
    
    /**
     * Render NPCs with interaction indicators
     */
    renderNPCs() {
        for (let npc of this.npcs) {
            const screenX = npc.x * this.tileSize - this.camera.x;
            const screenY = npc.y * this.tileSize - this.camera.y;
            
            this.drawSprite(npc.sprite, screenX, screenY);
            
            // Show interaction indicator when player is nearby
            const distance = Math.abs(this.player.x - npc.x) + Math.abs(this.player.y - npc.y);
            if (distance <= 1) {
                this.drawInteractionIndicator(screenX, screenY);
            }
        }
    }
    
    /**
     * Render the player character
     */
    renderPlayer() {
        const playerScreenX = this.player.x * this.tileSize - this.camera.x;
        const playerScreenY = this.player.y * this.tileSize - this.camera.y;
        this.drawPlayer(playerScreenX, playerScreenY);
    }
    
    /**
     * Draw interaction indicator above NPC
     */
    drawInteractionIndicator(x, y) {
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(x + 16, y - 8, 12, 8);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x + 18, y - 6, 8, 4);
    }
    
    /**
     * Draw environment tile
     */
    drawTile(tileType, x, y) {
        const size = this.tileSize;
        
        switch (tileType) {
            case 0: // Grass
                this.drawGrassTile(x, y, size);
                break;
            case 1: // Stone
                this.drawStoneTile(x, y, size);
                break;
            case 2: // Water
                this.drawWaterTile(x, y, size);
                break;
            case 3: // Tree
                this.drawTreeTile(x, y, size);
                break;
        }
    }
    
    /**
     * Draw grass tile with detailed texture
     */
    drawGrassTile(x, y, size) {
        // Base grass
        this.ctx.fillStyle = '#2a5a1a';
        this.ctx.fillRect(x, y, size, size);
        
        // Grass layers
        this.ctx.fillStyle = '#3a6b2a';
        this.ctx.fillRect(x + 6, y + 6, 12, 12);
        this.ctx.fillRect(x + 30, y + 24, 9, 9);
        this.ctx.fillRect(x + 12, y + 36, 6, 6);
        
        // Grass texture
        this.ctx.fillStyle = '#4a7c3a';
        this.ctx.fillRect(x + 8, y + 8, 8, 8);
        this.ctx.fillRect(x + 32, y + 26, 6, 6);
        this.ctx.fillRect(x + 20, y + 16, 4, 8);
        
        // Grass blades
        this.ctx.fillStyle = '#5a8c4a';
        this.ctx.fillRect(x + 10, y + 10, 2, 8);
        this.ctx.fillRect(x + 34, y + 28, 2, 6);
        this.ctx.fillRect(x + 24, y + 20, 2, 6);
        this.ctx.fillRect(x + 15, y + 38, 2, 4);
        this.ctx.fillRect(x + 6, y + 24, 2, 6);
        this.ctx.fillRect(x + 40, y + 12, 2, 4);
    }
    
    /**
     * Draw stone tile with realistic shading
     */
    drawStoneTile(x, y, size) {
        // Base stone
        this.ctx.fillStyle = '#3a3a3a';
        this.ctx.fillRect(x, y, size, size);
        
        // Stone body
        this.ctx.fillStyle = '#4a4a4a';
        this.ctx.fillRect(x + 3, y + 3, size - 6, size - 6);
        
        // Stone highlights
        this.ctx.fillStyle = '#6a6a6a';
        this.ctx.fillRect(x + 6, y + 6, size - 12, 12);
        this.ctx.fillRect(x + 6, y + 24, 18, 6);
        this.ctx.fillRect(x + 30, y + 30, 12, 12);
        
        // Stone details
        this.ctx.fillStyle = '#8a8a8a';
        this.ctx.fillRect(x + 8, y + 8, size - 16, 8);
        this.ctx.fillRect(x + 8, y + 26, 14, 4);
        this.ctx.fillRect(x + 32, y + 32, 8, 8);
        
        // Stone shadows
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(x + size - 6, y + 6, 6, size - 6);
        this.ctx.fillRect(x + 6, y + size - 6, size - 12, 6);
    }
    
    /**
     * Draw water tile with animated effect
     */
    drawWaterTile(x, y, size) {
        // Deep water
        this.ctx.fillStyle = '#0a3a7a';
        this.ctx.fillRect(x, y, size, size);
        
        // Water layers
        this.ctx.fillStyle = '#1a4a8a';
        this.ctx.fillRect(x + 3, y + 3, size - 6, size - 6);
        
        // Water surface
        this.ctx.fillStyle = '#2a5a9a';
        this.ctx.fillRect(x + 6, y + 6, size - 12, size - 12);
        
        // Water highlights
        this.ctx.fillStyle = '#3a6aaa';
        this.ctx.fillRect(x + 8, y + 8, 18, 6);
        this.ctx.fillRect(x + 24, y + 24, 12, 6);
        this.ctx.fillRect(x + 12, y + 36, 9, 4);
        
        // Water sparkles
        this.ctx.fillStyle = '#4a7aba';
        this.ctx.fillRect(x + 10, y + 10, 3, 3);
        this.ctx.fillRect(x + 26, y + 26, 3, 3);
        this.ctx.fillRect(x + 36, y + 12, 3, 3);
        this.ctx.fillRect(x + 14, y + 38, 2, 2);
    }
    
    /**
     * Draw tree tile with detailed foliage
     */
    drawTreeTile(x, y, size) {
        // Grass base
        this.ctx.fillStyle = '#2a5a1a';
        this.ctx.fillRect(x, y, size, size);
        
        // Tree trunk
        this.ctx.fillStyle = '#5b3a1a';
        this.ctx.fillRect(x + 18, y + 30, 12, 18);
        
        // Trunk highlights
        this.ctx.fillStyle = '#7b4a2a';
        this.ctx.fillRect(x + 20, y + 32, 8, 14);
        
        // Trunk texture
        this.ctx.fillStyle = '#6b4423';
        this.ctx.fillRect(x + 21, y + 34, 2, 10);
        this.ctx.fillRect(x + 25, y + 36, 2, 8);
        
        // Tree crown
        this.ctx.fillStyle = '#1a6b1a';
        this.ctx.fillRect(x + 6, y + 6, 36, 30);
        
        // Crown highlights
        this.ctx.fillStyle = '#228b22';
        this.ctx.fillRect(x + 9, y + 9, 30, 6);
        this.ctx.fillRect(x + 12, y + 18, 24, 6);
        this.ctx.fillRect(x + 15, y + 27, 18, 6);
        
        // Crown details
        this.ctx.fillStyle = '#32ab32';
        this.ctx.fillRect(x + 12, y + 12, 6, 18);
        this.ctx.fillRect(x + 30, y + 15, 6, 12);
        this.ctx.fillRect(x + 21, y + 21, 6, 9);
        
        // Crown shadows
        this.ctx.fillStyle = '#0a5a0a';
        this.ctx.fillRect(x + 30, y + 12, 9, 21);
        this.ctx.fillRect(x + 12, y + 30, 24, 6);
    }
    
    /**
     * Draw player character (orange cat)
     */
    drawPlayer(x, y) {
        // Center character in tile
        const offsetX = (this.tileSize - this.characterSize) / 2;
        const offsetY = this.tileSize - this.characterSize;
        x += offsetX;
        y += offsetY;
        
        // Character shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(x + 4, y + this.characterSize - 2, 24, 3);
        
        // Cat body
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.fillRect(x + 8, y + 12, 16, 16);
        
        // Body highlights
        this.ctx.fillStyle = '#ff8b55';
        this.ctx.fillRect(x + 10, y + 14, 12, 4);
        
        // Cat head
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.fillRect(x + 10, y + 4, 12, 12);
        
        // Head highlights
        this.ctx.fillStyle = '#ff8b55';
        this.ctx.fillRect(x + 12, y + 6, 8, 4);
        
        // Cat ears
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.fillRect(x + 8, y + 2, 4, 6);
        this.ctx.fillRect(x + 20, y + 2, 4, 6);
        
        // Inner ears
        this.ctx.fillStyle = '#ff8b55';
        this.ctx.fillRect(x + 9, y + 3, 2, 3);
        this.ctx.fillRect(x + 21, y + 3, 2, 3);
        
        // Cat features
        this.drawCatFeatures(x, y);
        
        // Animated tail and paws
        this.drawCatAnimation(x, y);
    }
    
    /**
     * Draw cat facial features
     */
    drawCatFeatures(x, y) {
        // Eyes
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + 12, y + 8, 2, 2);
        this.ctx.fillRect(x + 18, y + 8, 2, 2);
        
        // Eye shine
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(x + 13, y + 8, 1, 1);
        this.ctx.fillRect(x + 19, y + 8, 1, 1);
        
        // Nose
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + 15, y + 11, 2, 1);
    }
    
    /**
     * Draw animated cat parts (tail and paws)
     */
    drawCatAnimation(x, y) {
        // Animated tail
        const tailOffset = this.player.animFrame === 0 ? 0 : 2;
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.fillRect(x + 24 + tailOffset, y + 16, 4, 8);
        
        // Tail highlight
        this.ctx.fillStyle = '#ff8b55';
        this.ctx.fillRect(x + 25 + tailOffset, y + 17, 2, 6);
        
        // Movement animation - paws
        if (this.player.animFrame === 1) {
            this.ctx.fillStyle = '#ff6b35';
            this.ctx.fillRect(x + 4, y + 28, 4, 4); // Left paw
            this.ctx.fillRect(x + 24, y + 28, 4, 4); // Right paw
            
            // Paw pads
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(x + 5, y + 29, 2, 2);
            this.ctx.fillRect(x + 25, y + 29, 2, 2);
        }
    }
    
    /**
     * Draw NPC sprite
     */
    drawSprite(spriteType, x, y) {
        // Center character in tile
        const offsetX = (this.tileSize - this.characterSize) / 2;
        const offsetY = this.tileSize - this.characterSize;
        x += offsetX;
        y += offsetY;
        
        // Character shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(x + 4, y + this.characterSize - 2, 24, 3);
        
        switch (spriteType) {
            case 1: // Experience Keeper (Blue wizard)
                this.drawWizardSprite(x, y, '#2a4a9a', '#4169e1');
                this.drawWizardHat(x, y, '#2a4a9a', '#4169e1');
                this.drawBelt(x, y);
                break;
            case 2: // Skills Master (Green)
                this.drawTunicSprite(x, y, '#228b22', '#32cd32');
                this.drawHair(x, y);
                break;
            case 3: // Education Sage (Purple)
                this.drawWizardSprite(x, y, '#663399', '#9370db');
                this.drawCrown(x, y);
                break;
            case 4: // Contact Oracle (Red)
                this.drawWizardSprite(x, y, '#aa1a1a', '#dc143c');
                this.drawHood(x, y, '#aa1a1a', '#dc143c');
                break;
        }
        
        // Common features for all NPCs
        this.drawNPCFace(x, y);
    }
    
    /**
     * Draw wizard/robe sprite
     */
    drawWizardSprite(x, y, baseColor, highlightColor) {
        // Robe
        this.ctx.fillStyle = baseColor;
        this.ctx.fillRect(x + 8, y + 8, 16, 20);
        
        // Robe highlights
        this.ctx.fillStyle = highlightColor;
        this.ctx.fillRect(x + 10, y + 10, 12, 16);
    }
    
    /**
     * Draw tunic sprite
     */
    drawTunicSprite(x, y, baseColor, highlightColor) {
        // Tunic
        this.ctx.fillStyle = baseColor;
        this.ctx.fillRect(x + 8, y + 8, 16, 20);
        
        // Tunic highlights
        this.ctx.fillStyle = highlightColor;
        this.ctx.fillRect(x + 10, y + 10, 12, 16);
    }
    
    /**
     * Draw common NPC facial features
     */
    drawNPCFace(x, y) {
        // Face
        this.ctx.fillStyle = '#fdbcb4';
        this.ctx.fillRect(x + 10, y + 4, 12, 8);
        
        // Eyes
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + 12, y + 8, 2, 2);
        this.ctx.fillRect(x + 18, y + 8, 2, 2);
        
        // Eye shine
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(x + 13, y + 8, 1, 1);
        this.ctx.fillRect(x + 19, y + 8, 1, 1);
        
        // Mouth
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + 15, y + 10, 2, 1);
    }
    
    /**
     * Draw wizard hat
     */
    drawWizardHat(x, y, baseColor, highlightColor) {
        this.ctx.fillStyle = baseColor;
        this.ctx.fillRect(x + 12, y, 8, 6);
        
        this.ctx.fillStyle = highlightColor;
        this.ctx.fillRect(x + 13, y + 1, 6, 4);
    }
    
    /**
     * Draw belt accessory
     */
    drawBelt(x, y) {
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(x + 8, y + 18, 16, 3);
    }
    
    /**
     * Draw hair
     */
    drawHair(x, y) {
        this.ctx.fillStyle = '#6b4423';
        this.ctx.fillRect(x + 12, y + 2, 8, 4);
        
        this.ctx.fillStyle = '#8b5433';
        this.ctx.fillRect(x + 13, y + 2, 6, 3);
    }
    
    /**
     * Draw crown
     */
    drawCrown(x, y) {
        this.ctx.fillStyle = '#b8860b';
        this.ctx.fillRect(x + 10, y, 12, 4);
        
        this.ctx.fillStyle = '#daa520';
        this.ctx.fillRect(x + 11, y + 1, 10, 2);
    }
    
    /**
     * Draw hood
     */
    drawHood(x, y, baseColor, highlightColor) {
        this.ctx.fillStyle = baseColor;
        this.ctx.fillRect(x + 8, y, 16, 6);
        
        this.ctx.fillStyle = highlightColor;
        this.ctx.fillRect(x + 10, y + 1, 12, 4);
    }
    
    /**
     * Main game loop
     */
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new Game();
});
