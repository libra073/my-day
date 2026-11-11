import React from 'react';

/**
 * LiquidAtmosphericCanvas
 *
 * The optical environment that every glass surface transmits.
 *
 * Liquid Glass only reads as glass when there is real, high-frequency colour
 * behind it: a flat gradient blurs into flat plastic no matter how many
 * specular rims you stack on top. So this layer paints a soft-focus
 * photographic field (heavily blurred, colour-graded) plus a few large
 * luminous blooms, fixed to the viewport so the parallax of the glass reads
 * correctly while scrolling.
 */
export default function LiquidAtmosphericCanvas() {
  return (
    <div className="lg-atmosphere" aria-hidden="true">
      <div className="lg-atmosphere__wash" />
      <div className="lg-atmosphere__ribbon lg-atmosphere__ribbon--a" />
      <div className="lg-atmosphere__ribbon lg-atmosphere__ribbon--b" />
      <div className="lg-atmosphere__bloom lg-atmosphere__bloom--sun" />
      <div className="lg-atmosphere__bloom lg-atmosphere__bloom--cyan" />
      <div className="lg-atmosphere__bloom lg-atmosphere__bloom--sapphire" />
      <div className="lg-atmosphere__bloom lg-atmosphere__bloom--rose" />
      <div className="lg-atmosphere__grain" />
    </div>
  );
}
