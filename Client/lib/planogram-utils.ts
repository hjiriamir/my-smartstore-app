import type { SceneCaptureRef } from '@/components/editor2D/planogram-editor';

export const captureGondolaViews = async (
    captureRef: React.RefObject<SceneCaptureRef>,
    onViewChange?: (view: string) => void
  ): Promise<Record<string, string>> => {
    const views: Record<string, string> = {};
    
    if (!captureRef.current) {
      console.error("captureRef not initialized");
      return views;
    }
  
    try {
      // Capture vue avant
      if (onViewChange) onViewChange('front');
      await new Promise(resolve => setTimeout(resolve, 800)); // Attendre le repositionnement
      
      views.front = await new Promise<string>((resolve) => {
        captureRef.current!((dataUrl) => {
          if (!dataUrl) {
            console.error("Failed to capture front view");
            resolve('');
          } else {
            resolve(dataUrl);
          }
        });
      });
  
      // Capture vue arrière
      if (onViewChange) onViewChange('back');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      views.back = await new Promise<string>((resolve) => {
        captureRef.current!((dataUrl) => {
          if (!dataUrl) {
            console.error("Failed to capture back view");
            resolve('');
          } else {
            resolve(dataUrl);
          }
        });
      });
  
    } catch (error) {
      console.error("Error capturing gondola views:", error);
    }
  
    return views;
  };
  
  export const captureShelvesDisplayViews = async (
    captureRef: React.RefObject<SceneCaptureRef>,
    onViewChange?: (view: string) => void
  ): Promise<Record<string, string>> => {
    const views: Record<string, string> = {};
    
    if (!captureRef.current) {
      console.error("captureRef not initialized");
      return views;
    }
  
    try {
      const viewsOrder = ['left', 'front', 'back', 'right'] as const;
      
      for (const view of viewsOrder) {
        if (onViewChange) onViewChange(view);
        await new Promise(resolve => setTimeout(resolve, 800)); // Attendre le repositionnement
        
        views[view] = await new Promise<string>((resolve) => {
          captureRef.current!((dataUrl) => {
            if (!dataUrl) {
              console.error(`Failed to capture ${view} view`);
              resolve('');
            } else {
              resolve(dataUrl);
            }
          });
        });
      }
  
    } catch (error) {
      console.error("Error capturing shelves display views:", error);
    }
  
    return views;
  };