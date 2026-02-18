# Cocos Creator 3.8 Physics Raycast Guide (Model-Friendly)

## 1. Purpose

Raycast is used to detect colliders in the physics world.

A ray =

* origin (start position)
* direction

The physics system checks whether this ray intersects any collider.

Raycast works with **physics colliders**, not mesh renderers.

---

## 2. Main API Entry

All raycast functions come from:

PhysicsSystem.instance

Important methods:

* raycast()
* raycastClosest()

They both return:

boolean → true if something is hit.

---

## 3. Constructing Rays

### Method A — Constructor

```ts
import { geometry } from 'cc';

const ray = new geometry.Ray(
    x, y, z,       // origin
    dx, dy, dz     // direction
);
```

---

### Method B — Static create()

```ts
const ray = geometry.Ray.create(x, y, z, dx, dy, dz);
```

---

### Method C — From Two Points

```ts
import { geometry, math } from 'cc';

const ray = new geometry.Ray();
geometry.Ray.fromPoints(
    ray,
    math.Vec3.ZERO,
    math.Vec3.UNIT_Z
);
```

---

### Method D — From Camera (MOST COMMON)

```ts
camera.screenPointToRay(screenX, screenY, outRay);
```

Used for:

* mouse picking
* camera ray
* character targeting

NOTE:
Camera component and camera instance may have different parameter order.

---

## 4. raycastClosest() (RECOMMENDED)

Detects ALL colliders but stores ONLY the nearest hit.

```ts
if (PhysicsSystem.instance.raycastClosest(ray)) {

    const result =
        PhysicsSystem.instance.raycastClosestResult;

    const collider = result.collider;
    const hitPoint = result.hitPoint;
    const hitNormal = result.hitNormal;
    const distance = result.distance;
}
```

Use when:

* picking objects
* nearest obstacle
* camera occlusion

---

## 5. raycast() (MULTI HIT)

Returns ALL collisions along the ray.

```ts
if (PhysicsSystem.instance.raycast(ray)) {

    const results =
        PhysicsSystem.instance.raycastResults;

    for (const result of results) {

        const collider = result.collider;
        const distance = result.distance;
        const hitPoint = result.hitPoint;
        const hitNormal = result.hitNormal;
    }
}
```

Use when:

* multiple objects needed
* occlusion systems
* bullet penetration
* visibility checks

---

## 6. Optional Parameters

Both raycast methods support:

```ts
raycast(ray, mask, maxDistance, queryTrigger)
```

### mask

Layer filter.

Default:

```
0xffffffff
```

Use for filtering groups.

---

### maxDistance

Maximum ray length.

Default:

```
10000000
```

DO NOT use:

* Infinity
* Number.MAX_VALUE

---

### queryTrigger

Whether trigger colliders are detected.

true = include triggers.

---

## 7. Raycast Result Object

Type: PhysicsRayResult

Fields:

* collider → hit collider
* distance → from ray origin
* hitPoint → world position
* hitNormal → world normal vector

IMPORTANT:

Result objects are reused internally.
Do NOT store references permanently.

---

## 8. Line Strip Cast (Since 3.7)

Used to cast multiple connected rays using sample points.

Methods:

* lineStripCast()
* lineStripCastClosest()

Example:

```ts
if (PhysicsSystem.instance.lineStripCastClosest(points)) {
    const result =
        PhysicsSystem.instance.lineStripCastClosestResult;
}
```

Use cases:

* path checking
* multi-point detection
* stable camera checks

---

## 9. Practical Usage Patterns

### Pattern A — Camera Picking

```
mouse → screenPointToRay → raycastClosest
```

---

### Pattern B — Camera Occlusion (RECOMMENDED)

```
camera → player

use raycast()
collect all hits
hide occluders
```

---

### Pattern C — Multi-ray Stability

Instead of one ray:

```
camera → head
camera → center
camera → shoulders
```

Combine results.

---

## 10. Common Mistakes (IMPORTANT)

❌ Raycast hits collider children, not building root.

Fix:

Normalize hit node to occluder root.

---

❌ Disabling collider node:

```
node.active = false
```

Physics disappears → flicker loop.

Hide visual node instead.

---

❌ Using Infinity maxDistance.

Engine does NOT recommend this.

---

## 11. Performance Rules

* Reuse Ray object.
* Do NOT create new Ray every frame.
* Use layer mask.
* Use raycastClosest when possible.
* Reduce raycast frequency if needed.

---

## 12. Model Rules (VERY IMPORTANT)

When writing code:

* Always import from 'cc'
* Use PhysicsSystem.instance
* Use geometry.Ray
* Result objects are read-only/reused.
* Collider = physics component only.
