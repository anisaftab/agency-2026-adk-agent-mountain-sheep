'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import {
  GLOBE_R,
  nodeColor3,
  nodeColorHex,
  getConnectedFromEdges,
  TweakValues,
  TWEAK_DEFAULTS,
  NodeData,
  EdgeData,
} from './data';

interface GlobeRef {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  group: THREE.Group;
  nodeObjs: NodeObj[];
  edgeObjs: EdgeObj[];
  dotMat: THREE.PointsMaterial;
  wireMat: THREE.MeshBasicMaterial;
  rotSpeed: number;
}

interface NodeObj {
  nodeId: string;
  mesh: THREE.Mesh;
  sprite: THREE.Sprite;
  mat: THREE.MeshBasicMaterial;
  sprMat: THREE.SpriteMaterial;
  gs: number;
}

interface EdgeObj {
  edgeLoop: boolean;
  line: THREE.Line;
  linMat: THREE.LineBasicMaterial;
  opBase: number;
}

interface GlobeProps {
  nodes: NodeData[];
  edges: EdgeData[];
  tweaks: TweakValues;
  selectedNode: string | null;
  hoveredNode: string | null;
  chatOpen: boolean;
  infoVisible: boolean;
  onNodeClick: (nodeId: string | null) => void;
  onNodeHover: (nodeId: string | null) => void;
}

