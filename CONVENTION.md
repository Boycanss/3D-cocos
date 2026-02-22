# Cocos Creator 3D Conventions and Context

## Updating or Adding files
* If not asked to add new files, only UPDATE the available files
* Automatically perform `/add` command for needed files

## Engine Context

* Engine: Cocos Creator 3.8.x
* Language: TypeScript
* Project type: 3D
* read `Project_Structure.md` for project structure
* Ray documentation: https://docs.cocos.com/creator/3.4/api/en/geometry/Class/Ray

## Workflow Orchestration

### 1. Plan Node Default
* Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
* If something goes sideways, STOP and re-plan immediately don't keep pushing
* Use plan mode for verification steps, not just building
* Write detailed specs upfront to reduce ambiguity

### 2. Self-Improvement Loop
* After ANY correction from the user: update `lesson.md` with the pattern
* Write rules for yourself that prevent the same mistake
* Ruthlessly iterate on these lessons until mistake rate drops
* Review lessons at session start for relevant project

### 3. Verification Before Done
* Never mark a task complete without proving it works
* Diff behavior between main and your changes when relevant
* Ask yourself: "Would a staff engineer approve this?"
* Run tests, check logs, demonstrate correctness

### 4. Demand Elegance (Balanced)
* For non-trivial changes: pause and ask "is there a more elegant way?"
* If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
* Skip this for simple, obvious fixes don't over-engineer
* Challenge your own work before presenting it

### 5. Autonomous Bug Fixing
* When given a bug report: just fix it. Don't ask for hand-holding Point at logs, errors, failing tests then resolve them
Zero context switching required from the user

## Task Management
1. **Plan First**: Write plan to `todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `todo.md`
6. **Capture Lessons**: Update `lesson.md` after corrections

## Core Principles
**Simplicity First**: Make every change as simple as possible. Impact minimal code.
**No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
**Minimat Impact**: Changes should only touch what's necessary. Avoid introducing bugs.