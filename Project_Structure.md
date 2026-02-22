# You are a senior Cocos Creator 3D TypeScript engineer.

# Project Structure

## Scripts Overview
This document outlines all script files in the Parkour game project and their purposes.

### Define
- **assets/scripts/Define/Define.ts** : Contains predefined enums and constants for the game, including ObstacleType, Energy values (stamina, run, jump, vault costs), and MovementState (Idle, Walking, Running, Vaulting, etc.)

### Core Game Manager
- **assets/scripts/GameManager/GameManager.ts** : Main game manager handling overall game state, game timer, difficulty scaling system, and coordination of StaminaManager and ObstacleManager components.

- **assets/scripts/GameManager/StaminaManager.ts** : Manages player stamina system including consumption during running, regeneration during idle, and stamina bar UI updates.

- **assets/scripts/GameManager/ObstacleManager.ts** : Handles spawning and placement of obstacles within plane boundaries with configurable spawn radius and collision checks.

- **assets/scripts/GameManager/SurvivalZoneManager.ts** : Manager component that spawns and controls multiple survival zone obstacles with configurable spawn count and radius.

### Player & Actor
- **assets/scripts/Actor.ts** : Base actor component managing health/HP, health regeneration with configurable delay and rate, damage handling, and health bar UI display.

- **assets/scripts/PlayerController.ts** : Core player controller handling movement, jumping, vaulting mechanics, stamina consumption, animation states, input processing, and character collision detection.

- **assets/scripts/CameraController.ts** : Camera controller that follows the player target with configurable speed, offset positioning, and smooth interpolation.

- **assets/scripts/VaultDetector.ts** : Detects obstacles ahead using raycasting to determine if the player can vault over obstacles within a configurable distance.

### Occlusion & Survival Mechanics
- **assets/scripts/Occludable.ts** : Component for managing visual occlusion of objects in the game world, hiding/showing visual meshes while maintaining collision detection on the root node.

- **assets/scripts/SurvivalZone.ts** : Survival zone obstacle that moves towards the player and applies damage on collision, creating a progressive threat mechanic.

### UI
- **assets/scripts/UI/upperInfo.ts** : UI component that keeps UI elements (like information displays) facing toward the camera for proper visibility.

### Obstacles
- **assets/scripts/Obstacle/Obstacle.ts** : Base obstacle component with damage property and box collider setup.

- **assets/scripts/Obstacle/Box.ts** : Box-type obstacle component supporting both low and high box variants for parkour challenges.

- **assets/scripts/Obstacle/ObstacleCollision.ts** : Handles collision detection and damage application from obstacles to actors with hit cooldown to prevent rapid repeated damage.

- **assets/scripts/Obstacle/Missile.ts** : Missile obstacle that autonomously tracks and follows the player with smooth rotation and configurable speed/turn rate.

- **assets/scripts/Obstacle/MissileManager.ts** : Manager component for spawning and controlling missile obstacles in the game world.

### Utilities
- **assets/scripts/BestRunManager.ts** : Tracks current run distance and best run distance using local storage for persistence across game sessions.

- **assets/scripts/Utils/GhostEffect.ts** : Utility component that creates ghost/afterimage visual effects for entities in motion, with configurable duration, transparency, and spawn intervals.