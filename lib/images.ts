import data from './images.json';

export type ImgSet = { width: number; height: number; srcs: { w: number; src: string }[] };
type Manifest = { portada: ImgSet | null; logo: ImgSet | null; favicon: boolean; products: Record<string, ImgSet> };

export const IMAGES = data as Manifest;

export function srcSet(set: ImgSet) {
  return set.srcs.map((s) => `${s.src} ${s.w}w`).join(', ');
}
export function largest(set: ImgSet) {
  return set.srcs[set.srcs.length - 1].src;
}
