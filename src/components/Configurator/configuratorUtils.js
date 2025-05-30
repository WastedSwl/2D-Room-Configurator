// ==== src\components\Configurator\configuratorUtils.js ====
// src/components/Configurator/configuratorUtils.js

// Добавляем generateId сюда
export const generateId = (prefix = "id_") =>
    `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`;
  
  export function dotProduct(v1, v2) { return v1.x * v2.x + v1.y * v2.y; }
  export function subtractVectors(v1, v2) { return { x: v1.x - v2.x, y: v1.y - v2.y }; }
  export function normalizeVector(v) { 
      const len = Math.sqrt(v.x*v.x + v.y*v.y); 
      if (len === 0) return {x: 0, y: 0};
      return {x: v.x/len, y: v.y/len}; 
  }
  export function perpendicularVector(v) { return {x: -v.y, y: v.x }; }
  
  export function getModuleVertices(module) {
      const w = module.width;
      const h = module.height;
      const x = module.x;
      const y = module.y;
      const angleRad = (module.rotation || 0) * Math.PI / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      const centerX = x + w / 2;
      const centerY = y + h / 2;
      const cornersRelativeToOrigin = [
          { x: -w / 2, y: -h / 2 }, // Top-Left
          { x:  w / 2, y: -h / 2 }, // Top-Right
          { x:  w / 2, y:  h / 2 }, // Bottom-Right
          { x: -w / 2, y:  h / 2 }  // Bottom-Left
      ];
      return cornersRelativeToOrigin.map(corner => {
          const rotatedX = corner.x * cos - corner.y * sin;
          const rotatedY = corner.x * sin + corner.y * cos;
          return { x: centerX + rotatedX, y: centerY + rotatedY };
      });
  }
  
  export function projectPolygonOntoAxis(axis, vertices) {
      let min = dotProduct(axis, vertices[0]);
      let max = min;
      for (let i = 1; i < vertices.length; i++) {
          const p = dotProduct(axis, vertices[i]);
          if (p < min) {
              min = p;
          } else if (p > max) {
              max = p;
          }
      }
      return { min, max };
  }
  
  export function checkOverlapWithRotation(moduleA, moduleB) {
      if (!moduleA || !moduleB || moduleA.id === moduleB.id) return false;
      const rotationA = moduleA.rotation || 0;
      const rotationB = moduleB.rotation || 0;
      if (rotationA % 360 === 0 && rotationB % 360 === 0) {
        const ax1 = moduleA.x;
        const ay1 = moduleA.y;
        const ax2 = moduleA.x + moduleA.width;
        const ay2 = moduleA.y + moduleA.height;
        const bx1 = moduleB.x;
        const by1 = moduleB.y;
        const bx2 = moduleB.x + moduleB.width;
        const by2 = moduleB.y + moduleB.height;
        if (ax2 <= bx1 || ax1 >= bx2 || ay2 <= by1 || ay1 >= by2) return false;
        return true;
      }
      const verticesA = getModuleVertices(moduleA);
      const verticesB = getModuleVertices(moduleB);
      const axes = [];
      for (let i = 0; i < verticesA.length; i++) {
          const p1 = verticesA[i];
          const p2 = verticesA[(i + 1) % verticesA.length];
          const edge = subtractVectors(p2, p1);
          axes.push(normalizeVector(perpendicularVector(edge)));
      }
      for (let i = 0; i < verticesB.length; i++) {
          const p1 = verticesB[i];
          const p2 = verticesB[(i + 1) % verticesB.length];
          const edge = subtractVectors(p2, p1);
          axes.push(normalizeVector(perpendicularVector(edge)));
      }
      for (const axis of axes) {
          if (axis.x === 0 && axis.y === 0) continue; 
          const projA = projectPolygonOntoAxis(axis, verticesA);
          const projB = projectPolygonOntoAxis(axis, verticesB);
          if (projA.max < projB.min || projB.max < projA.min) {
              return false; 
          }
      }
      return true; 
  }
  
  export function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  export function rotatePoint(point, center, angleDegrees) {
      const angleRad = angleDegrees * Math.PI / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      const translatedX = point.x - center.x;
      const translatedY = point.y - center.y;
      const rotatedX = translatedX * cos - translatedY * sin;
      const rotatedY = translatedX * sin + translatedY * cos;
      return {
          x: rotatedX + center.x,
          y: rotatedY + center.y,
      };
  }
  
  export function getLocalCoordinates(worldX, worldY, module) {
      const moduleCenterX = module.x + module.width / 2;
      const moduleCenterY = module.y + module.height / 2;
      const translatedWorldX = worldX - moduleCenterX;
      const translatedWorldY = worldY - moduleCenterY;
      const angleRad = -(module.rotation || 0) * Math.PI / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      const unrotatedX = translatedWorldX * cos - translatedWorldY * sin;
      const unrotatedY = translatedWorldX * sin + translatedWorldY * cos;
      const localX = unrotatedX + module.width / 2;
      const localY = unrotatedY + module.height / 2;
      return { x: localX, y: localY };
  }