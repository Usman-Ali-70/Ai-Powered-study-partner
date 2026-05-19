'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * KnowledgeNet — interactive 3D hero.
 *
 * Wireframe icosahedron "core" orbited by a particle shell that draws
 * thin glowing connection lines between nearby particles (a neural /
 * knowledge-graph look).
 *
 * Reactive:
 *   • Mouse parallax  → cloud rotates toward the pointer
 *   • Hover proximity → particles closest to the cursor brighten / repel
 *   • Page scroll     → camera pulls back, core spin accelerates, palette warms
 *
 * Performance:
 *   • Particle count & connection scan cadence scale with viewport width
 *   • Connection geometry is one pre-allocated LineSegments buffer
 *   • Honors prefers-reduced-motion
 */
export function KnowledgeNet() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // ----- Renderer / scene / camera -----
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    const baseZ = 6;
    camera.position.z = baseZ;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ----- Density tiers -----
    const isSmall = window.innerWidth < 768;
    const particleCount = isSmall ? 120 : 240;
    const connectDist = isSmall ? 0.7 : 0.9;
    const maxConnections = isSmall ? 320 : 800;

    // ----- Wireframe core (icosahedron) -----
    const coreGeo = new THREE.IcosahedronGeometry(1.05, 1);
    const coreWire = new THREE.WireframeGeometry(coreGeo);
    const coreMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#6c63ff'),
      transparent: true,
      opacity: 0.6,
    });
    const coreLines = new THREE.LineSegments(coreWire, coreMat);
    scene.add(coreLines);

    // Inner glow
    const glowGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#6c63ff'),
      transparent: true,
      opacity: 0.09,
    });
    const glowSphere = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowSphere);

    // Outer ring (subtle parallax element)
    const ringGeo = new THREE.TorusGeometry(2.6, 0.012, 8, 220);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#00d4aa'),
      transparent: true,
      opacity: 0.25,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.4;
    scene.add(ring);

    // ----- Orbital particles -----
    const positions = new Float32Array(particleCount * 3);
    const basePositions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Slightly desaturated palette so the particle cloud reads as
    // *ambient* behind the headline, never competing with the gradient
    // text that uses the same purple → teal hues.
    const cAccent = new THREE.Color('#5a52e0');
    const cTeal = new THREE.Color('#1aaa8c');
    const cViolet = new THREE.Color('#7448d4');

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const r = 2.0 + Math.random() * 0.9;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions[i * 3] = basePositions[i * 3] = x;
      positions[i * 3 + 1] = basePositions[i * 3 + 1] = y;
      positions[i * 3 + 2] = basePositions[i * 3 + 2] = z;

      velocities[i * 3] = (Math.random() - 0.5) * 0.0008;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.0008;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.0008;

      const t = Math.random();
      const col = new THREE.Color();
      if (t < 0.55) col.lerpColors(cAccent, cViolet, Math.random());
      else col.lerpColors(cAccent, cTeal, Math.random());

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = Math.random() * 1.8 + 1.0;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    pGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: { uTime: { value: 0 }, uHoverBoost: { value: 0 } },
      vertexShader: /* glsl */ `
        attribute float size;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uHoverBoost;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = size * (220.0 / -mv.z) * (1.0 + uHoverBoost * 0.35);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float g = pow(1.0 - smoothstep(0.0, 0.5, d), 1.6);
          gl_FragColor = vec4(vColor, g);
        }
      `,
    });

    const points = new THREE.Points(pGeo, particleMat);
    scene.add(points);

    // ----- Pre-allocated connection LineSegments -----
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    const lineColors = new Float32Array(maxConnections * 2 * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage),
    );
    lineGeo.setAttribute(
      'color',
      new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage),
    );
    lineGeo.setDrawRange(0, 0);
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const connections = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(connections);

    // ----- Mouse + scroll state -----
    let mouseX = 0;
    let mouseY = 0;
    let hovering = false;
    let hoverBoost = 0; // 0..1 lerps toward 1 when hovering
    let scrollT = 0;    // 0..1 over the first viewport of scroll

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const onEnter = () => (hovering = true);
    const onLeave = () => (hovering = false);
    const onScroll = () => {
      const v = window.scrollY / Math.max(1, window.innerHeight);
      scrollT = Math.min(1, Math.max(0, v));
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);

    // ----- Render loop -----
    const posAttr = pGeo.attributes.position as THREE.BufferAttribute;
    const linePosAttr = lineGeo.attributes.position as THREE.BufferAttribute;
    const lineColAttr = lineGeo.attributes.color as THREE.BufferAttribute;

    let prev = performance.now();
    let elapsed = 0;
    let frame = 0;
    let scanEvery = isSmall ? 4 : 2;
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const delta = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      elapsed += delta;
      frame += 1;

      // Smooth hover lerp
      const hoverTarget = hovering ? 1 : 0;
      hoverBoost += (hoverTarget - hoverBoost) * Math.min(1, delta * 6);

      particleMat.uniforms.uTime.value = elapsed;
      particleMat.uniforms.uHoverBoost.value = hoverBoost;

      // ----- Hover-driven gentle radial nudge -----
      // Compute a cursor direction in scene space (rough)
      const hx = mouseX * 2.6;
      const hy = mouseY * 2.6;

      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        // Drift
        positions[ix] += velocities[ix];
        positions[ix + 1] += velocities[ix + 1];
        positions[ix + 2] += velocities[ix + 2];

        // Hover repel — closer particles get a small outward push toward mouse line
        if (hoverBoost > 0.02) {
          const dx = positions[ix] - hx;
          const dy = positions[ix + 1] - hy;
          const flat = Math.sqrt(dx * dx + dy * dy) + 0.001;
          const force = (hoverBoost * 0.04) / flat;
          positions[ix] += (dx / flat) * force;
          positions[ix + 1] += (dy / flat) * force;
        }

        // Pull back toward base shell so the cloud holds shape
        const targetX = basePositions[ix];
        const targetY = basePositions[ix + 1];
        const targetZ = basePositions[ix + 2];
        positions[ix] += (targetX - positions[ix]) * 0.012;
        positions[ix + 1] += (targetY - positions[ix + 1]) * 0.012;
        positions[ix + 2] += (targetZ - positions[ix + 2]) * 0.012;
      }
      posAttr.needsUpdate = true;

      // ----- Scroll-driven camera/core changes -----
      // Pull camera back, accelerate core spin, brighten ring as user scrolls
      const targetZ = baseZ + scrollT * 3.4;
      camera.position.z += (targetZ - camera.position.z) * 0.07;

      const spinScale = reducedMotion ? 0 : 1 + scrollT * 2.5;
      coreLines.rotation.y += delta * 0.18 * spinScale;
      coreLines.rotation.x += delta * 0.07 * spinScale;
      ring.rotation.z += delta * 0.12 * spinScale;
      ringMat.opacity = 0.25 + scrollT * 0.35;

      const breathe = 1.0 + Math.sin(elapsed * 0.6) * 0.04;
      coreLines.scale.setScalar(breathe);
      glowSphere.scale.setScalar(breathe * 1.05);

      // Mouse parallax on the particle cloud
      points.rotation.y += (mouseX * 0.4 - points.rotation.y) * 0.04;
      points.rotation.x += (mouseY * 0.25 - points.rotation.x) * 0.04;
      if (!reducedMotion) points.rotation.y += delta * 0.03;

      // ----- Recompute connections -----
      if (frame % scanEvery === 0) {
        let pairs = 0;
        const d2 = connectDist * connectDist;
        for (let i = 0; i < particleCount && pairs < maxConnections; i++) {
          const ax = positions[i * 3];
          const ay = positions[i * 3 + 1];
          const az = positions[i * 3 + 2];
          for (let j = i + 1; j < particleCount && pairs < maxConnections; j++) {
            const bx = positions[j * 3];
            const by = positions[j * 3 + 1];
            const bz = positions[j * 3 + 2];
            const dx = ax - bx;
            const dy = ay - by;
            const dz = az - bz;
            const dist2 = dx * dx + dy * dy + dz * dz;
            if (dist2 < d2) {
              const li = pairs * 6;
              linePositions[li] = ax;
              linePositions[li + 1] = ay;
              linePositions[li + 2] = az;
              linePositions[li + 3] = bx;
              linePositions[li + 4] = by;
              linePositions[li + 5] = bz;

              const fade = 1.0 - Math.sqrt(dist2) / connectDist;
              const ci = pairs * 6;
              lineColors[ci] = colors[i * 3] * fade;
              lineColors[ci + 1] = colors[i * 3 + 1] * fade;
              lineColors[ci + 2] = colors[i * 3 + 2] * fade;
              lineColors[ci + 3] = colors[j * 3] * fade;
              lineColors[ci + 4] = colors[j * 3 + 1] * fade;
              lineColors[ci + 5] = colors[j * 3 + 2] * fade;

              pairs += 1;
            }
          }
        }
        lineGeo.setDrawRange(0, pairs * 2);
        linePosAttr.needsUpdate = true;
        lineColAttr.needsUpdate = true;
      }

      connections.rotation.copy(points.rotation);

      renderer.render(scene, camera);
    };
    tick();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      const nowSmall = window.innerWidth < 768;
      scanEvery = nowSmall ? 4 : 2;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      pGeo.dispose();
      particleMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      coreWire.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{ pointerEvents: 'auto' }}
    />
  );
}
