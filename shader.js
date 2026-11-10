const SHADERTOY_SOURCE = `const vec3 top = vec3(0.318, 0.831, 1.0);
const vec3 bottom = vec3(0.094, 0.141, 0.424);
const float widthFactor = 1.5;

vec3 calcSine(vec2 uv, float speed,
              float frequency, float amplitude, float shift, float offset,
              vec3 color, float width, float exponent, bool dir)
{
    float angle = iTime * speed * frequency * -1.0 + (shift + uv.x) * 2.0;

    float y = sin(angle) * amplitude + offset;
    float clampY = clamp(0.0, y, y);
    float diffY = y - uv.y;

    float dsqr = distance(y, uv.y);
    float scale = 1.0;

    if(dir && diffY > 0.0)
    {
        dsqr = dsqr * 4.0;
    }
    else if(!dir && diffY < 0.0)
    {
        dsqr = dsqr * 4.0;
    }

    scale = pow(smoothstep(width * widthFactor, 0.0, dsqr), exponent);

    return min(color * scale, color);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec3 color = vec3(mix(bottom, top, uv.y));

    color += calcSine(uv, 0.2, 0.20, 0.2, 0.0, 0.5,  vec3(0.3, 0.3, 0.3), 0.1, 15.0,false);
    color += calcSine(uv, 0.4, 0.40, 0.15, 0.0, 0.5, vec3(0.3, 0.3, 0.3), 0.1, 17.0,false);
    color += calcSine(uv, 0.3, 0.60, 0.15, 0.0, 0.5, vec3(0.3, 0.3, 0.3), 0.05, 23.0,false);

    color += calcSine(uv, 0.1, 0.26, 0.07, 0.0, 0.3, vec3(0.3, 0.3, 0.3), 0.1, 17.0,true);
    color += calcSine(uv, 0.3, 0.36, 0.07, 0.0, 0.3, vec3(0.3, 0.3, 0.3), 0.1, 17.0,true);
    color += calcSine(uv, 0.5, 0.46, 0.07, 0.0, 0.3, vec3(0.3, 0.3, 0.3), 0.05, 23.0,true);
    color += calcSine(uv, 0.2, 0.58, 0.05, 0.0, 0.3, vec3(0.3, 0.3, 0.3), 0.2, 15.0,true);

    fragColor = vec4(color,1.0);
}`;

(() => {
  const canvas = document.getElementById('stage-bg');
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) return; // the CSS gradient on .stage stays as the fallback
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const frag = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec3 iResolution;
uniform float iTime;
${SHADERTOY_SOURCE}
void main() { vec4 c; mainImage(c, gl_FragCoord.xy); gl_FragColor = vec4(c.rgb * 0.9, 1.0); }`;
  const vert = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'iResolution');
  const uTime = gl.getUniformLocation(prog, 'iTime');

  function resize() {
    // Soft waves do not need full resolution, so render at about 75 percent for speed
    const q = Math.min(window.devicePixelRatio || 1, 1.25) * 0.75;
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.max(2, Math.round(r.width * q));
    canvas.height = Math.max(2, Math.round(r.height * q));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function frame(ms) {
    gl.uniform3f(uRes, canvas.width, canvas.height, 1);
    gl.uniform1f(uTime, still ? 20 : ms / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!still) requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();