function sph(phi: number, theta: number, r = GLOBE_R): THREE.Vector3 {
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function makeGlowTex(hexStr: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  const r = parseInt(hexStr.slice(1, 3), 16);
  const gr = parseInt(hexStr.slice(3, 5), 16);
  const b = parseInt(hexStr.slice(5, 7), 16);
  g.addColorStop(0,   `rgba(${r},${gr},${b},1)`);
  g.addColorStop(0.2, `rgba(${r},${gr},${b},0.85)`);
  g.addColorStop(0.5, `rgba(${r},${gr},${b},0.3)`);
  g.addColorStop(1,   `rgba(${r},${gr},${b},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export default function Globe({
  nodes,
  edges,
  tweaks,
  selectedNode,
  hoveredNode,
  chatOpen,
  infoVisible,
  onNodeClick,
  onNodeHover,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<GlobeRef | null>(null);
  const chatOpenRef = useRef(chatOpen);
  const infoVisRef = useRef(infoVisible);
  const selectedNodeRef = useRef(selectedNode);
  const hoveredNodeRef = useRef(hoveredNode);

  useEffect(() => { chatOpenRef.current = chatOpen; }, [chatOpen]);
  useEffect(() => { infoVisRef.current = infoVisible; }, [infoVisible]);
  useEffect(() => { selectedNodeRef.current = selectedNode; }, [selectedNode]);
  useEffect(() => { hoveredNodeRef.current = hoveredNode; }, [hoveredNode]);

  /* ── Three.js setup (once) ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.offsetWidth  || window.innerWidth;
    const H = canvas.offsetHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    // false = don't let Three.js overwrite CSS sizing with inline px values
    renderer.setSize(W, H, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x08090e, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, W / H, 1, 3000);
    camera.position.z = 520;

    const group = new THREE.Group();
    scene.add(group);

    /* Fibonacci sphere dots */
    const N = 2600;
    const pts = new Float32Array(N * 3);
    const GA = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const th = GA * i;
      pts[i * 3]     = GLOBE_R * rad * Math.cos(th);
      pts[i * 3 + 1] = GLOBE_R * y;
      pts[i * 3 + 2] = GLOBE_R * rad * Math.sin(th);
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const dotMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: TWEAK_DEFAULTS.dotSize,
      transparent: true,
      opacity: TWEAK_DEFAULTS.dotOpacity,
      sizeAttenuation: false,
    });
    group.add(new THREE.Points(dotGeo, dotMat));

    /* Wireframe */
    const wireGeo = new THREE.IcosahedronGeometry(GLOBE_R, 4);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: TWEAK_DEFAULTS.wireOpacity,
    });
    group.add(new THREE.Mesh(wireGeo, wireMat));

    /* Nodes */
    const nodeObjs: NodeObj[] = [];
    nodes.forEach((node) => {
      const center = sph(node.phi, node.theta);
      const isDir = node.type === 'director';
      const size = isDir ? 3.8 : 5.5;
      const geo = new THREE.SphereGeometry(size, 20, 20);
      const mat = new THREE.MeshBasicMaterial({ color: nodeColor3(node), transparent: true, opacity: 1 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(center);
      mesh.userData.nodeId = node.id;
      group.add(mesh);

      const glowTex = makeGlowTex(nodeColorHex(node));
      const sprMat = new THREE.SpriteMaterial({
        map: glowTex,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(sprMat);
      const gs = isDir ? 28 : 40;
      sprite.scale.set(gs, gs, 1);
      sprite.position.copy(center);
      group.add(sprite);

      nodeObjs.push({ nodeId: node.id, mesh, sprite, mat, sprMat, gs });
    });

    /* Edges */
    const edgeObjs: EdgeObj[] = [];
    edges.forEach((edge) => {
      const fN = nodes.find((n) => n.id === edge.from);
      const tN = nodes.find((n) => n.id === edge.to);
      if (!fN || !tN) return;
      const p0 = sph(fN.phi, fN.theta);
      const p1 = sph(tN.phi, tN.theta);
      const mid = p0.clone().add(p1).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(GLOBE_R * (edge.loop ? 1.48 : 1.24));
      const curve = new THREE.QuadraticBezierCurve3(p0, mid, p1);
      const linePts = curve.getPoints(72);
      const geo = new THREE.BufferGeometry().setFromPoints(linePts);
      const color = edge.loop ? 0xff3535 : 0x7c6dfa;
      const opBase = edge.loop ? 0.82 : 0.38 * (TWEAK_DEFAULTS.edgeOpacity / 0.5);
      const linMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: opBase,
        blending: THREE.AdditiveBlending,
      });
      const line = new THREE.Line(geo, linMat);
      group.add(line);
      edgeObjs.push({ edgeLoop: edge.loop, line, linMat, opBase });
    });

    glRef.current = {
      renderer,
      scene,
      camera,
      group,
      nodeObjs,
      edgeObjs,
      dotMat,
      wireMat,
      rotSpeed: TWEAK_DEFAULTS.rotationSpeed * 0.004,
    };

    /* Rotation state */
    let autoRot = true;
    let dragging = false;
    let rotX = 0.1;
    let rotY = 0;
    let lastX = 0;
    let lastY = 0;
    let autoTimer: ReturnType<typeof setTimeout> | null = null;

    const toNDC = (e: MouseEvent): THREE.Vector2 => {
      const rect = canvas.getBoundingClientRect();
      return new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
    };

    const raycast = (e: MouseEvent): string | null => {
      const ndc = toNDC(e);
      const ray = new THREE.Raycaster();
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(nodeObjs.map((o) => o.mesh));
      return hits.length ? (hits[0].object.userData.nodeId as string) : null;
    };

    const onMD = (e: MouseEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      if (autoTimer) clearTimeout(autoTimer);
      autoRot = false;
    };

    const onMM = (e: MouseEvent) => {
      if (dragging) {
        rotY += (e.clientX - lastX) * 0.005;
        rotX = Math.max(-1.25, Math.min(1.25, rotX + (e.clientY - lastY) * 0.005));
        lastX = e.clientX;
        lastY = e.clientY;
        group.rotation.y = rotY;
        group.rotation.x = rotX;
      }
      const chatW = chatOpenRef.current ? 360 : 32;
      const barH = infoVisRef.current ? 76 : 0;
      if (e.clientX < chatW || e.clientY < 56 || e.clientY > window.innerHeight - barH) {
        onNodeHover(null);
        return;
      }
      onNodeHover(raycast(e));
    };

    const onMU = () => {
      dragging = false;
      autoTimer = setTimeout(() => { autoRot = true; }, 2200);
    };

    const onCL = (e: MouseEvent) => {
      const chatW = chatOpenRef.current ? 360 : 32;
      if (e.clientX < chatW || e.clientY < 56) return;
      onNodeClick(raycast(e) ?? null);
    };

    canvas.addEventListener('mousedown', onMD);
    window.addEventListener('mousemove', onMM);
    window.addEventListener('mouseup', onMU);
    canvas.addEventListener('click', onCL);

    let raf: number;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (autoRot && glRef.current) {
        group.rotation.y += glRef.current.rotSpeed ?? 0.0016;
        rotY = group.rotation.y;
      }
      renderer.render(scene, camera);
    };
    animate();

    /* Scroll-wheel zoom */
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(150, Math.min(900, camera.position.z + e.deltaY * 0.5));
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });

    const onResize = () => {
      const W2 = canvas.offsetWidth  || window.innerWidth;
      const H2 = canvas.offsetHeight || window.innerHeight;
      renderer.setSize(W2, H2, false);
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      if (autoTimer) clearTimeout(autoTimer);
      canvas.removeEventListener('mousedown', onMD);
      window.removeEventListener('mousemove', onMM);
      window.removeEventListener('mouseup', onMU);
      canvas.removeEventListener('click', onCL);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [nodes, edges, onNodeClick, onNodeHover]);

  /* ── Update node visuals on selection/hover change ── */
  useEffect(() => {
    const gl = glRef.current;
    if (!gl?.nodeObjs) return;
    const conn = selectedNode ? getConnectedFromEdges(selectedNode, edges) : null;

    gl.nodeObjs.forEach(({ nodeId, mat, sprMat }) => {
      const hov = hoveredNode === nodeId;
      if (!conn) {
        mat.opacity = 1;
        sprMat.opacity = hov ? 0.9 : 0.55;
      } else {
        const c = conn.has(nodeId);
        mat.opacity = c ? 1 : 0.1;
        sprMat.opacity = c ? (nodeId === selectedNode ? 1.0 : 0.72) : 0.04;
      }
    });
  }, [selectedNode, hoveredNode, edges]);

  /* ── Refined edge visibility using EDGES data ── */
  useEffect(() => {
    const gl = glRef.current;
    if (!gl?.edgeObjs) return;
    const conn = selectedNode ? getConnectedFromEdges(selectedNode, edges) : null;

    gl.edgeObjs.forEach((eo, i) => {
      const edge = edges[i];
      if (!edge) return;
      if (!conn) {
        eo.linMat.opacity = eo.opBase;
        return;
      }
      const touches = edge.from === selectedNode || edge.to === selectedNode;
      eo.linMat.opacity = touches ? Math.min(1, eo.opBase * 1.8) : eo.opBase * 0.06;
    });
  }, [selectedNode, edges]);

  /* ── Dark/light mode + dot/wire tweaks ── */
  useEffect(() => {
    const gl = glRef.current;
    if (!gl?.renderer) return;
    gl.renderer.setClearColor(tweaks.darkMode ? 0x08090e : 0xf5f5f7, 1);
    if (gl.dotMat) {
      gl.dotMat.color.set(tweaks.darkMode ? 0xffffff : 0x222233);
      gl.dotMat.opacity = tweaks.darkMode ? tweaks.dotOpacity : tweaks.dotOpacity * 1.3;
    }
    if (gl.wireMat) {
      gl.wireMat.color.set(tweaks.darkMode ? 0xffffff : 0x000000);
      gl.wireMat.opacity = tweaks.wireOpacity * (tweaks.darkMode ? 1 : 1.4);
    }
    if (gl.nodeObjs) {
      gl.nodeObjs.forEach(({ nodeId, mat }) => {
        const node = nodes.find((n) => n.id === nodeId);
        if (node?.type === 'director') {
          mat.color.set(tweaks.darkMode ? 0xffffff : 0x222233);
        }
      });
    }
  }, [tweaks.darkMode, tweaks.dotOpacity, tweaks.wireOpacity, nodes]);

  /* ── Dot size ── */
  useEffect(() => {
    const gl = glRef.current;
    if (!gl?.dotMat) return;
    gl.dotMat.size = tweaks.dotSize;
    gl.dotMat.opacity = tweaks.darkMode ? tweaks.dotOpacity : tweaks.dotOpacity * 1.3;
  }, [tweaks.dotSize, tweaks.dotOpacity, tweaks.darkMode]);

  /* ── Wireframe opacity ── */
  useEffect(() => {
    const gl = glRef.current;
    if (!gl?.wireMat) return;
    gl.wireMat.opacity = tweaks.wireOpacity * (tweaks.darkMode ? 1 : 1.4);
  }, [tweaks.wireOpacity, tweaks.darkMode]);

  /* ── Rotation speed ── */
  useEffect(() => {
    if (glRef.current) glRef.current.rotSpeed = tweaks.rotationSpeed * 0.004;
  }, [tweaks.rotationSpeed]);

  /* ── Glow intensity ── */
  useEffect(() => {
    const gl = glRef.current;
    if (!gl?.nodeObjs) return;
    gl.nodeObjs.forEach(({ sprite, gs }) => {
      const s = gs * tweaks.glowIntensity;
      sprite.scale.set(s, s, 1);
    });
  }, [tweaks.glowIntensity]);

  /* ── Edge opacity ── */
  useEffect(() => {
    const gl = glRef.current;
    if (!gl?.edgeObjs) return;
    gl.edgeObjs.forEach((eo, i) => {
      const edge = edges[i];
      if (!edge) return;
      eo.linMat.opacity = edge.loop ? 0.82 : 0.38 * (tweaks.edgeOpacity / 0.5);
      eo.opBase = edge.loop ? 0.82 : 0.38 * (tweaks.edgeOpacity / 0.5);
    });
  }, [tweaks.edgeOpacity, edges]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
    />
  );
}
