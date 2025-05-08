// src/components/Configurator/configuratorUtils.js
import { DOOR_LEAF_VISUAL_THICKNESS_M } from "./configuratorConstants";

// ... (rotatePoint, getAABB, checkAABBIntersection, getResizeCursorForHandle - без изменений) ...
export const rotatePoint = (point, angleRad, center) => {
  const s = Math.sin(angleRad);
  const c = Math.cos(angleRad);
  const px = point.x - center.x;
  const py = point.y - center.y;
  const xNew = px * c - py * s;
  const yNew = px * s + py * c;
  return { x: xNew + center.x, y: yNew + center.y };
};

export const getAABB = (obj) => {
  const { x, y, width, height, rotation = 0 } = obj;
  const angleRad = (rotation * Math.PI) / 180;
  const localCenterX = width / 2;
  const localCenterY = height / 2;
  const worldRotCenterX = x + localCenterX;
  const worldRotCenterY = y + localCenterY;
  const center = { x: worldRotCenterX, y: worldRotCenterY };
  const corners = [
    { x: x, y: y },
    { x: x + width, y: y },
    { x: x + width, y: y + height },
    { x: x, y: y + height },
  ];
  if (rotation === 0 || rotation % 360 === 0) {
    return {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height,
      centerX: worldRotCenterX,
      centerY: worldRotCenterY,
    };
  }
  const rotatedCorners = corners.map((p) => rotatePoint(p, angleRad, center));
  const minX = Math.min(...rotatedCorners.map((p) => p.x));
  const minY = Math.min(...rotatedCorners.map((p) => p.y));
  const maxX = Math.max(...rotatedCorners.map((p) => p.x));
  const maxY = Math.max(...rotatedCorners.map((p) => p.y));
  return {
    minX,
    minY,
    maxX,
    maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
};

export const checkAABBIntersection = (aabb1, aabb2) =>
  aabb1.minX < aabb2.maxX &&
  aabb1.maxX > aabb2.minX &&
  aabb1.minY < aabb2.maxY &&
  aabb1.maxY > aabb2.minY;

export const getResizeCursorForHandle = (handleType, rotationDeg) => {
  const angle = ((rotationDeg % 360) + 360) % 360;
  let cursor = "default";
  if (["tl", "br"].includes(handleType)) cursor = "nwse-resize";
  if (["tr", "bl"].includes(handleType)) cursor = "nesw-resize";
  if (["t", "b"].includes(handleType)) cursor = "ns-resize";
  if (["l", "r"].includes(handleType)) cursor = "ew-resize";
  const rotationSegment = Math.round(angle / 45) % 8;
  if (rotationSegment === 1 || rotationSegment === 2) {
    if (cursor === "ns-resize") cursor = "nesw-resize";
    else if (cursor === "ew-resize") cursor = "nwse-resize";
    else if (cursor === "nwse-resize") cursor = "ns-resize";
    else if (cursor === "nesw-resize") cursor = "ew-resize";
  } else if (rotationSegment === 3 || rotationSegment === 4) {
    if (cursor === "ns-resize") cursor = "ew-resize";
    else if (cursor === "ew-resize") cursor = "ns-resize";
    else if (cursor === "nwse-resize") cursor = "nesw-resize";
    else if (cursor === "nesw-resize") cursor = "nwse-resize";
  } else if (rotationSegment === 5 || rotationSegment === 6) {
    if (cursor === "ns-resize") cursor = "nesw-resize";
    else if (cursor === "ew-resize") cursor = "nwse-resize";
    else if (cursor === "nwse-resize") cursor = "ns-resize";
    else if (cursor === "nesw-resize") cursor = "ew-resize";
  } else if (rotationSegment === 7) {
    if (cursor === "ns-resize") cursor = "ew-resize";
    else if (cursor === "ew-resize") cursor = "ns-resize";
    else if (cursor === "nwse-resize") cursor = "nesw-resize";
    else if (cursor === "nesw-resize") cursor = "nwse-resize";
  }
  return cursor;
};


export const getDoorLeafCorners = (door, currentOpeningAngleDegrees) => {
    const {
        x: objX, y: objY, 
        width: frameWidth, 
        height: frameThickness, 
        rotation: objRotationDeg = 0, 
        hingeSide,
        openingDirection
    } = door;

    const leafVisualThickness = DOOR_LEAF_VISUAL_THICKNESS_M; 
    const doorLeafLength = frameWidth; 

    const objRotationRad = objRotationDeg * (Math.PI / 180);

    let hingeLocalX = (hingeSide === 'left') ? 0 : frameWidth;
    let hingeLocalY = frameThickness / 2; 

    const leafCornersRelativeToHingeClosed = [
        { x: 0,                               y: -leafVisualThickness / 2 },
        { x: (hingeSide === 'left' ? doorLeafLength : -doorLeafLength), y: -leafVisualThickness / 2 },
        { x: (hingeSide === 'left' ? doorLeafLength : -doorLeafLength), y:  leafVisualThickness / 2 },
        { x: 0,                               y:  leafVisualThickness / 2 },
    ];

    let swingAngleRad = 0;
    if (currentOpeningAngleDegrees !== 0) {
        let angle = currentOpeningAngleDegrees;
        if (openingDirection === 'outward') angle *= -1;
        swingAngleRad = (hingeSide === 'left' ? angle : -angle) * (Math.PI / 180);
    }

    const cornersAfterSwing = leafCornersRelativeToHingeClosed.map(p =>
        rotatePoint(p, swingAngleRad, { x: 0, y: 0 })
    );

    const cornersInFrameLocalSpace = cornersAfterSwing.map(p => ({
        x: p.x + hingeLocalX,
        y: p.y + hingeLocalY,
    }));

    const frameRotCenterX = frameWidth / 2;
    const frameRotCenterY = frameThickness / 2;
    const cornersAfterFrameRotation = cornersInFrameLocalSpace.map(p =>
        rotatePoint(p, objRotationRad, { x: frameRotCenterX, y: frameRotCenterY })
    );

    const worldCorners = cornersAfterFrameRotation.map(p => ({
        x: p.x + objX,
        y: p.y + objY,
    }));

    return worldCorners;
};

export const getAABBFromCorners = (corners) => {
    if (!corners || corners.length < 2) return { minX: 0, minY: 0, maxX: 0, maxY: 0, centerX:0, centerY:0 };
    const minX = Math.min(...corners.map(p => p.x));
    const minY = Math.min(...corners.map(p => p.y));
    const maxX = Math.max(...corners.map(p => p.x));
    const maxY = Math.max(...corners.map(p => p.y));
    return { minX, minY, maxX, maxY, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 };
};

export const isDoorLeafColliding = (doorObj, openingAngleDegrees, allOtherObjects) => {
    if (openingAngleDegrees === 0) return false; 

    const doorLeafWorldCorners = getDoorLeafCorners(doorObj, openingAngleDegrees);
    const doorLeafAABB = getAABBFromCorners(doorLeafWorldCorners);

    for (const otherObj of allOtherObjects) {
        if (otherObj.id === doorObj.id) continue; // Don't collide with its own frame 
        
        // --- ДОБАВЛЕНА ПРОВЕРКА ---
        // Если у двери есть parentId (т.е. она прикреплена к модулю)
        // и ID другого объекта совпадает с parentId двери,
        // то пропускаем проверку столкновения с этим родительским модулем.
        if (doorObj.parentId && otherObj.id === doorObj.parentId) {
            continue; 
        }
        // --- КОНЕЦ ДОБАВЛЕННОЙ ПРОВЕРКИ ---

        const otherAABB = getAABB(otherObj); 
        
        if (checkAABBIntersection(doorLeafAABB, otherAABB)) {
            // AABB check passed, now potentially more precise checks

            // Handle door-door leaf collision
            if (otherObj.type === 'door' && otherObj.isOpen && otherObj.openingAngle > 0) {
                const otherDoorLeafCorners = getDoorLeafCorners(otherObj, otherObj.openingAngle);
                const otherDoorLeafAABB = getAABBFromCorners(otherDoorLeafCorners);
                if (checkAABBIntersection(doorLeafAABB, otherDoorLeafAABB)) {
                    // More precise check would go here (e.g., SAT)
                    console.warn(`[Collision] Door ${doorObj.id} leaf vs Door ${otherObj.id} leaf`);
                    return true; // Leaf-to-leaf collision detected by AABB for now
                }
                // Leaves don't collide based on AABB, but we already know this door's leaf AABB
                // intersects the other door's overall AABB (frame+leaf), so return true.
                // Or should we only return true on leaf-leaf? Let's stick to AABB vs AABB for now.
                 console.warn(`[Collision] Door ${doorObj.id} leaf (angle ${openingAngleDegrees}) vs ${otherObj.type} ${otherObj.id} (Frame AABB)`);
                 return true; // Collision with the other door object's bounding box
            } else {
                // Collision with a non-door or a closed door object
                 console.warn(`[Collision] Door ${doorObj.id} leaf (angle ${openingAngleDegrees}) vs ${otherObj.type} ${otherObj.id}`);
                 return true; // AABB collision is sufficient for now
            }
        }
    }
    return false; // No collisions detected
};