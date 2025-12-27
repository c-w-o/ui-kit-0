#!/usr/bin/env python3
import os
import sys
import shutil
import subprocess
from pathlib import Path

def is_storage0_path(p: Path) -> bool:
    s = str(p.resolve())
    # typische Android/Termux shared-storage Pfade
    prefixes = (
        "/storage/emulated/0/",
        "/sdcard/",
        "/storage/self/primary/",
    )
    return any(s.startswith(x) for x in prefixes)

def run(cmd, cwd: Path):
    print("$ " + " ".join(cmd) + f"  (cwd={cwd})")
    subprocess.check_call(cmd, cwd=str(cwd))

def sanitize_version(v: str) -> str:
    v = v.strip()
    allowed = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-")
    out = "".join(ch for ch in v if ch in allowed)
    if not out:
        raise SystemExit("ERROR: invalid version (allowed: letters/digits . _ -)")
    return out

def copy_project(src_root: Path, dst_root: Path):
    # wirklich simpel: copytree ohne node_modules und dist
    ignore = shutil.ignore_patterns("node_modules", "dist", ".git", "__pycache__", "*.pyc")
    if dst_root.exists():
        shutil.rmtree(dst_root)
    shutil.copytree(src_root, dst_root, ignore=ignore)

def main():
    # Script liegt neben src/
    root = Path(__file__).resolve().parent
    src_dir = root / "src"
    dist_dir = root / "dist"
    entry = src_dir / "ui-kit-0.js"  # simple assumption

    if not src_dir.is_dir():
        raise SystemExit(f"ERROR: src/ not found next to {Path(__file__).name}")
    if not entry.is_file():
        raise SystemExit(f"ERROR: entry not found: {entry}")

    if len(sys.argv) != 2:
        raise SystemExit(f"Usage: {Path(__file__).name} <version>\nExample: {Path(__file__).name} 0.0.1")
    version = sanitize_version(sys.argv[1])

    name = "ui-kit-0"
    out_dev = f"{name}-{version}.js"
    out_min = f"{name}-{version}.min.js"

    dist_dir.mkdir(parents=True, exist_ok=True)

    # Wenn Projekt in storage0 liegt, in $HOME bauen
    build_root = root
    building_in_home = is_storage0_path(root)
    if building_in_home:
        home = Path(os.environ.get("HOME", str(Path("~").expanduser()))).resolve()
        ws = home / ".uikit_release"
        ws.mkdir(parents=True, exist_ok=True)
        build_root = ws / f"build_{root.name}"
        copy_project(root, build_root)

    # Ensure dist in build root
    (build_root / "dist").mkdir(parents=True, exist_ok=True)

    # esbuild über npx (kein npm install nötig)
    common = ["npx", "-y", "esbuild", "./src/ui-kit-0.js", "--bundle", "--format=esm", "--target=es2020"]

    # unminified
    run(common + ["--sourcemap", f"--outfile=./dist/{out_dev}"], cwd=build_root)
    # minified
    run(common + ["--minify", f"--outfile=./dist/{out_min}"], cwd=build_root)

    # Ergebnis zurückkopieren, wenn wir in $HOME gebaut haben
    if building_in_home:
        built_dist = build_root / "dist"
        for fn in (out_dev, out_min):
            shutil.copy2(built_dist / fn, dist_dir / fn)
    
    # sbom.json mit nach dist kopieren (wenn vorhanden)
    sbom_src = build_root / "src" / "sbom.json"
    if sbom_src.is_file():
        shutil.copy2(sbom_src, dist_dir / "sbom.json")

    print("\nDone:")
    print(f" - dist/{out_dev}")
    print(f" - dist/{out_min}")

if __name__ == "__main__":
    main()