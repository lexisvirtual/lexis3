import React from 'react';
import activeTheme from '../data/cee/active-theme.json';

const WebGLBackground = ({ opacity = 1, parallax = 0 }) => {
    const canvasRef = React.useRef(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl');
        if (!gl) return;

        const vs = `
            attribute vec2 position;
            void main() { gl_Position = vec4(position, 0.0, 1.0); }
        `;

        const fs = `
            precision highp float;
            uniform float u_time;
            uniform float u_parallax;
            uniform vec2 u_resolution;
            uniform float u_opacity;
            uniform float u_intensity;
            uniform int u_geometry;
            uniform int u_axis;

            float noise(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }

            float smoothNoise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                float a = noise(i);
                float b = noise(i + vec2(1.0, 0.0));
                float c = noise(i + vec2(0.0, 1.0));
                float d = noise(i + vec2(1.0, 1.0));
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                float t = u_time * 0.14;
                float p = u_parallax * 0.01;
                
                vec2 motion = vec2(0.0);
                if (u_axis == 1) motion.y = t;
                else if (u_axis == 2) motion.x = t;
                else if (u_axis == 3) motion = uv * p;

                float n = 0.0;
                if (u_geometry == 1) n = smoothNoise(vec2(uv.x * 0.8, t)); 
                else if (u_geometry == 2) n = smoothNoise(vec2(uv.x + uv.y + t));
                else if (u_geometry == 3) n = noise(uv + t);
                else n = smoothNoise(uv * 1.5 + t + motion);

                // Nível 30: Base discreta e sóbria
                vec3 color1 = vec3(0.04, 0.07, 0.13); // Deep Lexis Blue (mais escuro)
                vec3 color2 = vec3(0.01, 0.01, 0.03); // Foundation Black
                vec3 accent = vec3(1.0, 0.84, 0.35);  // Pure Gold Accent
                
                vec3 base = mix(color1, color2, n * 0.8);
                
                // Ana v30: Glow contido e sutil
                float glow = pow(n, 3.5) * u_intensity * 1.2; 
                base = mix(base, accent * 0.7, clamp(glow, 0.0, 0.6));
                
                // Micro-Noise reduzido
                float mNoise = noise(uv * 500.0) * 0.006;
                base += mNoise;

                gl_FragColor = vec4(base, u_opacity * 0.4);
            }
        `;

        const createShader = (gl, type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        };

        const program = gl.createProgram();
        gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vs));
        gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(program);
        gl.useProgram(program);

        const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const posAttr = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(posAttr);
        gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

        const u = {
            time: gl.getUniformLocation(program, 'u_time'),
            para: gl.getUniformLocation(program, 'u_parallax'),
            res: gl.getUniformLocation(program, 'u_resolution'),
            opac: gl.getUniformLocation(program, 'u_opacity'),
            intens: gl.getUniformLocation(program, 'u_intensity'),
            geom: gl.getUniformLocation(program, 'u_geometry'),
            axis: gl.getUniformLocation(program, 'u_axis')
        };

        const geomMap = { mesh: 0, linear: 1, diagonal: 2, noise: 3 };
        const axisMap = { static: 0, vertical: 1, horizontal: 2, depth: 3 };

        const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let lastFrame = 0;
        const render = (time) => {
            if (isReduced && lastFrame > 0) return;
            if (time - lastFrame < 33) { requestAnimationFrame(render); return; }
            lastFrame = time;

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);

            gl.uniform1f(u.time, isReduced ? 0.0 : time * 0.001);
            gl.uniform1f(u.para, isReduced ? 0.0 : parallax);
            gl.uniform2f(u.res, canvas.width, canvas.height);
            gl.uniform1f(u.opac, opacity);
            gl.uniform1f(u.intens, activeTheme.intensity || 0.02);
            gl.uniform1i(u.geom, geomMap[activeTheme.geometry_language] || 0);
            gl.uniform1i(u.axis, axisMap[activeTheme.movement_axis] || 0);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            if (!isReduced) requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }, [opacity, parallax]);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

export default WebGLBackground;
