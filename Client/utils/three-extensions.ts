// utils/three-extensions.ts
import { extend } from '@react-three/fiber';
import { 
  TextGeometry,
  FontLoader,
} from 'three/examples/jsm/Addons.js';

// Extensions Three.js nécessaires
extend({ 
  TextGeometry,
  // Ajoutez d'autres extensions si nécessaire
});

declare global {
  namespace JSX {
    interface IntrinsicElements {
      textGeometry: any;
    }
  }
}

export const setupThreeExtensions = () => {
  // Initialisation supplémentaire si nécessaire
};