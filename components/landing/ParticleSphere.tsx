'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function ParticleSphere() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Particle geometry — sphere distribution
    const particleCount = 4000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const randoms = new Float32Array(particleCount);

    const color1 = new THREE.Color('#6c63ff'); // accent purple
    const color2 = new THREE.Color('#00d4aa'); // accent teal
    const color3 = new THREE.Color('#8b5cf6'); // violet

    for (let i = 0; i < particleCount; i++) {
      // Fibonacci sphere distribution for uniform coverage
      const phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const radius = 1.8 + (Math.random() - 0.5) * 0.15;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Random color blend
      const mixFactor = Math.random();
      const particleColor = new THREE.Color();
      if (mixFactor < 0.4) {
        particleColor.lerpColors(color1, color2, Math.random());
      } else if (mixFactor < 0.7) {
        particleColor.lerpColors(color1, color3, Math.random());
      } else {
        particleColor.copy(color1).lerp(new THREE.Color('#ffffff'), Math.random() * 0.4);
      }

      colors[i * 3] = particleColor.r;
      colors[i * 3 + 1] = particleColor.g;
      colors[i * 3 + 2] = particleColor.b;

      sizes[i] = Math.random() * 3 + 1;
      randoms[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

    // Custom shader material for glowing particles
    const vertexShader = `
      attribute float size;
      attribute float aRandom;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;

      void main() {
        vColor = color;

        vec3 pos = position;

        // Organic wave distortion
        float wave = sin(pos.x * 2.0 + uTime * 0.8 + aRandom) * 0.06;
        wave += cos(pos.y * 2.5 + uTime * 0.6 + aRandom) * 0.04;
        wave += sin(pos.z * 1.8 + uTime * 1.0) * 0.05;
        pos += normalize(pos) * wave;

        // Breathing effect
        float breathe = sin(uTime * 0.4) * 0.03 + 1.0;
        pos *= breathe;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Size attenuation
        gl_PointSize = size * (200.0 / -mvPosition.z);

        // Distance-based alpha
        float dist = length(pos);
        vAlpha = smoothstep(2.2, 1.5, dist) * 0.9 + 0.1;
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        // Soft circle
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;

        // Glow falloff
        float glow = 1.0 - smoothstep(0.0, 0.5, dist);
        glow = pow(glow, 1.5);

        gl_FragColor = vec4(vColor, glow * vAlpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
      },
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Inner glow sphere
    const innerGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#6c63ff'),
      transparent: true,
      opacity: 0.06,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerSphere);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      material.uniforms.uTime.value = elapsed;

      // Smooth rotation following mouse
      particles.rotation.y += (mouseX * 0.3 - particles.rotation.y) * 0.02;
      particles.rotation.x += (mouseY * 0.2 - particles.rotation.x) * 0.02;

      // Base slow rotation
      particles.rotation.y += 0.001;
      particles.rotation.z += 0.0005;

      innerSphere.rotation.y = elapsed * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      innerGeo.dispose();
      innerMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  );
}
