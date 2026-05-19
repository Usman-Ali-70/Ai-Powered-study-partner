'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface FloatingShapeProps {
  /** 0 = octahedron, 1 = icosahedron, 2 = torus knot */
  variant?: 0 | 1 | 2;
  color?: string;
  /** Size in px (square) */
  size?: number;
}

/**
 * A tiny, low-cost 3D widget meant to sit inside a card.
 * Idle: slow rotation. Hover (on the card, via pointer entering the
 * containing element): the shape speeds up + scales up.
 */
export function FloatingShape({
  variant = 0,
  color = '#6c63ff',
  size = 80,
}: FloatingShapeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    let geo: THREE.BufferGeometry;
    if (variant === 0) geo = new THREE.OctahedronGeometry(1, 0);
    else if (variant === 1) geo = new THREE.IcosahedronGeometry(1, 0);
    else geo = new THREE.TorusKnotGeometry(0.7, 0.22, 80, 12);

    const wire = new THREE.WireframeGeometry(geo);
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.85,
    });
    const mesh = new THREE.LineSegments(wire, mat);
    scene.add(mesh);

    // Soft inner sphere
    const inner = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 16, 16),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.1 }),
    );
    scene.add(inner);

    // Hover state — driven by the parent card hover via container hover detection
    let hover = 0; // 0..1
    const findCard = (): HTMLElement => {
      let el: HTMLElement | null = container.parentElement;
      while (el) {
        if (el.classList.contains('landing-feature-card')) return el;
        el = el.parentElement;
      }
      return container;
    };
    const card = findCard();
    const onEnter = () => (hover = 1);
    const onLeave = () => (hover = 0);
    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mouseleave', onLeave);

    let cur = 0;
    let prev = performance.now();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const delta = Math.min(0.05, (now - prev) / 1000);
      prev = now;

      cur += (hover - cur) * Math.min(1, delta * 6);
      const speed = (reducedMotion ? 0.2 : 0.6) * (1 + cur * 2.4);
      mesh.rotation.x += delta * speed * 0.6;
      mesh.rotation.y += delta * speed;
      const scale = 1 + cur * 0.18;
      mesh.scale.setScalar(scale);
      inner.scale.setScalar(scale);
      mat.opacity = 0.7 + cur * 0.25;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mouseleave', onLeave);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geo.dispose();
      wire.dispose();
      mat.dispose();
      inner.geometry.dispose();
      (inner.material as THREE.Material).dispose();
    };
  }, [variant, color, size]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size, pointerEvents: 'none' }}
    />
  );
}
