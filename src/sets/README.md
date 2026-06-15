# Set Config Naming Conventions

When adding a new set JSON (`src/sets/<code>.json`), use these conventions
for `slot.label` and `probability.type` strings so naming stays consistent
across sets:

- **Extended-art** (hyphenated, lowercase "art"): `Extended-art, Rare`,
  `Extended-art, Mythic (Foil)`, `Extended-art Commander, Rare`.
- **Default frame** (lowercase "frame"): `Default frame, Rare (Foil)`,
  `Default frame, Common`.
- **Basic/dual land** (lowercase "land"): `Basic land`, `Basic land (Foil)`,
  `Common dual land`, `Common dual land (Foil)`, `Full-art basic land`,
  `Full-art basic land (Foil)`. Set-specific full-art land names follow the
  same lowercase pattern, e.g. `Full-art Celestial basic land`,
  `Avatar's Journey full-art basic land`.
- **"Scene, X" / "Sewer Frame, X"** (comma before rarity): `Scene, Common`,
  `Scene, Rare (Foil)`, `Sewer Frame, Mythic`.
- **Main-set** (hyphenated, capitalized "Main-set"): `Main-set Common`,
  `Main-set Uncommon (Foil)`, `Main-set Rare`.
- **Slot labels for full-art basic land slots**: `Foil Full-Art Basic Land`
  (capital "Art").

Exceptions: set-unique frame/category names (e.g. "Borderless Land",
"Spellcraft Land", "Spiderweb basic land", "Celestial Land") don't need to
follow the basic/dual land pattern above unless they're literally referring
to a generic basic or dual land.
