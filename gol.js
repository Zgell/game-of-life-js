// From p5.js examples: https://p5js.org/examples/simulate-game-of-life.html

/*
    TO-DO:
    - Add some images to the HTML to show off some common shapes that
    users could draw so they can play around with them.
    - Reposition canvas so it's in the center of the page (may need CSS).
    - Add ability to load specific examples? (ie. glider guns)
    - Add indicator to show whether simulation is paused or not
    - Night mode?
    - Investigate whether or not it's possible to resize the board using a
    slightly different class implementation? Is it possible to make some kind
    of resizable matrix to use for the board?
    - Add a check when players are manually switching cells so that they can't
    override cells on the boundary, it causes glitchy behaviour
*/

let s;  // Side length of each cell
let columns;  // Number of columns in grid
let rows;  // Number of rows in grid
let grid;  // 2D matrix that stores the cells
let next_grid;  // Extra 2D matrix for computing future iterations

let c_width;  // Canvas width
let c_height;  // Canvas height
let fill_factor = 0.8;  // Proportion of how much space canvas takes up

let fr = 24;  // Framerate (default is too high)
let PAUSE = false;  // Whether or not game is paused
let DEBUG_MODE = false;  // For extra information to be displayed

function setup() {
    /*
        A method called once at the beginning of the program running.
        Initializes variables, sets up the canvas as well as the grid.
    */
    frameRate(fr);
    c_width = floor(windowWidth * fill_factor);
    c_height = floor(windowHeight * fill_factor);
    createCanvas(c_width, c_height);
    s = 20;
    columns = floor(width / s)-1;
    rows = floor(height / s)-1;
    
    // Initialize grid as well as "next_grid"
    grid = new Array(columns);
    next_grid = new Array(columns);
    for (let i = 0; i < columns; i++) {
        grid[i] = new Array(rows);
        next_grid[i] = new Array(columns);
    }

    init();
}

function draw() {
    /* 
        A method called each frame to update the screen.
        Responsible for drawing changes in the cells as well as text.
    */
    background(255);
    if (!PAUSE) {
        iterate();
    }
    for ( let i = 0; i < columns;i++) {
        for ( let j = 0; j < rows;j++) {
        if ((grid[i][j] == 1)) fill(0);
        else fill(255);
        stroke(200);
        rect(i * s, j * s, s, s);
        }
    }
    if (DEBUG_MODE) {
        // Display position of cursor in top left corner
        textSize(24);
        text(mouseX, 10, 30);
        text(mouseY, 10, 50);
    }
    if (PAUSE) {
        // Draw pause indicator in top left corner
        textSize(48);
        fill(255, 0, 0);  // Red text
        text("PAUSED", 10, 48);
        textSize(16);
        //fill(255, 0, 0);
        text("(press spacebar to unpause)", 10, 72);
    }
}

function keyTyped() {
    /*
        A method called anytime a key is pressed on the keyboard.
        Used to detect mode changes (pauses, debug mode, etc) as well as
        to clear the screen.
    */
    // keyCode 32 refers to the spacebar
    if (key == 'p' || keyCode == 32) {
        PAUSE = !PAUSE;
    }
    if (key == 'c') {
        // Clear the grid
        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                // Line all edges with zero
                grid[i][j] = 0;
                next_grid[i][j] = 0;
            }
        }
    }
    if (key == 'd') {
        // Toggle Debug Mode
        DEBUG_MODE = !DEBUG_MODE;
    }
}


function mousePressed() {
    /*
        A method called anytime the mouse is clicked.
        Used to reset the board as well as for user override.
    */
    // First check if mouse is inside canvas
    if (mouseX > 0 && mouseX < c_width && mouseY > 0 && mouseY < c_height) {
        if (!PAUSE) {
            // If game isn't paused, reset the grid
            init();
        } else {
            // If paused, allow user to manually override cells
            // Convert mouse coordinates to specific cell
            let cell_x = floor(mouseX / s);
            let cell_y = floor(mouseY / s);
            // Flip the value of the cell
            if (grid[cell_x][cell_y] == 0) {
                grid[cell_x][cell_y] = 1;
            } else {
                grid[cell_x][cell_y] = 0;
            }
        }
    }
}


function init() {
    /*
        A function called whenever the board needs to be initialized, whether
        on start or on reset. Scrambles values in the board.
    */
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            // Lining the edges with 0s
            if (i == 0 || j == 0 || i == columns-1 || j == rows-1) {
                // When dealing with an edge, always set it to 0
                grid[i][j] = 0;
            } else { 
                // Generates either 0 or 1 (50/50 chance randomly)
                grid[i][j] = floor(random(2));
            }
            // Set all cells of next grid to 0.
            next_grid[i][j] = 0;
        }
    }
}


function iterate() {
    /*
        Generates the next state of the board based on the current state.
        Applies the Game of Life rules to determine next states.
    */
    
    // Loop through every spot in our 2D array and check spots neighbors
    for (let x = 1; x < columns - 1; x++) {
        for (let y = 1; y < rows - 1; y++) {
            // Get the number of neighbouring cells
            // Since there's only 8 to check, just do all 8 manually
            let total_neighbours = 0;
            total_neighbours += grid[x-1][y-1];
            total_neighbours += grid[x-1][y];
            total_neighbours += grid[x-1][y+1];
            total_neighbours += grid[x][y-1];
            total_neighbours += grid[x][y+1];
            total_neighbours += grid[x+1][y-1];
            total_neighbours += grid[x+1][y];
            total_neighbours += grid[x+1][y+1];

            // Apply the rules of the Game of Life
            if (grid[x][y] == 1 && total_neighbours < 2) {
                // Underpopulation Case: Cell dies.
                next_grid[x][y] = 0;
            } else if (grid[x][y] == 0 && total_neighbours == 3) {
                // Reproduction Case: New cell is born.
                next_grid[x][y] = 1;
            } else if (grid[x][y] == 1 && total_neighbours > 3) {
                // Overpopulation Case: Cell dies.
                next_grid[x][y] = 0;
            } else {
                // Default Case: Pass along the previous value.
                next_grid[x][y] = grid[x][y];
            }
        }
    }

    // Finally, update grid
    // NOTE: Must swap the grids! Can't discard the old grid state or else
    // really weird behaviour occurs. Investigate this further someday?
    let temp = grid;
    grid = next_grid;
    next_grid = temp;
}