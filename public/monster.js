// This function defines the Gem module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the gem
// - `y` - The initial y position of the gem
// - `color` - The colour of the gem
const Monster = function(ctx, x, y,gameArea) {

    // This is the sprite sequences of the gem of four colours
    // `green`, `red`, `yellow` and `purple`.
    const sequences = {
        /* Idling sprite sequences for facing different directions */
        idleLeft:  { x: 106, y: 120, width: 30, height: 25, count: 1, timing: 2000, loop: false },
        idleUp:    { x: 75, y: 120, width: 30, height: 25, count: 1, timing: 2000, loop: false },
        idleRight: { x: 47, y: 120, width: 30, height: 25, count: 1, timing: 2000, loop: false },
        idleDown:  { x: 16, y: 120, width: 30, height: 25, count: 1, timing: 2000, loop: false },

        /* Moving sprite sequences for facing different directions */
        moveLeft:  { x: 0, y: 90, width: 30, height: 25, count: 5, timing: 100, loop: true },
        moveUp:    { x: 0, y: 30, width: 30, height: 25, count: 5, timing: 100, loop: true },
        moveRight: { x: 0, y: 60, width: 30, height: 25, count: 5, timing: 100, loop: true },
        moveDown:  { x: 0, y: 0, width: 30, height: 25, count: 5, timing: 100, loop: true }
    };

       // This is the sprite object of the player created from the Sprite module.
       const sprite = Sprite(ctx, x, y);

       //shouldstop=false;

       // The sprite object is configured for the player sprite here.
       sprite.setSequence(sequences.idleDown)
             .setScale(2)
             .setShadowScale({ x: 0.75, y: 0.20 })
             .useSheet("monster_spr.png");
   
       // This is the moving direction, which can be a number from 0 to 4:
       // - `0` - not moving
       // - `1` - moving to the left
       // - `2` - moving up
       // - `3` - moving to the right
       // - `4` - moving down
       let direction = 0;
       let monster_dir = 0;
   
       // This is the moving speed (pixels per second) of the player
       let speed = 100;
   
       // This function sets the player's moving direction.
       // - `dir` - the moving direction (1: Left, 2: Up, 3: Right, 4: Down)
       /*const move = function() {
        
            
            dir0 = Math.floor(Math.random()*4);
            dir = dir0+1;
            switch (dir) {
                   case 1: sprite.setSequence(sequences.moveLeft); break;
                   case 2: sprite.setSequence(sequences.moveUp); break;
                   case 3: sprite.setSequence(sequences.moveRight); break;
                   case 4: sprite.setSequence(sequences.moveDown); break;
            }
            direction = dir;
            if (shouldstop==true) return;
           
       };*/

       const move = function(dir) {
            if (dir >= 1 && dir <= 4 && dir != direction) {
                switch (dir) {
                    case 1: sprite.setSequence(sequences.moveLeft); break;
                    case 2: sprite.setSequence(sequences.moveUp); break;
                    case 3: sprite.setSequence(sequences.moveRight); break;
                    case 4: sprite.setSequence(sequences.moveDown); break;
                }
                direction = dir;
                monster_dir = dir;
            }
        };

   
       // This function stops the player from moving.
       // - `dir` - the moving direction when the player is stopped (1: Left, 2: Up, 3: Right, 4: Down)
       const stop = function(dir) {
            if (direction == dir) {
                switch (dir) {
                    case 1: sprite.setSequence(sequences.idleLeft); break;
                    case 2: sprite.setSequence(sequences.idleUp); break;
                    case 3: sprite.setSequence(sequences.idleRight); break;
                    case 4: sprite.setSequence(sequences.idleDown); break;
                }
                direction = 0;
            }
        };

        // const randomize = function(area) {

        //     /* Randomize the position */
        //     const {x, y} = area.randomPoint();
        //     sprite.setXY(x, y);
        // };

        const respawn = function(area, time) {
            const {x, y} = area.randomPoint();
            sprite.setXY(x, y);
            Socket.getSocket().emit("monster moved", time, x, y, monster_dir);
        }

   
        // This function speeds up the player.
        const speedUp = function() {
            speed = 250;
        };
   
       // This function slows down the player.
        const slowDown = function() {
            speed = 150;
        };
   
        // This function updates the player depending on his movement.
        // - `time` - The timestamp when this function is called
        const update = function(time) {
            let { x, y } = sprite.getXY();
           /* Update the player if the player is moving */
            if (direction != 0) {
   
               /* Move the player */
               switch (direction) {
                   case 1: x -= speed / 60; break;
                   case 2: y -= speed / 60; break;
                   case 3: x += speed / 60; break;
                   case 4: y += speed / 60; break;
               }
   
               /* Set the new position if it is within the game area */
               if (gameArea.isPointInBox(x, y)) {
                   sprite.setXY(x, y);
               }
            }
            Socket.getSocket().emit("monster moved", time, x, y, monster_dir);
   
            /* Update the sprite object */
            sprite.update(time);
        };

       
        const updateCoord = function(time, x, y, dir) {
            let { x: curr_x, y: curr_y } = sprite.getXY();
            if (curr_x == x && curr_y == y) {
                switch (dir) {
                    case 1: {
                        if (sprite.getSequence() != sequences.idleLeft) {
                            sprite.setSequence(sequences.idleLeft);
                        }
                        break;
                    }
                    case 2: {
                        if (sprite.getSequence() != sequences.idleUp) {
                            sprite.setSequence(sequences.idleUp);
                        }
                        break;
                    }
                    case 3: {
                        if (sprite.getSequence() != sequences.idleRight) {
                            sprite.setSequence(sequences.idleRight);
                        }
                        break;
                    }
                    case 4: {
                        if (sprite.getSequence() != sequences.idleDown) {
                            sprite.setSequence(sequences.idleDown);
                        }
                        break;
                    }
                }
            }
            else {
                sprite.setXY(x, y);
                switch (dir) {
                    case 1: {
                        if (sprite.getSequence() != sequences.moveLeft) {
                            sprite.setSequence(sequences.moveLeft);
                        }
                        break;
                    }
                    case 2: {
                        if (sprite.getSequence() != sequences.moveUp) {
                            sprite.setSequence(sequences.moveUp);
                        }
                        break;
                    }
                    case 3: {
                        if (sprite.getSequence() != sequences.moveRight) {
                            sprite.setSequence(sequences.moveRight);
                        }
                        break;
                    }
                    case 4: {
                        if (sprite.getSequence() != sequences.moveDown) {
                            sprite.setSequence(sequences.moveDown);
                        }
                        break;
                    }
                }
            }
            sprite.update(time);
        }

       const getXY = function() {
        a=x; b=y;
        return {a,b};
       }
   
       // The methods are returned as an object here.
       return {
            getXY: sprite.getXY,
            move: move,
            stop: stop,
            speedUp: speedUp,
            slowDown: slowDown,
            updateCoord: updateCoord,
            // randomize: randomize,
            respawn: respawn,
            getBoundingBox: sprite.getBoundingBox,
            draw: sprite.draw,
            update: update
       };
};
