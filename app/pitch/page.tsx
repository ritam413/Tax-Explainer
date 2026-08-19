import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pitch Deck | Tx Expliner — Hackonomics 2027',
  description: 'Official Hackonomics 2027 Pitch Deck presentation for Tx Expliner / FiscalQuant.',
};

export default function PitchPage() {
  return (
    <div className="w-full h-screen bg-black overflow-hidden flex flex-col">
      <iframe
        src="/pitch_deck.html"
        className="w-full h-full border-0"
        title="Tx Expliner Pitch Deck"
      />
    </div>
  );
}
