// lava_lamp_animation.js

document.addEventListener("DOMContentLoaded", () => {
  // Get references to the SVG circle elements
  const blobs = [
    { element: document.getElementById('blobb1'), x: 200, y: 100, xSpeed: 0.2, ySpeed: 0.34 },
    { element: document.getElementById('blobb2'), x: 100, y: 300, xSpeed: -0.5, ySpeed: 0.5 },
    { element: document.getElementById('blobb3'), x: 300, y: 400, xSpeed: 0.3, ySpeed: 0.6 },
    { element: document.getElementById('blobb4'), x: 50, y: 500, xSpeed: -0.1, ySpeed: 0.6 },
    { element: document.getElementById('blobb5'), x: 350, y: 250, xSpeed: -0.2, ySpeed: 0.3 },
  ];

  // Define the boundaries for the blob movement.
  // These values are relative to the SVG's coordinate system, which is scaled.
  // We make them slightly larger than the visible area to ensure smooth transitions
  // as blobs move in and out of view.
  const bounds = {
    minX: -50, 
    minY: -50,
    maxX: 450, // Assuming a max width of 400px for the popup + buffer
    maxY: 650, // Assuming a max height of 600px for the popup + buffer
  };

  /**
   * Updates the position of a single blob and handles boundary collisions.
   * @param {object} blob - The blob object containing its element, position, and speed.
   */
  function updateBlobPosition(blob) {
    blob.x += blob.xSpeed;
    blob.y += blob.ySpeed;

    // Reverse direction if hitting horizontal bounds
    if (blob.x < bounds.minX || blob.x > bounds.maxX) {
      blob.xSpeed *= -1;
    }
    // Reverse direction if hitting vertical bounds
    if (blob.y < bounds.minY || blob.y > bounds.maxY) {
      blob.ySpeed *= -1;
    }

    // Apply the updated position to the SVG circle element
    blob.element.setAttribute('cx', blob.x);
    blob.element.setAttribute('cy', blob.y);
  }

  /**
   * The main animation loop that updates all blobs.
   */
  function animateBlobs() {
    blobs.forEach(updateBlobPosition);
    // Request the next animation frame for smooth, continuous animation
    requestAnimationFrame(animateBlobs);
  }

  // Start the animation loop when the DOM is ready
  animateBlobs();
});
