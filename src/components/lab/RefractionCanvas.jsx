import React, { useEffect, useRef } from 'react';

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2  uTextSize;   // captured texture size in px
uniform vec2  uOrigin;     // panel top-left inside the texture, px
uniform vec2  uPanel;      // panel size in css px
uniform float uStrength;   // edge bend in px
uniform float uBlur;       // sample radius
uniform float uRim;        // specular rim intensity
uniform float uTint;
uniform vec3 uTintColor;

vec3 sampleBent(vec2 uv) {
  // vUv.y = 0 at the bottom of the quad; texture row 0 is the top of the capture
  vec2 px = uOrigin + vec2(uv.x, 1.0 - uv.y) * uPanel;
  return texture2D(uTex, px / uTextSize).rgb;
}

void main() {
  vec2 p = vUv;
  vec2 c = p - 0.5;
  float r = length(c) * 2.0;
  vec2 dir = normalize(c + vec2(1e-5));

  // the bevel: nothing in the middle, increasing bend toward the rim
  float bevel = smoothstep(0.58, 0.99, r);
  // taper back to zero at the border so the bent sample meets the backdrop exactly
  float taper = 1.0 - smoothstep(0.965, 1.0, r);
  float bend = bevel * bevel * uStrength * taper;
  vec2 off = (dir * bend) / uPanel;

  vec3 col;
  col.r = sampleBent(p - off * 1.06).r;
  col.g = sampleBent(p - off).g;
  col.b = sampleBent(p - off * 0.94).b;

  // soften with a tiny 4-tap cross so the bend reads as glass, not noise
  vec3 blur = vec3(0.0);
  float rad = uBlur / uPanel.x;
  blur += sampleBent(p + vec2(rad, 0.0));
  blur += sampleBent(p - vec2(rad, 0.0));
  blur += sampleBent(p + vec2(0.0, rad));
  blur += sampleBent(p - vec2(0.0, rad));
  col = mix(col, blur * 0.25, 0.55);

  // thick glass darkens and cools toward the rim
  float edge = smoothstep(0.5, 1.0, r);
  col *= 1.0 - edge * 0.16;
  col = mix(col, col * vec3(0.94, 0.98, 1.06), edge * 0.6);

  // specular ring, strongest just inside the border
  float ring = smoothstep(0.88, 0.995, r) * (1.0 - smoothstep(0.995, 1.02, r));
  col += ring * uRim * vec3(1.0, 0.99, 0.96);

  // inner tint so text stays legible
  col = mix(col, uTintColor, uTint);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Refracts a captured backdrop with a WebGL lens shader.
 * The panel is a plain <canvas>; content is layered above it by the caller.
 */
export default function RefractionCanvas({ texture, origin, width, height, strength = 34, blur = 1.2, rim = 0.18, tint = 0.1, tintColor = [0.97, 0.985, 1.0], className = 'refract-canvas' }) {
  const canvasRef = useRef(null);
  const state = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: false });
    if (!gl) return undefined;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return undefined;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return undefined;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const textureUnit = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureUnit);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);

    const uniforms = {};
    ['uTex', 'uTextSize', 'uOrigin', 'uPanel', 'uStrength', 'uBlur', 'uRim', 'uTint', 'uTintColor'].forEach((name) => {
      uniforms[name] = gl.getUniformLocation(program, name);
    });

    state.current = { gl, program, uniforms, textureUnit };
    return () => {
      state.current = null;
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteTexture(textureUnit);
      gl.deleteBuffer(buffer);
    };
  }, [width, height]);

  useEffect(() => {
    const s = state.current;
    const canvas = canvasRef.current;
    if (!s || !canvas || !texture) return;

    const { gl, uniforms, textureUnit } = s;
    gl.useProgram(s.program);
    gl.uniform1i(uniforms.uTex, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureUnit);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);

    gl.uniform2f(uniforms.uTextSize, texture.width, texture.height);
    gl.uniform2f(uniforms.uOrigin, origin.x, origin.y);
    gl.uniform2f(uniforms.uPanel, width, height);
    gl.uniform1f(uniforms.uStrength, strength);
    gl.uniform1f(uniforms.uBlur, blur);
    gl.uniform1f(uniforms.uRim, rim);
    gl.uniform1f(uniforms.uTint, tint);
    gl.uniform3f(uniforms.uTintColor, tintColor[0], tintColor[1], tintColor[2]);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, [texture, origin, width, height, strength, blur, rim, tint, tintColor]);

  return <canvas ref={canvasRef} className={className} style={{ width: `${width}px`, height: `${height}px` }} />;
}
