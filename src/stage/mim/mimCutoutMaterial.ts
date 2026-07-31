import {
  DoubleSide,
  ShaderMaterial,
  Texture,
} from 'three';

export function createMimCutoutMaterial(
  texture: Texture,
  detailScale = 1,
): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      map: { value: texture },
      detailScale: { value: detailScale },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      uniform float detailScale;
      varying vec2 vUv;

      void main() {
        vec4 source = texture2D(map, vUv);
        if (source.a < 0.08) discard;

        float lightness = dot(source.rgb, vec3(0.2126, 0.7152, 0.0722));
        float oldCyan = smoothstep(
          0.05,
          0.42,
          source.b + source.g * 0.55 - source.r * 1.15
        );
        vec3 ink = vec3(0.035, 0.032, 0.047);
        vec3 plum = vec3(0.19, 0.12, 0.17);
        vec3 bone = vec3(0.91, 0.82, 0.67);
        vec3 vermilion = vec3(0.72, 0.12, 0.09);
        vec3 fabric = mix(ink, plum, smoothstep(0.12, 0.48, lightness));
        vec3 colour = mix(fabric, bone, smoothstep(0.58, 0.9, lightness));
        colour = mix(colour, vermilion, oldCyan);

        vec2 weaveUv = vUv * vec2(92.0, 128.0) * detailScale;
        float warp = step(0.78, fract(weaveUv.x)) * 0.035;
        float weft = step(0.86, fract(weaveUv.y)) * 0.025;
        float paperGrain = sin((vUv.x + vUv.y) * 310.0) * 0.012;
        colour += vec3(warp - weft + paperGrain);

        float edgeInk = smoothstep(0.18, 0.72, source.a);
        colour *= mix(0.62, 1.0, edgeInk);
        gl_FragColor = vec4(colour, source.a);
      }
    `,
    alphaTest: 0.08,
    depthWrite: true,
    side: DoubleSide,
    transparent: true,
  });
}
