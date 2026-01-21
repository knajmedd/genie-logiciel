# 2048 (Nuxt 3 + TypeScript + Tailwind)

Implémentation du jeu 2048 avec Nuxt 3, TypeScript et Tailwind CSS.

## Prérequis
- Node.js 18+

## Installation et lancement
```bash
cd nuxt-2048
npm install
npm run dev
```
Ouvrez http://localhost:3000

## Structure
- `pages/index.vue` : page principale (UI + contrôles clavier/tactile)
- `components/GameGrid.vue` : grille et tuiles (Tailwind)
- `composables/useGame.ts` : logique de jeu (déplacements, fusions, score, fin)
- `assets/css/tailwind.css` : styles Tailwind
- `tailwind.config.ts` : configuration Tailwind
- `nuxt.config.ts` : configuration Nuxt (module Tailwind, TS strict)


