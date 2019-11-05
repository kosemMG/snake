"use strict";

(() => {
    /**
     * DTO object with default settings.
     * @property {int} rowsCount The number of rows.
     * @property {int} colsCount The number of columns.
     * @property {int} speed The snake's speed.
     * @property {int} winFoodCount The amount of food which is required for victory.
     */
    const settings = {
        rowsCount: 21,
        colsCount: 21,
        speed: 2,
        winFoodCount: 50
    };

    /**
     * The object of the game config, containing methods for getting settings and checking these settings.
     * @property {settings} settings Game settings
     */
    const config = {
        settings,

        /**
         * Initialization of the game settings.
         * @param {Object} userSettings Object with custom game settings.
         */
        init(userSettings) {
            Object.assign(this.settings, userSettings);
        },

        /**
         * Check the values of the game settings.
         * @returns {{isValid: boolean, errors: Array}} The result of validation as an object with errors.
         */
        validate() {
            /**
             * DTO object with validation results.
             * @property {boolean} isValid true if the settings are valid, otherwise false.
             * @property {string []} errors Array with all settings errors.
             */
            const result = {
                isValid: true,
                errors: []
            };

            if (this.settings.rowsCount < 10 || this.settings.rowsCount > 30) {
                result.isValid = false;
                result.errors.push("Wrong settings. The value of rowsCount must be in the range [10, 30].");
            }

            if (this.settings.colsCount < 10 || this.settings.colsCount > 30) {
                result.isValid = false;
                result.errors.push("Wrong settings. The value of colsCount must be in the range [10, 30].");
            }

            if (this.settings.speed < 1 || this.settings.speed > 10) {
                result.isValid = false;
                result.errors.push("Wrong settings. The value of speed must be in the range [1, 10].");
            }

            if (this.settings.winFoodCount < 5 || this.settings.winFoodCount > 50) {
                result.isValid = false;
                result.errors.push("Wrong settings. The value of winFoodCount must be in the range [5, 50].");
            }

            return result;
        },

        /**
         * @returns {int} Returns the number of lines in the game.
         */
        getRowsCount() {
            return this.settings.rowsCount;
        },

        /**
         * @returns {int} Returns the number of columns in the game.
         */
        getColsCount() {
            return this.settings.colsCount;
        },

        /**
         * @returns {int} Returns the speed of the snake.
         */
        getSpeed() {
            return this.settings.speed;
        },

        /**
         * @returns {int} The amount of food which is required for victory.
         */
        getWindFoodCount() {
            return this.settings.winFoodCount;
        },
    };

    /**
     * Map object with methods of displaying and creating the playing field.
     * @property {Object} cells An object containing all the cells of the game.
     * @property {Array} usedCells An array containing all occupied cells of the game.
     */
    const map = {
        cells: null,
        usedCells: null,

        /**
         * The method initializes and displays the map of the game.
         * @param {int} rowsCount Number of rows in the map.
         * @param {int} colsCount Number of columns in the map.
         */
        init(rowsCount, colsCount) {
            const table = document.getElementById("game");
            table.innerHTML = "";

            this.cells = {};
            this.usedCells = [];

            for (let row = 0; row < rowsCount; row++) {
                const tr = document.createElement("tr");
                tr.classList.add("row");
                table.appendChild(tr);

                for (let col = 0; col < colsCount; col++) {
                    const td = document.createElement("td");
                    td.classList.add("cell");
                    this.cells[`x${col}_y${row}`] = td;
                    tr.appendChild(td);

                }
            }
        },

        /**
         * Displays all objects on the map.
         * @param {{x: int, y: int} []} snakePointsArray Snake points array.
         * @param {{x: int, y: int}} foodPoint A food point.
         */
        render(snakePointsArray, foodPoint) {
            for (const cell of this.usedCells) {
                cell.className = "cell";
            }

            this.usedCells = [];

            snakePointsArray.forEach((point, idx) => {
                const snakeCell = this.cells[`x${point.x}_y${point.y}`];
                snakeCell.classList.add(idx === 0 ? "snakeHead" : "snakeBody");
                this.usedCells.push(snakeCell);
            });

            const foodCell = this.cells[`x${foodPoint.x}_y${foodPoint.y}`];
            foodCell.classList.add("food");
            this.usedCells.push(foodCell);
        }
    };

    /**
     * The snake object.
     * @property {{x: int, y: int} []} body An array with snake body points.
     * @property {string} direction The direction of the snake.
     * @property {string} lastStepDirection The direction the snake went to last time.
     */
    const snake = {
        body: null,
        direction: null,
        lastStepDirection: null,
        maxX: null,
        maxY: null,

        /**
         * Initializes the snake, from where it will start and its direction.
         * @param {{x: int, y: int} []} startBody The starting position of the snake.
         * @param {string} direction The initial direction.
         * @param {number} colsCount The number of columns of the map.
         * @param {number} rowsCount The number of rows of the map.
         */
        init(startBody, direction, colsCount, rowsCount) {
            this.body = startBody;
            this.direction = direction;
            this.lastStepDirection = direction;
            this.maxX = colsCount;
            this.maxY = rowsCount;
        },

        /**
         * Returns an array with all the points of the snake.
         * @return {{x: int, y: int} []};
         */
        getBody() {
            return this.body;
        },

        /**
         * Returns the point where the snake's head will be if it takes a step.
         * @returns {{x: int, y: int}} Next point where the snake will come in after taking a step.
         */
        getNextStepPoint() {
            const firstPoint = this.body[0];

            switch (this.direction) {
                case "up":
                    if (firstPoint.y > 0) {
                        return {x: firstPoint.x, y: firstPoint.y - 1};
                    } else {
                        return {x: firstPoint.x, y: this.maxY - 1};
                    }
                case "right":
                    if (firstPoint.x < this.maxX - 1) {
                        return {x: firstPoint.x + 1, y: firstPoint.y};
                    } else {
                        return {x: 0, y: firstPoint.y};
                    }
                case "down":
                    if (firstPoint.y < this.maxY - 1) {
                        return {x: firstPoint.x, y: firstPoint.y + 1};
                    } else {
                        return {x: firstPoint.x, y: 0};
                    }
                case "left":
                    if (firstPoint.x > 0) {
                        return {x: firstPoint.x - 1, y: firstPoint.y};
                    } else {
                        return {x: this.maxX - 1, y: firstPoint.y};
                    }
            }
        },

        /**
         * Checks if the snake contains a conveyed point.
         * @param {{x: int, y: int}} point The point we are checking.
         * @returns {boolean} True if the snake contains the conveyed point, otherwise false.
         */
        isOnPoint(point) {
            return this.body.some(snakePoint => snakePoint.x === point.x && snakePoint.y === point.y);
        },

        /**
         * Returns the last direction of the snake.
         */
        getLastStepDirection() {
            return this.lastStepDirection;
        },

        /**
         * Moves the snake one step.
         */
        makeStep() {
            this.lastStepDirection = this.direction;
            this.body.unshift(this.getNextStepPoint());
            this.body.pop();
        },

        /**
         * Sets the direction of the snake.
         * @param {string} direction The direction of the snake.
         */
        setDirection(direction) {
            this.direction = direction;
        },

        /**
         * Adds a copy of the last element of the snake to the end of the snake's body.
         */
        growUp() {
            const lastBodyIdx = this.body.length - 1;
            const lastBodyPoint = this.body[lastBodyIdx];
            const lastBodyPointClone = Object.assign({}, lastBodyPoint);
            this.body.push(lastBodyPointClone);
        }
    };

    /**
     * The object of food.
     * @property {int} x The x coordinate of the food.
     * @property {int} y The y coordinate of the food.
     */
    const food = {
        x: null,
        y: null,

        /**
         * Sets the coordinates of food.
         * @param {{x: int, y: int}} point New point with food coordinates.
         */
        setCoordinates(point) {
            this.x = point.x;
            this.y = point.y;
        },

        /**
         * Returns the coordinates of the food.
         * @returns {{x: int, y: int}} Food coordinates.
         */
        getCoordinates() {
            return {
                x: this.x,
                y: this.y
            }
        },

        /**
         * Determines whether the point at which the food is located matches the point that was transmitted.
         * @param {{x: int, y: int}} point A point for checking accordance with a food point.
         * @returns {boolean} True if the points match, otherwise false.
         */
        isOnPoint(point) {
            return this.x === point.x && this.y === point.y;
        }
    };

    /**
     * Game status.
     * @property {string} condintion The game status.
     */
    const status = {
        condition: null,

        /**
         * Sets the status to "playing".
         */
        setPlaying() {
            this.condition = "playing";
        },

        /**
         * Sets the status to "stopped".
         */
        setStopped() {
            this.condition = "stopped";
        },

        /**
         * Sets the status to "finished".
         */
        setFinished() {
            this.condition = "finished";
        },

        /**
         * Checks whether the status is "playing".
         * @returns {boolean} True if the status is "playing", otherwise false.
         */
        isPlaying() {
            return this.condition === "playing";
        },

        /**
         * Checks whether the status is "stopped".
         * @returns {boolean} True if the status is "stopped", otherwise false.
         */
        isStopped() {
            return this.condition === "stopped";
        }
    };

    /**
     * The game score.
     * @property {number} count The game score.
     * @property {HTMLElement} countElement The HTML tag where the score will be shown.
     */
    const score = {
        count: null,
        countElement: null,

        /**
         * Initialization of the game score.
         */
        init() {
            this.countElement = document.getElementById("score-count");
            this.drop();
        },

        /**
         * Dropping of the game score.
         */
        drop() {
            this.count = 0;
            this.render();
        },

        /**
         * Increment of the game score.
         */
        increment() {
            this.count++;
            this.render();
        },

        /**
         * Displaying of the game score.
         */
        render() {
            this.countElement.textContent = this.count;
        }
    };

    /**
     * The object of the game.
     * @property {settings} settings Game settings.
     * @property {map} map The display object.
     * @property {snake} snake The snake object.
     * @property {food} food The food object.
     * @property {status} status The game status.
     * @property {score} score The game score object.
     * @property {int} tickInterval The interval number of the game.
     */
    const game = {
        config,
        map,
        snake,
        food,
        status,
        score,
        tickInterval: null,

        /**
         * Initialization of the game.
         * @param {object} userSettings Game settings that can be changed.
         */
        init(userSettings) {
            this.config.init(userSettings);

            const validation = this.config.validate();
            if (!validation.isValid) {
                for (const err of validation.errors) {
                    console.error(err);
                }

                return;
            }

            this.map.init(this.config.getRowsCount(), this.config.getColsCount());

            this.setEventHandlers();

            this.score.init();

            this.reset();
        },

        /**
         * Resets the game in the starting position.
         */
        reset() {
            this.stop();
            this.score.drop();
            this.snake.init(this.getStartSnakeBodyPosition(), "up", this.config.getColsCount(), this.config.getRowsCount());
            this.food.setCoordinates(this.getRandomFreeCoordinates());
            this.render();
        },

        /**
         * Sets the game status into "playing".
         */
        play() {
            this.status.setPlaying();
            this.tickInterval = setInterval(() => this.tickHandler(), 1000 / this.config.getSpeed());
            this.setPlayButton("Stop");
        },

        /**
         * Sets the game status into "stopped".
         */
        stop() {
            this.status.setStopped();
            clearInterval(this.tickInterval);
            this.setPlayButton("Start");
        },

        /**
         * Sets the game status into "finished".
         */
        finish() {
            this.status.setFinished();
            clearInterval(this.tickInterval);
            this.setPlayButton("Game over", true);
        },


        /**
         * Change the button with the playButton class.
         * @param {string} textContent Button text.
         * @param {boolean} [isDisabled = false] Whether to lock the button.
         */
        setPlayButton(textContent, isDisabled = false) {
            const playButton = document.getElementById("playButton");
            playButton.textContent = textContent;
            isDisabled ? playButton.classList.add("disabled") : playButton.classList.remove("disabled");
        },

        /**
         * Event handler of the snake moving.
         */
        tickHandler() {
            if (!this.canMakeStep()) {
                return this.finish();
            }

            if (this.food.isOnPoint(this.snake.getNextStepPoint())) {
                this.score.increment();
                this.snake.growUp();
                this.food.setCoordinates(this.getRandomFreeCoordinates());

                if (this.isGameWon()) {
                    this.finish();
                }
            }

            this.snake.makeStep();
            this.render();
        },

        /**
         * Check whether the victory occurred, judging by the player’s points (the length of the snake).
         * @returns {boolean} True if the player won the game, otherwise false.
         */
        isGameWon() {
            return this.snake.getBody().length > this.config.getWindFoodCount();
        },

        /**
         * Checks if the next step is possible.
         * @returns {boolean} True if the next snake step is possible, false if the step cannot be completed.
         */
        canMakeStep() {
            const nextStepPoint = this.snake.getNextStepPoint();

            return !this.snake.isOnPoint(nextStepPoint);
            /*&&
                       nextStepPoint.x < this.config.getColsCount() &&
                       nextStepPoint.y < this.config.getRowsCount() &&
                       nextStepPoint.x >= 0 &&
                       nextStepPoint.y >= 0;*/
        },

        /**
         * Displays everything in the game: the map, the food and the snake.
         */
        render() {
            this.map.render(this.snake.getBody(), this.food.getCoordinates());
        },

        /**
         * Returns a random not occupied point on the map.
         * @return {{x: int, y: int}} A point with coordinates.
         */
        getRandomFreeCoordinates() {
            const exclude = [this.food.getCoordinates(), ...this.snake.getBody()];

            while (true) {
                const rndPoint = {
                    x: Math.floor(Math.random() * this.config.getColsCount()),
                    y: Math.floor(Math.random() * this.config.getRowsCount())
                };

                if (!exclude.some(exPoint => rndPoint.x === exPoint.x && rndPoint.y === exPoint.y)) {
                    return rndPoint;
                }
            }
        },

        /**
         * Returns the starting position of the snake in the center of the map.
         * @returns {{x: int, y: int} []} The starting position of the snake.
         */
        getStartSnakeBodyPosition() {
            return [{
                x: Math.floor(this.config.getColsCount() / 2),
                y: Math.floor(this.config.getRowsCount() / 2)
            }]
        },

        /**
         * Sets event handlers.
         */
        setEventHandlers() {
            document.getElementById("playButton").addEventListener("click", () => this.playClickHandler());
            document.getElementById("newGameButton").addEventListener("click", () => this.newGameClickHandler());
            document.addEventListener("keydown", event => this.keyDownHandler(event));
        },

        /**
         * Event handler for pressing the playButton button.
         */
        playClickHandler() {
            if (this.status.isPlaying()) {
                this.stop();
            } else if (this.status.isStopped()) {
                this.play();
            }
        },

        /**
         * Event handler for pressing the newGameButton button.
         */
        newGameClickHandler() {
            this.reset();
        },

        /**
         * Event handler for pressing the keyboard button.
         * @param {KeyboardEvent} event
         */
        keyDownHandler(event) {
            if (!this.status.isPlaying()) {
                return;
            }

            const direction = this.getDirectionByCode(event.code);

            if (this.isDirectionValid(direction)) {
                this.snake.setDirection(direction);
            }
        },

        /**
         * Determines whether the transmitted direction can be assigned to the snake.
         * @param {string} direction The direction we are checking.
         * @returns {boolean} True if the direction can be assigned to the snake, otherwise false.
         */
        isDirectionValid(direction) {
            const lastStepDirection = this.snake.getLastStepDirection();

            return direction === "up" && lastStepDirection !== "down" ||
                direction === "down" && lastStepDirection !== "up" ||
                direction === "right" && lastStepDirection !== "left" ||
                direction === "left" && lastStepDirection !== "right";
        },

        /**
         * Returns the direction of the snake, depending on the transmitted code key.
         * @param {string} code The code of the pressed key.
         * @returns {string} The direction of the snake.
         */
        getDirectionByCode(code) {
            switch (code) {
                case "ArrowUp":
                    return "up";
                case "ArrowRight":
                    return "right";
                case "ArrowDown":
                    return "down";
                case "ArrowLeft":
                    return "left";
                default:
                    return "";
            }
        }

    };

    window.snakeGame = {
        init(settings) {
            game.init(settings);
        }
    };
})();

snakeGame.init({speed: 5, winFoodCount: 20});