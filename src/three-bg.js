import * as THREE from "three";

/* Full-screen raymarched-ish fragment shader: soft monochrome glow blobs
   drifting over pure black, reacting to the pointer. Matches the blurred
   light pools on the pricing reference. Pure GPU, single fullscreen quad. */

const vertex = /* glsl */ `
  void main() { gl_Position = vec4(position, 1.0); }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform vec2  uRes;
  uniform float uTime;
  uniform vec2  uMouse;

  // cheap value noise
  float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
               mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  float blob(vec2 uv, vec2 c, float r){
    float d = length(uv - c);
    return smoothstep(r, 0.0, d);
  }

  void main(){
    vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / uRes.y;
    float t = uTime * 0.08;

    vec2 m = (uMouse - 0.5) * vec2(uRes.x/uRes.y, 1.0);

    // drifting light pools
    float g = 0.0;
    g += blob(uv, vec2(sin(t*1.3)*0.5, cos(t)*0.3) + m*0.25, 0.85) * 0.5;
    g += blob(uv, vec2(cos(t*0.9)*0.6, sin(t*1.7)*0.4) - m*0.2, 0.7) * 0.4;
    g += blob(uv, vec2(-0.6 + sin(t*0.6)*0.3, -0.4), 0.9) * 0.3;

    // warp with noise so edges feel organic
    float n = fbm(uv*2.2 + t*2.0);
    g *= 0.6 + 0.5*n;
    g = pow(g, 1.6);

    vec3 col = vec3(g) * 0.5;          // grey light
    col += vec3(0.015);                // lift blacks a hair

    // vignette
    col *= 1.0 - 0.5*length(uv*0.7);

    // subtle film grain
    col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.015;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function initBackground() {
  const canvas = document.getElementById("bg-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setClearColor(0x000000, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();

  const uniforms = {
    uRes: { value: new THREE.Vector2() },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  };

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms })
  );
  scene.add(mesh);

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
  }
  resize();
  window.addEventListener("resize", resize);

  // smoothed pointer
  const target = { x: 0.5, y: 0.5 };
  window.addEventListener("pointermove", (e) => {
    target.x = e.clientX / window.innerWidth;
    target.y = 1.0 - e.clientY / window.innerHeight;
  });

  const clock = new THREE.Clock();
  let raf;
  function loop() {
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uMouse.value.x += (target.x - uniforms.uMouse.value.x) * 0.04;
    uniforms.uMouse.value.y += (target.y - uniforms.uMouse.value.y) * 0.04;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  loop();

  // pause when tab hidden (perf)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else loop();
  });
}
