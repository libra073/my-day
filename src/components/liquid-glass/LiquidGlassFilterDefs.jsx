import React from 'react';

/**
 * LiquidGlassFilterDefs
 * Hardware-accelerated Multi-Stage SVG Optical Shaders for WebKit/Blink backdrop-filter:
 * 1. #liquid-glass-refract - Crown-glass displacement + prismatic R/Cyan chromatic dispersion + optical diffusion + saturation
 * 2. #liquid-smoked-refract - Deep meniscus popover refraction + prismatic dispersion + dense frosted diffusion
 * 3. #liquid-refraction - Legacy alias
 * 4. #liquid-chromatic-bloom - Prismatic chromatic dispersion
 * 5. #liquid-specular-light - Surface normal specular glint
 */
export default function LiquidGlassFilterDefs() {
  return (
    <svg
      width="10"
      height="10"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -100,
      }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* 1. Primary Crown-Glass Optical Refraction + Prismatic Chromatic Dispersion + Diffusion */}
        <filter
          id="liquid-glass-refract"
          x="-15%"
          y="-15%"
          width="130%"
          height="130%"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.013"
            numOctaves="2"
            seed="14"
            result="lensWave"
          />
          <feGaussianBlur in="lensWave" stdDeviation="6" result="smoothLens" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="smoothLens"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
            result="refracted"
          />
          {/* Sub-pixel Prismatic Chromatic Dispersion (R/Cyan Optical Split) */}
          <feColorMatrix
            in="refracted"
            type="matrix"
            values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="rChan"
          />
          <feOffset in="rChan" dx="1.1" dy="-0.5" result="rShift" />
          <feColorMatrix
            in="refracted"
            type="matrix"
            values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
            result="gbChan"
          />
          <feOffset in="gbChan" dx="-1.1" dy="0.5" result="gbShift" />
          <feBlend in="rShift" in2="gbShift" mode="screen" result="dispersed" />
          {/* Optical Diffusion + Vivid Saturation (edgeMode="duplicate" prevents dark edge bleed) */}
          <feGaussianBlur in="dispersed" stdDeviation="15" edgeMode="duplicate" result="diffused" />
          <feColorMatrix
            in="diffused"
            type="saturate"
            values="1.95"
            result="saturatedGlass"
          />
        </filter>

        {/* 1B. Clear Crystal Optical Refraction (High-Clarity Light Transmission + Lens Bending) */}
        <filter
          id="liquid-crystal-refract"
          x="-15%"
          y="-15%"
          width="130%"
          height="130%"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.009 0.015"
            numOctaves="2"
            seed="19"
            result="crystalWave"
          />
          <feGaussianBlur in="crystalWave" stdDeviation="5" result="smoothCrystal" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="smoothCrystal"
            scale="20"
            xChannelSelector="R"
            yChannelSelector="G"
            result="refractedCrystal"
          />
          <feColorMatrix
            in="refractedCrystal"
            type="matrix"
            values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="rCrystal"
          />
          <feOffset in="rCrystal" dx="0.9" dy="-0.4" result="rCrystalShift" />
          <feColorMatrix
            in="refractedCrystal"
            type="matrix"
            values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
            result="gbCrystal"
          />
          <feOffset in="gbCrystal" dx="-0.9" dy="0.4" result="gbCrystalShift" />
          <feBlend in="rCrystalShift" in2="gbCrystalShift" mode="screen" result="dispersedCrystal" />
          <feGaussianBlur in="dispersedCrystal" stdDeviation="8.5" edgeMode="duplicate" result="diffusedCrystal" />
          <feColorMatrix
            in="diffusedCrystal"
            type="saturate"
            values="2.05"
            result="saturatedCrystal"
          />
        </filter>

        {/* 2. High-Index Smoked Crystal Refraction + Prismatic Dispersion for Popovers & Floating Bars */}
        <filter
          id="liquid-smoked-refract"
          x="-18%"
          y="-18%"
          width="136%"
          height="136%"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.011 0.017"
            numOctaves="2"
            seed="27"
            result="popoverWave"
          />
          <feGaussianBlur in="popoverWave" stdDeviation="5" result="smoothPopover" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="smoothPopover"
            scale="24"
            xChannelSelector="R"
            yChannelSelector="G"
            result="refractedPopover"
          />
          {/* Prismatic Chromatic Dispersion */}
          <feColorMatrix
            in="refractedPopover"
            type="matrix"
            values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="popR"
          />
          <feOffset in="popR" dx="1.4" dy="-0.6" result="popRShift" />
          <feColorMatrix
            in="refractedPopover"
            type="matrix"
            values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
            result="popGB"
          />
          <feOffset in="popGB" dx="-1.4" dy="0.6" result="popGBShift" />
          <feBlend in="popRShift" in2="popGBShift" mode="screen" result="popDispersed" />
          <feGaussianBlur in="popDispersed" stdDeviation="20" edgeMode="duplicate" result="diffusedPopover" />
          <feColorMatrix
            in="diffusedPopover"
            type="saturate"
            values="2.15"
            result="saturatedPopover"
          />
        </filter>

        {/* 3. Subtle optical refraction displacement map */}
        <filter
          id="liquid-refraction"
          x="-15%"
          y="-15%"
          width="130%"
          height="130%"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.04" numOctaves="2" seed="42" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="3" result="smoothNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="smoothNoise"
            scale="12"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
        </filter>

        {/* 4. Chromatic aberration fringe for edge caustics */}
        <filter id="liquid-chromatic-bloom" x="-20%" y="-20%" width="140%" height="140%">
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="red"
          />
          <feOffset in="red" dx="1.2" dy="0" result="redOffset" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
            result="cyan"
          />
          <feOffset in="cyan" dx="-1.2" dy="0" result="cyanOffset" />
          <feBlend in="redOffset" in2="cyanOffset" mode="screen" />
        </filter>

        {/* 5. Specular glass surface normal lighting */}
        <filter id="liquid-specular-light" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="3"
            specularConstant="1.2"
            specularExponent="20"
            lightingColor="#ffffff"
            result="specOut"
          >
            <fePointLight x="-50" y="-100" z="200" />
          </feSpecularLighting>
          <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specular" />
          <feComposite in="SourceGraphic" in2="specular" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}
