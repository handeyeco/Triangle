(function Glitch() {

  // https://gist.github.com/callumlocke/cc258a193839691f60dd
  function scaleCanvas(canvas, context, width, height) {
    // assume the device pixel ratio is 1 if the browser doesn't specify it
    const devicePixelRatio = window.devicePixelRatio || 1;

    // determine the 'backing store ratio' of the canvas context
    const backingStoreRatio = (
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio || 1
    );

    // determine the actual ratio we want to draw at
    const ratio = devicePixelRatio / backingStoreRatio;

    if (devicePixelRatio !== backingStoreRatio) {
      // set the 'real' canvas size to the higher width/height
      canvas.width = width * ratio;
      canvas.height = height * ratio;

      // ...then scale it back down with CSS
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
    }
    else {
      // this is a normal 1:1 device; just scale it simply
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = '';
      canvas.style.height = '';
    }

    // scale the drawing context so everything will work at the higher ratio
    context.scale(ratio, ratio);
  }

//Initialize variables
var container = {},
    canvas = {},
    cubes = {coord: []},
    tris = {count: 0, list: []},
    mouse = {},
    ctx,
    date,
    manual = false,
    maxWin;

function setDimensions() {
  //Pick the higher of width and height
  maxWin = Math.max(window.innerHeight, window.innerWidth);
  //Determine the size of the cubes
  cubes.dimension = maxWin / 30;
  //Set the number of rows and columns
  cubes.rows = cubes.cols = (maxWin / cubes.dimension);
  //Determine the number of cubes
  cubes.count = cubes.rows * cubes.cols;
  //Set the size of the canvas element
  canvas.dimension = cubes.dimension * cubes.rows;
}

function initialize() {
  var winHeight = window.innerHeight;

  //Init canvas
  container.self = document.getElementById('canvas-container');
  container.self.innerHTML = ''
  container.self.style.height = winHeight + "px";
  container.self.style.width = "100vw";
  canvas.self = document.createElement('canvas');
  ctx = canvas.self.getContext('2d');

  //Set canvas size
  canvas.self.width = canvas.self.height = canvas.dimension;

  scaleCanvas(canvas.self, ctx, canvas.self.width, canvas.self.height)

  //Interate over cubes and create two tris each
  for (var i = 0; i < cubes.count; i++) {
    //Top tri
    cubes.coord[0] = cubes.dimension * (i % cubes.cols);
    cubes.coord[1] = Math.floor(i / cubes.cols) * cubes.dimension;
    tris.list.push(new Tri(tris.count++, cubes.dimension, ...cubes.coord));

    //Bottom tri
    cubes.coord[0] += cubes.dimension;
    cubes.coord[1] += cubes.dimension;
    tris.list.push(new Tri(tris.count++, cubes.dimension, ...cubes.coord));
  }

  container.self.appendChild(canvas.self);

  //Add mousemove to container
  container.self.addEventListener('mousemove', function(e) {
    if (!manual) {
      //Change to manual mode when mouse moves
      manual = true;
    }

    //Determine where mouse is
    canvas.bounds = canvas.self.getBoundingClientRect();
    mouse.x = e.clientX - canvas.bounds.left;
    mouse.y = e.clientY - canvas.bounds.top;
  });
}

//Do this each frame
let lastRender = Date.now();
const interval = 50;
function step() {
  //Request next frame
  window.requestAnimationFrame(step);

  const now = Date.now()
  // Use the interval to throttle renders
  if (lastRender + interval > now) return;
  lastRender = now;

  tris.list.forEach((tri) => {
    //Draw the trangles
    ctx.beginPath();
    ctx.moveTo(tri.x, tri.y);
    ctx.lineTo(tri.a, tri.b);
    ctx.lineTo(tri.m, tri.n);

    //If in manual mode
    if (manual) {
      //If mouse pointer is in triangle path activate tri
      const scale = window.devicePixelRatio || 1;
      if (ctx.isPointInPath(mouse.x * scale, mouse.y * scale)) {
        tri.activate()
      }
    }
    //If in auto mode
    else {
      //Semi-randomly grab tris and activate them
      date = new Date();
      date = date.getMilliseconds();
      if (date > 2 && tri.i % date == 0) {
        tri.activate();
      }
    }

    //Deactive tri when it's faded out
    if (tri.opacity <= 0.04) {
      tri.active = false;
    }

    //If try is active
    if (tri.active) {
      //Clear pixels so they can be redrawn at different opacity
      ctx.clearRect(tri.x, tri.y, cubes.dimension, cubes.dimension);

      //Randomly change colors
      if (date % tri.i == 42) {
        //Green
        ctx.fillStyle = `rgba(94,121,42,${tri.opacity})`;
      } else if (date % tri.i == 87) {
        //Purple
        ctx.fillStyle = `rgba(121,43,94,${tri.opacity})`;
      } else {
        //But default to blue
        ctx.fillStyle = `rgba(43,94,121,${tri.opacity})`;
      }

      //Start fading out
      tri.opacity -= 0.001;

      //Fill tri
      ctx.fill();
    } else {
      //Set deactive tris to white so they don't pop up later
      ctx.fillStyle = 'white';
      //This needs to be here or tris don't fade properly
      ctx.fillRect(tri.x, tri.y, cubes.dimension, cubes.dimension);
    }
  });
}

//Start the program
setDimensions();
initialize();
window.requestAnimationFrame(step);

})();
