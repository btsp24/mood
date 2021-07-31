tsParticles.load("gokyuzu", {
    background: {
      color: "rgb(6, 46, 110);"
    },
    detectRetina: false,
    fpsLimit: 30,
    interactivity: {
      detectsOn: "canvas",
      events: {
        resize: true
      }
    },
    particles: {
      color: {
        value: "#fff"
      },
      number: {
        density: {
          enable: true,
          area: 1080
        },
        limit: 0,
        value: 450
      },
      opacity: {
        animation: {
          enable: true,
          minimumValue: 0.2,
          speed: 3,
          sync: false
        },
        random: {
          enable: true,
          minimumValue: 0.15
        },
        value: 1
      },
      shape: {
        type: "circle"
      },
      size: {
        random: {
          enable: true,
          minimumValue: 0.5
        },
        value: 1
      }
    }
  });
  
