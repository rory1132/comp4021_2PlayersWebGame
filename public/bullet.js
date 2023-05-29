// This function defines the bullet module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the bullet
// - `y` - The initial y position of the bullet
// - `gameArea` - The bounding box of the game area
const Bullet = function(ctx, x, y, gameArea) {

    // This is the sprite sequences of the bullet facing different directions.
    // It contains the idling sprite sequences `idleLeft`, `idleUp`, `idleRight` and `idleDown`,
    // and the moving sprite sequences `moveLeft`, `moveUp`, `moveRight` and `moveDown`.
    const sequences = {
        /* Moving sprite sequences for facing different directions */
        moveLeft:  { x: 119, y: 211, width: 18, height: 18, count: 1, timing: 50, loop: true },
        moveUp:    { x: 138, y: 195, width: 18, height: 18, count: 1, timing: 50, loop: true },
        moveRight: { x: 156, y: 211, width: 18, height: 18, count: 1, timing: 50, loop: true },
        moveDown:  { x: 138, y: 227, width: 18, height: 18, count: 1, timing: 50, loop: true }
    };

    // This is the sprite object of the bullet created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the bullet sprite here.
    sprite.setSequence(sequences.moveDown)
          .setScale(1)
          .setShadowScale({ x: 0.75, y: 0.20 })
          .useSheet("bullet_sprites.png");

    // This is the moving direction, which can be a number from 0 to 4:
    // - `0` - not moving
    // - `1` - moving to the left
    // - `2` - moving up
    // - `3` - moving to the right
    // - `4` - moving down
    let direction = 0;

    // This is the moving speed (pixels per second) of the bullet
    let speed = 150;
    let moving = false;

    // This function sets the bullet's moving direction.
    // - `dir` - the moving direction (1: Left, 2: Up, 3: Right, 4: Down)
    const move = function(dir) {
        if (dir >= 1 && dir <= 4 && direction == 0) {
            switch (dir) {
                case 1: sprite.setSequence(sequences.moveLeft); break;
                case 2: sprite.setSequence(sequences.moveUp); break;
                case 3: sprite.setSequence(sequences.moveRight); break;
                case 4: sprite.setSequence(sequences.moveDown); break;
            }
            direction = dir;
        }
    };

    // This function updates the bullet depending on his movement.
    // - `time` - The timestamp when this function is called
    const update = function(time, tank_x, tank_y) {
        if (direction == 0) {
            sprite.setXY(tank_x, tank_y);  
            moving = false;

            Socket.getSocket().emit("update bullet", time, tank_x, tank_y, 0);

            sprite.toShow(false);
        }
        /* Update the bullet if the bullet is moving */
        if (direction != 0) {

            sprite.toShow(true);
            let { x, y } = sprite.getXY();

            /* Move the bullet */
            switch (direction) {
                case 1: x -= speed / 60; break;
                case 2: y -= speed / 60; break;
                case 3: x += speed / 60; break;
                case 4: y += speed / 60; break;
            }
            moving = true;

            /* Set the new position if it is within the game area */
            if (gameArea.isPointInBox(x, y)) {
                sprite.setXY(x, y);
                Socket.getSocket().emit("update bullet", time, x, y, direction);
            }
            else {
                Socket.getSocket().emit("update bullet", time, tank_x, tank_y, 0);
                direction = 0;
            }
        }

        /* Update the sprite object */
        sprite.update(time);
    };

    const updateCoord = function(time, x, y, dir) {
        if (dir == 0) {
            sprite.toShow(false);
        } else {
            sprite.toShow(true);
            sprite.setXY(x, y);
            switch (dir) {
                case 1: sprite.setSequence(sequences.moveLeft); break;
                case 2: sprite.setSequence(sequences.moveUp); break;
                case 3: sprite.setSequence(sequences.moveRight); break;
                case 4: sprite.setSequence(sequences.moveDown); break;
            }
        }
        sprite.update(time);
    };

    const oncheat = function() {
        speed*=1.5;
    }
    const offcheat = function() {
        speed/=1.5;
    }
    const getmoving = function() {
        return moving;
    }

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        getmoving: getmoving,
        move: move,
        stop: stop,
        oncheat: oncheat,
        offcheat: offcheat,
        updateCoord: updateCoord,
        // speedUp: speedUp,
        // slowDown: slowDown,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: update
    };
};
