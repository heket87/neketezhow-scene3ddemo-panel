import React from "react";
import { ComboboxOption } from "@grafana/ui";
import { ElementOptions } from "types";

export type Vec3Tuple = [number, number, number];

type IndexedElement = {
  element: ElementOptions;
  parentId: string | null;
  path: string[];
};

type ParsedPositionTarget =
  | {
      kind: "element";
      elementId: string;
    }
  | {
      kind: "subelement";
      parentElementId: string;
      subelementName: string;
    };

const ELEMENT_PREFIX = "element";
const SUBELEMENT_PREFIX = "subelement";

const subelementAnchorRegistry = new Map<string, Vec3Tuple>();
const registryListeners = new Set<() => void>();

let registryVersion = 0;

function emitRegistryChange() {
  registryVersion += 1;
  registryListeners.forEach((listener) => listener());
}

function subscribeRegistry(listener: () => void) {
  registryListeners.add(listener);
  return () => {
    registryListeners.delete(listener);
  };
}

function getRegistrySnapshot() {
  return registryVersion;
}

export function usePositionReferenceRegistryVersion() {
  return React.useSyncExternalStore(
    subscribeRegistry,
    getRegistrySnapshot,
    getRegistrySnapshot
  );
}

function toNumber(value: unknown): number {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function sameVec3(a?: Vec3Tuple | null, b?: Vec3Tuple | null, eps = 0.0001) {
  if (!a || !b) {return false;}

  return (
    Math.abs(a[0] - b[0]) < eps &&
    Math.abs(a[1] - b[1]) < eps &&
    Math.abs(a[2] - b[2]) < eps
  );
}

function addVec3(a: Vec3Tuple, b: Vec3Tuple): Vec3Tuple {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function subVec3(a: Vec3Tuple, b: Vec3Tuple): Vec3Tuple {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function makeElementReferenceTarget(elementId: string | number) {
  return `${ELEMENT_PREFIX}:${String(elementId)}`;
}

export function makeSubelementReferenceTarget(
  parentElementId: string | number,
  subelementName: string
) {
  return `${SUBELEMENT_PREFIX}:${String(parentElementId)}:${encodeURIComponent(
    subelementName
  )}`;
}

export function parsePositionReferenceTarget(
  rawTarget?: string | null
): ParsedPositionTarget | null {
  if (!rawTarget) {return null;}

  const [kind, ...rest] = rawTarget.split(":");

  if (kind === ELEMENT_PREFIX) {
    const elementId = rest.join(":");
    if (!elementId) {return null;}

    return {
      kind: "element",
      elementId,
    };
  }

  if (kind === SUBELEMENT_PREFIX) {
    const parentElementId = rest[0];
    const encodedSubName = rest.slice(1).join(":");

    if (!parentElementId || !encodedSubName) {return null;}

    return {
      kind: "subelement",
      parentElementId,
      subelementName: decodeURIComponent(encodedSubName),
    };
  }

  return null;
}

export function getElementManualLocalPosition(
  element?: ElementOptions
): Vec3Tuple {
  return [
    toNumber(element?.elementaxisx),
    toNumber(element?.elementaxisy),
    toNumber(element?.elementaxisz),
  ];
}

export function getElementPositionOffset(
  element?: ElementOptions
): Vec3Tuple {
  return [
    toNumber(element?.position_offsetx),
    toNumber(element?.position_offsety),
    toNumber(element?.position_offsetz),
  ];
}

function getElementLabel(element: ElementOptions, fallbackIndex: number) {
  return (
    String(element.name || "").trim() ||
    String(element.type || "").trim() ||
    String(element.id || "").trim() ||
    `element-${fallbackIndex + 1}`
  );
}

function buildElementIndex(
  elements: ElementOptions[],
  parentId: string | null = null,
  parentPath: string[] = [],
  map = new Map<string, IndexedElement>()
) {
  elements.forEach((item, index) => {
    const id = String(item.id ?? `${parentId ?? "root"}-${index}`);
    const label = getElementLabel(item, index);
    const path = [...parentPath, label];

    map.set(id, {
      element: item,
      parentId,
      path,
    });


  });

  return map;
}

function resolveReferenceAnchorWorldPosition(
  targetId: string,
  index: Map<string, IndexedElement>,
  cache: Map<string, Vec3Tuple>,
  stack: Set<string>
): Vec3Tuple | null {
  const parsed = parsePositionReferenceTarget(targetId);
  if (!parsed) {return null;}

  if (parsed.kind === "element") {
    return resolveElementWorldPositionById(parsed.elementId, index, cache, stack);
  }

  const registered = subelementAnchorRegistry.get(targetId);
  if (registered) {
    return registered;
  }

  return resolveElementWorldPositionById(
    parsed.parentElementId,
    index,
    cache,
    stack
  );
}

function resolveElementWorldPositionById(
  elementId: string,
  index: Map<string, IndexedElement>,
  cache: Map<string, Vec3Tuple>,
  stack: Set<string>
): Vec3Tuple | null {
  if (cache.has(elementId)) {
    return cache.get(elementId)!;
  }

  const indexed = index.get(elementId);
  if (!indexed) {
    return null;
  }

  if (stack.has(elementId)) {
    return getElementManualLocalPosition(indexed.element);
  }

  stack.add(elementId);

  const parentWorld: Vec3Tuple = indexed.parentId
    ? resolveElementWorldPositionById(indexed.parentId, index, cache, stack) ?? [0, 0, 0]
    : [0, 0, 0];

  const manualLocal = getElementManualLocalPosition(indexed.element);

  let world = addVec3(parentWorld, manualLocal);

  if (
    indexed.element.position_mode === "reference" &&
    indexed.element.position_reference_target_id
  ) {
    const anchor = resolveReferenceAnchorWorldPosition(
      indexed.element.position_reference_target_id,
      index,
      cache,
      stack
    );

    if (anchor) {
      world = addVec3(anchor, getElementPositionOffset(indexed.element));
    }
  }

  stack.delete(elementId);
  cache.set(elementId, world);

  return world;
}

function resolveFallbackWorldPosition(
  element: ElementOptions,
  sceneElements: ElementOptions[]
): Vec3Tuple {
  const manualLocal = getElementManualLocalPosition(element);

  if (
    element.position_mode === "reference" &&
    element.position_reference_target_id
  ) {
    const index = buildElementIndex(sceneElements);
    const cache = new Map<string, Vec3Tuple>();
    const stack = new Set<string>();

    const anchor = resolveReferenceAnchorWorldPosition(
      element.position_reference_target_id,
      index,
      cache,
      stack
    );

    if (anchor) {
      return addVec3(anchor, getElementPositionOffset(element));
    }
  }

  return manualLocal;
}

export function resolveElementWorldPosition(
  element: ElementOptions | undefined,
  sceneElements: ElementOptions[]
): Vec3Tuple {
  if (!element) {
    return [0, 0, 0];
  }

  const elementId = String(element.id ?? "");
  const index = buildElementIndex(sceneElements);

  if (!elementId || !index.has(elementId)) {
    return resolveFallbackWorldPosition(element, sceneElements);
  }

  const cache = new Map<string, Vec3Tuple>();
  const stack = new Set<string>();

  return (
    resolveElementWorldPositionById(elementId, index, cache, stack) ??
    resolveFallbackWorldPosition(element, sceneElements)
  );
}

export function resolveElementLocalPosition(
  element: ElementOptions | undefined,
  sceneElements: ElementOptions[]
): Vec3Tuple {
  if (!element) {
    return [0, 0, 0];
  }

  const elementId = String(element.id ?? "");
  const index = buildElementIndex(sceneElements);

  if (!elementId || !index.has(elementId)) {
    return resolveFallbackWorldPosition(element, sceneElements);
  }

  const indexed = index.get(elementId)!;
  const cache = new Map<string, Vec3Tuple>();
  const stack = new Set<string>();

  const world =
    resolveElementWorldPositionById(elementId, index, cache, stack) ??
    resolveFallbackWorldPosition(element, sceneElements);

  const parentWorld: Vec3Tuple = indexed.parentId
    ? resolveElementWorldPositionById(indexed.parentId, index, cache, stack) ?? [0, 0, 0]
    : [0, 0, 0];

  return subVec3(world, parentWorld);
}

export function isPositionReferenceTargetReady(rawTarget?: string | null) {
  const parsed = parsePositionReferenceTarget(rawTarget);

  if (!parsed) {
    return true;
  }

  if (parsed.kind === "element") {
    return true;
  }

  return subelementAnchorRegistry.has(rawTarget!);
}

export function isElementPositionReferenceReady(
  element?: Pick<ElementOptions, "position_mode" | "position_reference_target_id">
) {
  if (!element || element.position_mode !== "reference") {
    return true;
  }

  return isPositionReferenceTargetReady(element.position_reference_target_id);
}

export function buildPositionReferenceOptions(
  elements: ElementOptions[],
  currentElementId?: string
): Array<ComboboxOption<string>> {
  const options: Array<ComboboxOption<string>> = [];

  function walk(list: ElementOptions[], parentPath: string[] = []) {
    list.forEach((item, index) => {
      const itemId = String(item.id ?? `${parentPath.join("/")}-${index}`);
      const label = getElementLabel(item, index);
      const path = [...parentPath, label];
      const fullLabel = path.join(" / ");

      if (itemId !== currentElementId) {
        options.push({
          label: `Element: ${fullLabel}`,
          value: makeElementReferenceTarget(itemId),
        });
      }

      if (Array.isArray(item.subelements) && item.subelements.length > 0) {
        item.subelements.forEach((sub, subIndex) => {
          const subName =
            String(sub?.name || "").trim() || `subelement-${subIndex + 1}`;

          options.push({
            label: `Subelement: ${fullLabel} → ${subName}`,
            value: makeSubelementReferenceTarget(itemId, subName),
          });
        });
      }


    });
  }

  walk(elements);

  return options;
}

export function createPositionDependencySignature(
  elements: ElementOptions[]
): string {
  const snapshot: Array<Record<string, unknown>> = [];

  function walk(list: ElementOptions[], parentId: string | null = null) {
    list.forEach((item, index) => {
      const itemId = String(item.id ?? `${parentId ?? "root"}-${index}`);

      snapshot.push({
        id: itemId,
        parentId,
        elementaxisx: item.elementaxisx ?? null,
        elementaxisy: item.elementaxisy ?? null,
        elementaxisz: item.elementaxisz ?? null,
        position_mode: item.position_mode ?? "manual",
        position_reference_target_id: item.position_reference_target_id ?? "",
        position_offsetx: item.position_offsetx ?? 0,
        position_offsety: item.position_offsety ?? 0,
        position_offsetz: item.position_offsetz ?? 0,
        subelements: Array.isArray(item.subelements)
          ? item.subelements.map((sub, subIndex) => ({
              idx: subIndex,
              name: sub?.name ?? "",
            }))
          : [],
      });


    });
  }

  walk(elements);

  return JSON.stringify(snapshot);
}

export function registerSubelementWorldAnchor(
  parentElementId: string | number,
  subelementName: string,
  position: Vec3Tuple
) {
  const key = makeSubelementReferenceTarget(parentElementId, subelementName);
  const prev = subelementAnchorRegistry.get(key);

  if (sameVec3(prev, position)) {
    return;
  }

  subelementAnchorRegistry.set(key, position);
  emitRegistryChange();
}

export function clearSubelementWorldAnchorsForElement(
  parentElementId: string | number
) {
  const prefix = `${SUBELEMENT_PREFIX}:${String(parentElementId)}:`;
  let changed = false;

  for (const key of Array.from(subelementAnchorRegistry.keys())) {
    if (key.startsWith(prefix)) {
      subelementAnchorRegistry.delete(key);
      changed = true;
    }
  }

  if (changed) {
    emitRegistryChange();
  }
}
