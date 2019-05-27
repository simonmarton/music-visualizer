import React, { Component } from 'react';
import * as THREE from 'three';

import SimplexNoise from 'simplex-noise';

export default class Visualization extends Component {
  componentDidMount() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    //ADD SCENE
    this.scene = new THREE.Scene();
    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 4;
    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor('#000000');
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    //ADD Sphere
    const geometry = new THREE.IcosahedronGeometry(0.5, 3);
    this.material = new THREE.MeshLambertMaterial({
      color: this.props.color,
      wireframe: true
    });

    this.sphere = new THREE.Mesh(geometry, this.material);
    // this.sphere.position.set(0, 0, 0);

    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const material = new THREE.MeshBasicMaterial({ color: '#433F81' });
    // this.cube = new THREE.Mesh(geometry, material);
    // this.scene.add(this.cube);

    // lights
    const ambientLight = new THREE.AmbientLight(0xaaaaaa);
    this.scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 0.9;
    spotLight.position.set(-10, 40, 20);
    spotLight.lookAt(this.sphere);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    this.scene.add(this.sphere);

    this.noise = new SimplexNoise();

    this.start();
  }

  componentWillUnmount() {
    this.stop();
    this.mount.removeChild(this.renderer.domElement);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.color !== this.props.color) {
      this.material.color.set(new THREE.Color(this.props.color));
    }
  }

  start = () => {
    this.prev = -100;
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  };

  stop = () => {
    cancelAnimationFrame(this.frameId);
  };

  animate = () => {
    // const frequency = 0.001 * Math.PI,

    const amplitude = 0.01;

    const lowerMaxFr = 0.01;
    // const upperAvgFr = 0.01;
    // const upperAvgFr = 0.01 + 0.05 * (Math.floor(Date.now() / 1000) % 2);
    // const upperAvgFr = (Math.sin(Date.now() % 1000) + 1) * 0.01;

    const { tempo } = this.props;
    const frequency = ((tempo / 60000) * Math.PI) / 2;

    const upperAvgFr = Math.sin(Date.now() * frequency) * amplitude;
    if (upperAvgFr * this.prev < 0) {
      // console.log('switch', Math.floor(Date.now() / 1000));
      this.prev = upperAvgFr;
    }
    // PI shoud be 1 beat
    // console.log({ upperAvgFr });

    // Date.now() * freq = PI
    // 60 bpm = 1 bps = .001 bpms
    // 120 bpm = 2 bps = .002 bpms
    // bpm / 60000 = bpms

    this.makeRoughBall(this.sphere, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));
    this.sphere.rotation.y += 0.005;
    // this.cube.rotation.y += 0.01;
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  };

  makeRoughBall = (mesh, bassFr, treFr) => {
    mesh.geometry.vertices.forEach((vertex, i) => {
      const offset = mesh.geometry.parameters.radius;
      const amp = 7;
      const time = window.performance.now();
      vertex.normalize();
      const rf = 0.00001;
      const distance =
        offset +
        bassFr +
        this.noise.noise3D(vertex.x + time * rf * 7, vertex.y + time * rf * 8, vertex.z + time * rf * 9) * amp * treFr;
      vertex.multiplyScalar(distance);
    });
    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.normalsNeedUpdate = true;
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeFaceNormals();
  };

  renderScene = () => {
    this.renderer.render(this.scene, this.camera);
  };
  render() {
    return (
      <div
        style={{ width: '100vw', height: '100vh' }}
        ref={mount => {
          this.mount = mount;
        }}
      />
    );
  }
}

//some helper functions here
function fractionate(val, minVal, maxVal) {
  return (val - minVal) / (maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
  var fr = fractionate(val, minVal, maxVal);
  var delta = outMax - outMin;
  return outMin + fr * delta;
}

function avg(arr) {
  var total = arr.reduce(function(sum, b) {
    return sum + b;
  });
  return total / arr.length;
}

function max(arr) {
  return arr.reduce(function(a, b) {
    return Math.max(a, b);
  });
}
