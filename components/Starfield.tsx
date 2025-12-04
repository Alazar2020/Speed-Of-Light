import React, { useRef, useEffect } from 'react';
import { C } from '../constants';
import { Star } from '../types';

interface StarfieldProps {
  velocity: number; // m/s
}

const STAR_COUNT = 800;
const FOV = 60 * (Math.PI / 180);

const Starfield: React.FC<StarfieldProps> = ({ velocity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Mutable state for animation loop to avoid react re-render cycle in tight loop
  const starsRef = useRef<Star[]>([]);
  const requestRef = useRef<number>();

  // Initialize Stars
  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 2000,
        baseColor: {
            r: 200 + Math.random() * 55, 
            g: 200 + Math.random() * 55, 
            b: 255 
        },
        size: Math.random() * 1.5 + 0.5
      });
    }
    starsRef.current = stars;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const beta = velocity / C;
    const gamma = 1 / Math.sqrt(1 - beta * beta);

    // Resize handler
    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const animate = () => {
      // Clear
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Shake effect at low speeds (atmospheric turbulence)
      let offsetX = 0;
      let offsetY = 0;
      if (velocity > 10 && velocity < 1200) { // Shake peak around sound barrier
         const intensity = velocity < 343 ? (velocity / 343) * 5 : (1200 - velocity) / 857 * 5;
         if (intensity > 0) {
             offsetX = (Math.random() - 0.5) * intensity;
             offsetY = (Math.random() - 0.5) * intensity;
         }
      }

      ctx.save();
      ctx.translate(cx + offsetX, cy + offsetY);

      starsRef.current.forEach(star => {
        // Move star towards viewer based on velocity (pseudo-movement for effect)
        // At high speeds, we don't just move Z, we aberration deform.
        // For the visual loop, we cycle Z.
        let speedFactor = 2 + (velocity / C) * 100; // Visual speed scaling
        if (speedFactor > 50) speedFactor = 50; // Cap visual flow speed so we can see aberration
        
        star.z -= speedFactor; 
        if (star.z <= 1) {
          star.z = 2000;
          star.x = (Math.random() - 0.5) * 2000;
          star.y = (Math.random() - 0.5) * 2000;
        }

        // Relativistic Aberration (Searchlight Effect)
        // 1. Calculate angle relative to direction of motion (Z axis)
        const r = Math.sqrt(star.x * star.x + star.y * star.y + star.z * star.z);
        const cosTheta = star.z / r;
        
        // 2. Apply aberration formula
        // cos(theta') = (cos(theta) + beta) / (1 + beta * cos(theta))
        const cosThetaPrime = (cosTheta + beta) / (1 + beta * cosTheta);
        const sinThetaPrime = Math.sqrt(Math.max(0, 1 - cosThetaPrime * cosThetaPrime));
        
        // 3. Reconstruct position from new angle (projected onto sphere, then to plane)
        // We preserve the azimuth angle (phi) around the Z axis
        const phi = Math.atan2(star.y, star.x);
        
        // New projected coordinates on the unit sphere
        // z' = cosThetaPrime, x' = sinThetaPrime * cosPhi, y' = sinThetaPrime * sinPhi
        // For 3D projection: screenX = x' / z', screenY = y' / z'
        
        // Avoid divide by zero for stars exactly at 90 deg or behind
        // Relativistic beaming concentrates stars forward, so z' approaches 1
        
        // To visualize on 2D canvas, we map spherical coordinates to screen
        // Standard perspective projection: 
        // distance from center ~ tan(theta') 
        
        const thetaPrime = Math.acos(cosThetaPrime);
        const tanThetaPrime = Math.tan(thetaPrime);
        
        // Screen projection scaling
        const scale = canvas.height; 
        const sx = Math.cos(phi) * tanThetaPrime * scale;
        const sy = Math.sin(phi) * tanThetaPrime * scale;

        // Doppler Shift (Color)
        // Doppler factor D = 1 / (gamma * (1 - beta * cosTheta))
        const doppler = 1 / (gamma * (1 - beta * cosTheta));
        
        // Simple redshift/blueshift approximation
        // D > 1 = Blue/Violet/UV (Brighter, whiter, then invisible if extreme)
        // D < 1 = Red/IR (Dimmer, redder, then invisible)
        
        let rVal = star.baseColor.r;
        let gVal = star.baseColor.g;
        let bVal = star.baseColor.b;
        let alpha = 1;

        if (doppler > 1.05) {
            // Blueshift
            rVal *= (1/doppler);
            gVal *= (1/doppler); // shift towards blue/white
            bVal = 255;
            // Intensity boost (searchlight effect brightness)
            alpha = Math.min(1, doppler * 0.8); 
        } else if (doppler < 0.95) {
            // Redshift
            bVal *= doppler;
            gVal *= doppler;
            rVal = 255;
            alpha = Math.max(0, doppler); // Fade out if too redshifted
        }

        // The Asymptote Whiteout
        if (beta > 0.999) {
            const whiteout = (beta - 0.999) / (1 - 0.999);
            rVal = 255; gVal = 255; bVal = 255;
            alpha = 1;
            ctx.globalCompositeOperation = 'lighter';
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }

        if (star.z > 0 && alpha > 0.01) {
          ctx.fillStyle = `rgba(${Math.floor(rVal)}, ${Math.floor(gVal)}, ${Math.floor(bVal)}, ${alpha})`;
          const size = star.size * (doppler > 2 ? 2 : 1); // Bloom a bit at high speed
          ctx.beginPath();
          ctx.arc(sx, sy, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [velocity]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full z-0 block"
    />
  );
};

export default Starfield;