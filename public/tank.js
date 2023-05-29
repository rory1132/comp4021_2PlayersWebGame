// This function defines the tank module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the tank
// - `y` - The initial y position of the tank
// - `gameArea` - The bounding box of the game area
const Tank = function(ctx, x, y, gameArea) {

    // This is the sprite sequences of the tank facing different directions.
    // It contains the idling sprite sequences `idleLeft`, `idleUp`, `idleRight` and `idleDown`,
    // and the moving sprite sequences `moveLeft`, `moveUp`, `moveRight` and `moveDown`.
    const sequences = {
        /* Moving sprite sequences for facing different directions */
        moveLeft:  { x: 125, y: 75, width: 24, height: 25, count: 1, timing: 50, loop: true },
        moveUp:    { x: 0, y: 25, width: 24, height: 25, count: 1, timing: 50, loop: true },
        moveRight: { x: 100, y: 75, width: 24, height: 25, count: 1, timing: 50, loop: true },
        moveDown:  { x: 25, y: 25, width: 24, height: 25, count: 1, timing: 50, loop: true }
    };

    cheatOnOff = false;

    // This is the moving speed (pixels per second) of the tank
    let speed = 90; //75
    

    const bullet = Bullet(ctx, x, y, gameArea);

    // This is the sprite object of the tank created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the tank sprite here.
    sprite.setSequence(sequences.moveDown)
          .setScale(1.5)
          .setShadowScale({ x: 0.75, y: 0.20 })
          .useSheet("tank1_sprites.png");

    // This is the moving direction, which can be a number from 0 to 4:
    // - `0` - not moving
    // - `1` - moving to the left
    // - `2` - moving up
    // - `3` - moving to the right
    // - `4` - moving down
    let direction = 0;
    let tank_dir = 4;

    

    // This function sets the tank's moving direction.
    // - `dir` - the moving direction (1: Left, 2: Up, 3: Right, 4: Down)
    const move = function(dir) {
        if (dir >= 1 && dir <= 4 && dir != direction) {
            switch (dir) {
                case 1: sprite.setSequence(sequences.moveLeft); break;
                case 2: sprite.setSequence(sequences.moveUp); break;
                case 3: sprite.setSequence(sequences.moveRight); break;
                case 4: sprite.setSequence(sequences.moveDown); break;
            }
            direction = dir;
            tank_dir = dir;
        }
    };

    // This function stops the tank from moving.
    // - `dir` - the moving direction when the tank is stopped (1: Left, 2: Up, 3: Right, 4: Down)
    const stop = function(dir) {
        if (direction == dir) {
            switch (dir) {
                case 1: sprite.setSequence(sequences.moveLeft); break;
                case 2: sprite.setSequence(sequences.moveUp); break;
                case 3: sprite.setSequence(sequences.moveRight); break;
                case 4: sprite.setSequence(sequences.moveDown); break;
            }
            direction = 0;
        }
    };

    const attack = function() {
        bullet.move(tank_dir);
    };

    // // This function speeds up the tank.
    // const speedUp = function() {
    //     speed = 250;
    // };

    // // This function slows down the tank.
    // const slowDown = function() {
    //     speed = 150;
    // };

    // This function updates the tank depending on his movement.
    // - `time` - The timestamp when this function is called
    const update = function(time) {
        /* Update the tank if the tank is moving */
        if (direction != 0) {
            let { x, y } = sprite.getXY();

            /* Move the tank */
            switch (direction) {
                case 1: x -= speed / 60; break;
                case 2: y -= speed / 60; break;
                case 3: x += speed / 60; break;
                case 4: y += speed / 60; break;
            }

            /* Set the new position if it is within the game area */
            if (gameArea.isPointInBox(x, y))
                sprite.setXY(x, y);
                Socket.getSocket().emit("tank moved", x, y, direction);
        }

        let { x, y } = sprite.getXY();

        bullet.update(time, x, y);

        /* Update the sprite object */
        sprite.update(time);
    };

    // const bulletUpdate = function(time, x, y) {
    //     Socket.getSocket().emit("bullet update", time, x, y);
    // }

    const updateCoord = function(x, y, dir) {
        sprite.setXY(x, y);
        switch (dir) {
            case 1: sprite.setSequence(sequences.moveLeft); break;
            case 2: sprite.setSequence(sequences.moveUp); break;
            case 3: sprite.setSequence(sequences.moveRight); break;
            case 4: sprite.setSequence(sequences.moveDown); break;
        }
    }

    const draw = function() {
        sprite.draw();
        bullet.draw();
    }

    const cheat = function() {
        if (!cheatOnOff) {
            speed*=1.5;
            bullet.oncheat();
            cheatOnOff = true;
        }
        else {
            speed/=1.5;
            bullet.offcheat();
            cheatOnOff = false;
        }
    }

    // The methods are returned as an object here.
    return {
        getbulletXY: bullet.getXY,
        bullet: bullet,
        move: move,
        stop: stop,
        attack: attack,
        cheat: cheat,
        updateCoord: updateCoord,
        // bulletUpdate: bulletUpdate,
        // speedUp: speedUp,
        // slowDown: slowDown,
        getBoundingBox: sprite.getBoundingBox,
        draw: draw,
        update: update
    };
};
