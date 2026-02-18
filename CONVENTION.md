# Cocos Creator 3D Conventions and Context

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
* Never rewrite entire file unless explicitly requested.
* Prefer minimal diff changes.

## Response Rules
* Keep responses short
* Split work into very small steps.
* Each response modifies only one logical section.
* Stop after one completed step.
* Avoid large rewrites.
* Suggest the next step.
* no need to translate it to INDONESIA