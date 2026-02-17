# Cocos Creator 3D Conventions

## Engine Context

* Engine: Cocos Creator 3.8.x
* Language: TypeScript
* Project type: 3D
* Ray documentation: https://docs.cocos.com/creator/3.4/api/en/geometry/Class/Ray

## Coding Rules

* Never invent APIs.
* Use only official Cocos Creator APIs.
* Avoid Unity or Unreal patterns.
* Prefer component-based architecture.
* System logic must be separated from component logic.
* Use Set<Node> for state tracking.
* Avoid allocations inside update loops.

## Rendering Rules

* MeshRenderer + material transparency for fading.
* Cache materials in start().
* Never clone materials every frame.

## Response Rules

* Focus only on provided code.
* Do not rewrite full files unless requested.
* Suggest minimal modifications when possible.
* Suggest the next step.