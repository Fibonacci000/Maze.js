const {
    Engine,
    Render,
    Runner,
    World,
    Bodies,
    Body,
    Events

} = Matter;
//number of cells in maze
// const cells = 8;
const cellsHorizontal = 5;
const cellsVertical = 5;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
//Gravity disabled
engine.world.gravity.y = 0;
const {
    world
} = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);



//Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, {
        isStatic: true
    }),
    Bodies.rectangle(width / 2, height, width, 2, {
        isStatic: true
    }),
    Bodies.rectangle(0, height / 2, 2, height, {
        isStatic: true
    }),
    Bodies.rectangle(width, height / 2, 2, height, {
        isStatic: true
    })


];

World.add(world, walls)

//Maze generation
const shuffle = arr => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp
    }
    return arr;
};

//Grid
const grid = Array(cellsVertical)
    .fill(null)
    //Columns
    .map(() => Array(cellsHorizontal).fill(false));


const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));


const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));


const startRow = Math.floor(Math.random() * cellsVertical)
const startColumn = Math.floor(Math.random() * cellsHorizontal)

const stepThroughCell = (row, column) => {
    //If cell has been visited row,column then return
    if (grid[row][column]) {
        return;
    }

    //Mark this cell as being visited
    grid[row][column] = true;

    //Assemble random ordered list of neighbors
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);


    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;

        if (nextRow < 0 ||
            nextRow >= cellsVertical ||
            nextColumn < 0 ||
            nextColumn >= cellsHorizontal
        ) {
            continue;
        }

        if (grid[nextRow][nextColumn]) {
            continue;
        }
        //Remove wall either horizontals or verticals
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }
        stepThroughCell(nextRow, nextColumn)
    }
}
stepThroughCell(startRow, startColumn)

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5, {
                label: 'wall',
                isStatic: true
            }
        );
        World.add(world, wall)
    });
});


verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            5,
            unitLengthY, {
                label: 'wall',
                isStatic: true
            }
        );
        World.add(world, wall);
    });
});

const goal = Bodies.rectangle(

    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .7,
    unitLengthY * .7, {
        label: 'goal',
        isStatic: true,
    }
);

World.add(world, goal)

//ball

const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    //size of the ball
    // unitLengthY / 4, {
    ballRadius, {
        label: 'ball'
    }
);

World.add(world, ball);

document.addEventListener('keydown', event => {
    const {
        x,
        y
    } = ball.velocity;

    if (event.keyCode === 38) {
        // console.log('move up')
        //Up
        Body.setVelocity(ball, {
            x,
            y: y - 10
        });
    }

    if (event.keyCode === 39) {
        // console.log('move right')
        //Right
        Body.setVelocity(ball, {
            x: x + 10,
            y
        });
    }

    if (event.keyCode === 40) {
        // console.log('move down')
        // Down
        Body.setVelocity(ball, {
            x,
            y: y + 10
        });
    }

    if (event.keyCode === 37) {
        // console.log('move left')
        //Left
        Body.setVelocity(ball, {
            x: x - 10,
            y
        });
    }
});


//Win condition

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal'];
        if (
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        ) {
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false)
                }
            })

        }
    })
})