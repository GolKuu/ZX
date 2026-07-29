"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[869],{3617:(e,t,a)=>{a.d(t,{o:()=>n});var r=a(5339);class n{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}new r.qUd(-1,1,1,-1,0,1);class o extends r.LoY{constructor(){super(),this.setAttribute("position",new r.qtW([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new r.qtW([0,2,0,0,2,0],2))}}new o},8381:(e,t,a)=>{a.d(t,{mK:()=>_,UN:()=>S,E8:()=>P,s0:()=>g,Tl:()=>R,jW:()=>z,Jp:()=>C,bt:()=>E,fE:()=>A});var r=a(5155),n=a(2115),o=a(5339),i=a(3388),s=a(3303);function l(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}new o.I9Y,new o.I9Y;function f(e,t){if(!(e instanceof t))throw TypeError("Cannot call a class as a function")}var u=function e(t,a,r){var n=this;f(this,e),l(this,"dot2",function(e,t){return n.x*e+n.y*t}),l(this,"dot3",function(e,t,a){return n.x*e+n.y*t+n.z*a}),this.x=t,this.y=a,this.z=r},c=[new u(1,1,0),new u(-1,1,0),new u(1,-1,0),new u(-1,-1,0),new u(1,0,1),new u(-1,0,1),new u(1,0,-1),new u(-1,0,-1),new u(0,1,1),new u(0,-1,1),new u(0,1,-1),new u(0,-1,-1)],d=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],p=Array(512),m=Array(512);!function(e){e>0&&e<1&&(e*=65536),(e=Math.floor(e))<256&&(e|=e<<8);for(var t,a=0;a<256;a++)t=1&a?d[a]^255&e:d[a]^e>>8&255,p[a]=p[a+256]=t,m[a]=m[a+256]=c[t%12]}(0);function h(e){var t=function(e){if("number"==typeof e)e=Math.abs(e);else if("string"==typeof e){var t=e;e=0;for(var a=0;a<t.length;a++)e=(e+(a+1)*(t.charCodeAt(a)%96))%0x7fffffff}return 0===e&&(e=311),e}(e);return function(){var e=48271*t%0x7fffffff;return t=e,e/0x7fffffff}}new function e(t){var a=this;f(this,e),l(this,"seed",0),l(this,"init",function(e){a.seed=e,a.value=h(e)}),l(this,"value",h(this.seed)),this.init(t)}(Math.random());o.LoY;var v=a(1948);let b=(0,n.createContext)(null),w=e=>(2&e.getAttributes())==2,g=(0,n.memo)((0,n.forwardRef)(({children:e,camera:t,scene:a,resolutionScale:l,enabled:f=!0,renderPriority:u=1,autoClear:c=!0,depthBuffer:d,enableNormalPass:p,stencilBuffer:m,multisampling:h=8,frameBufferType:v=o.ix0},g)=>{let{gl:x,scene:y,camera:M,size:_}=(0,i.C)(),S=a||y,P=t||M,[R,C,j]=(0,n.useMemo)(()=>{let e=new s.s0(x,{depthBuffer:d,stencilBuffer:m,multisampling:h,frameBufferType:v});e.addPass(new s.AH(S,P));let t=null,a=null;return p&&((a=new s.Xe(S,P)).enabled=!1,e.addPass(a),void 0!==l&&((t=new s.SP({normalBuffer:a.texture,resolutionScale:l})).enabled=!1,e.addPass(t))),[e,a,t]},[P,x,d,m,h,v,S,p,l]);(0,n.useEffect)(()=>R?.setSize(_.width,_.height),[R,_]),(0,i.D)((e,t)=>{if(f){let e=x.autoClear;x.autoClear=c,m&&!c&&x.clearStencil(),R.render(t),x.autoClear=e}},f?u:0);let E=(0,n.useRef)(null);(0,n.useLayoutEffect)(()=>{let e=[],t=E.current.__r3f;if(t&&R){let a=t.children;for(let t=0;t<a.length;t++){let r=a[t].object;if(r instanceof s.Mj){let n=[r];if(!w(r)){let e=null;for(;(e=a[t+1]?.object)instanceof s.Mj&&!w(e);)n.push(e),t++}let o=new s.Vu(P,...n);e.push(o)}else r instanceof s.oF&&e.push(r)}for(let t of e)R?.addPass(t);C&&(C.enabled=!0),j&&(j.enabled=!0)}return()=>{for(let t of e)R?.removePass(t);C&&(C.enabled=!1),j&&(j.enabled=!1)}},[R,e,P,C,j]),(0,n.useEffect)(()=>{let e=x.toneMapping;return x.toneMapping=o.y_p,()=>{x.toneMapping=e}},[x]);let A=(0,n.useMemo)(()=>({composer:R,normalPass:C,downSamplingPass:j,resolutionScale:l,camera:P,scene:S}),[R,C,j,l,P,S]);return(0,n.useImperativeHandle)(g,()=>R,[R]),(0,r.jsx)(b.Provider,{value:A,children:(0,r.jsx)("group",{ref:E,children:e})})})),x=0,y=new WeakMap,M=(e,t)=>function({blendFunction:a=t?.blendFunction,opacity:o=t?.opacity,...s}){let l=y.get(e);if(!l){let t=`@react-three/postprocessing/${e.name}-${x++}`;(0,i.e)({[t]:e}),y.set(e,l=t)}let f=(0,i.C)(e=>e.camera),u=n.useMemo(()=>[...t?.args??[],...s.args??[{...t,...s}]],[JSON.stringify(s)]);return(0,r.jsx)(l,{camera:f,"blendMode-blendFunction":a,"blendMode-opacity-value":o,...s,args:u})};s.Mj;let _=M(s.bv,{blendFunction:0}),S=M(s.lq),P=M(s.t$),R=M(s.Ql),C=(s.i,s.hH,M(s.eF));var j=(e=>(e[e.Linear=0]="Linear",e[e.Radial=1]="Radial",e[e.MirroredLinear=2]="MirroredLinear",e))(j||{});s.Mj;let E=M(s.i4),A=M(s.K1),T=(s.To,{fragmentShader:`

    // original shader by Evan Wallace

    #define MAX_ITERATIONS 100

    uniform float blur;
    uniform float taper;
    uniform vec2 start;
    uniform vec2 end;
    uniform vec2 direction;
    uniform int samples;

    float random(vec3 scale, float seed) {
        /* use the fragment position for a different seed per-pixel */
        return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
    }

    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec4 color = vec4(0.0);
        float total = 0.0;
        vec2 startPixel = vec2(start.x * resolution.x, start.y * resolution.y);
        vec2 endPixel = vec2(end.x * resolution.x, end.y * resolution.y);
        float f_samples = float(samples);
        float half_samples = f_samples / 2.0;

        // use screen diagonal to normalize blur radii
        float maxScreenDistance = distance(vec2(0.0), resolution); // diagonal distance
        float gradientRadius = taper * (maxScreenDistance);
        float blurRadius = blur * (maxScreenDistance / 16.0);

        /* randomize the lookup values to hide the fixed number of samples */
        float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
        vec2 normal = normalize(vec2(startPixel.y - endPixel.y, endPixel.x - startPixel.x));
        float radius = smoothstep(0.0, 1.0, abs(dot(uv * resolution - startPixel, normal)) / gradientRadius) * blurRadius;

        #pragma unroll_loop_start
        for (int i = 0; i <= MAX_ITERATIONS; i++) {
            if (i >= samples) { break; } // return early if over sample count
            float f_i = float(i);
            float s_i = -half_samples + f_i;
            float percent = (s_i + offset - 0.5) / half_samples;
            float weight = 1.0 - abs(percent);
            vec4 sample_i = texture2D(inputBuffer, uv + normalize(direction) / resolution * percent * radius);
            /* switch to pre-multiplied alpha to correctly blur transparent images */
            sample_i.rgb *= sample_i.a;
            color += sample_i * weight;
            total += weight;
        }
        #pragma unroll_loop_end

        outputColor = color / total;

        /* switch back from pre-multiplied alpha */
        outputColor.rgb /= outputColor.a + 0.00001;
    }
    `});s.Mj;s.Mj;s.Mj;let z=(0,n.forwardRef)(({halfRes:e,screenSpaceRadius:t,quality:a,depthAwareUpsampling:o=!0,aoRadius:s=5,aoSamples:l=16,denoiseSamples:f=4,denoiseRadius:u=12,distanceFalloff:c=1,intensity:d=1,color:p,renderMode:m=0},h)=>{let{camera:b,scene:w}=(0,i.C)(),g=(0,n.useMemo)(()=>new v.ae(w,b),[b,w]);return(0,n.useLayoutEffect)(()=>{(0,i.s)(g.configuration,{color:p,aoRadius:s,distanceFalloff:c,intensity:d,aoSamples:l,denoiseSamples:f,denoiseRadius:u,screenSpaceRadius:t,renderMode:m,halfRes:e,depthAwareUpsampling:o})},[t,p,s,c,d,l,f,u,m,e,o,g]),(0,n.useLayoutEffect)(()=>{a&&g.setQualityMode(a.charAt(0).toUpperCase()+a.slice(1))},[g,a]),(0,r.jsx)("primitive",{ref:h,object:g})})}}]);