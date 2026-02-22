# Wall Run Jump Implementation
- Status: Incorrect
- Logic: Jump direction calculated based on wall side.
  - Left wall (_wallSide = -1): Jump in direction of +right (90 deg right).
  - Right wall (_wallSide = 1): Jump in direction of -right (90 deg left).
- Status: Fixed
- **Problem**: Initial approach calculated jump direction by combining character's forward and right vectors with wall side multiplier. This resulted in >90° angle and sometimes jumped into the wall instead of away from it.
  - Incorrect: `jumpDir = forward + right * (-wallSide)` → over-rotated jump direction
  
- **Root Cause**: Used character's local right vector which doesn't align with wall geometry. The calculation mixed parallel-to-wall direction with would-be perpendicular, creating non-perpendicular angles.

- **Correct Solution**: Use the wall normal directly (already captured during wall detection)
  - Wall normal points perpendicular away from wall surface
  - Simply use: `jumpDir = wallNormal` (zero out Y and normalize)
  - This gives exact 90° perpendicular jump away from wall
  
- **Key Learning**: When dealing with surface geometry, use the captured surface normal directly instead of deriving perpendicular direction from character orientation. The normal is already geometrically correct for the surface.
