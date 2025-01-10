// Select elements
const hammer = document.querySelector(".hammer");
const sparksContainer = document.querySelector(".sparks");

// Function to generate a single spark with random properties
function generateSpark() {
    const spark = document.createElement("div");
    spark.classList.add("spark");
    sparksContainer.appendChild(spark);

    // Randomize spark properties
    const angle = Math.random() * 360; // Random direction
    const distance = Math.random() * 50 + 30; // Random distance
    const size = Math.random() * 5 + 3; // Random size
    const duration = Math.random() * 1.5 + 1; // Random animation duration

    // Set initial position and size
    gsap.set(spark, {
        width: size,
        height: size,
        x: 0,
        y: 0,
        opacity: 1,
        backgroundColor: "yellow",
        borderRadius: "50%",
        position: "absolute",
    });

    // Animate the spark's movement and fade
    gsap.to(spark, {
        x: distance * Math.cos((angle * Math.PI) / 180),
        y: distance * Math.sin((angle * Math.PI) / 180),
        opacity: 0,
        duration: duration,
        ease: "power1.out",
        onComplete: () => spark.remove(), // Remove spark after animation
    });
}

// Hammer strike animation with realistic arc motion
function hammerStrike() {
    const timeline = gsap.timeline();

    // Simulate the natural swing by adjusting rotation and position
    timeline
        .to(hammer, {
            rotation: -90, // Strike angle
            x: -30, // Move slightly left
            y: 10, // Move slightly downward
            duration: 0.4,
            transformOrigin: "bottom center", // Pivot at the handle's end
            ease: "power2.in",
        })
        .to(hammer, {
            rotation: 0, // Return to original position
            x: 0, // Reset position
            y: 0, // Reset position
            duration: 2,
            delay: 0.1,
            ease: "elastic.out(1, 0.3)", // Add a subtle bounce
        });

    // Generate multiple sparks during the strike
    for (let i = 0; i < 20; i++) {
        setTimeout(() => generateSpark(), i * 50);
    }
}

// Trigger the hammer strike and spark animations every 3 seconds
setInterval(hammerStrike, 3000);
