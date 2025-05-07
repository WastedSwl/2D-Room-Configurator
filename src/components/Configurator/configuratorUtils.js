// src/components/Configurator/configuratorUtils.js

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
