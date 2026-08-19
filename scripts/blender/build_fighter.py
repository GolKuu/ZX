"""Builds one armoured fighter on the Blender Studio human base mesh.

This is a corrected replacement for the surface half of
`generate_yzx_fighters.py`, which produces the blobby mannequins currently
sitting unused in `public/models/`. Those fail for three compounding reasons,
all of them visible in a single render:

  1. the 15,043-poly anatomical base is put through `DECIMATE` at ratio 0.16,
     which is where the anatomy goes -- what survives is a 2.4k lump with no
     collarbone, knee or knuckle left;
  2. the character is then described with `primitive_ico_sphere_add`,
     `primitive_cube_add` and friends glued to that lump, and primitive
     assembly has a hard ceiling that no amount of lighting gets past;
  3. every glued piece is rigid-bound to exactly one bone, so nothing bends.

The fix for (1) and (2) is the same idea: keep the good mesh, and *derive*
armour from it rather than stacking shapes on it. Every plate here is a copy of
the body masked to one region, pushed out along its own normals and given a
shell and a bevel. A plate cannot float or interpenetrate, because its inner
surface is the anatomy.

That is loft-and-recess applied to a figure rather than a hull: plate
boundaries are cut from a continuous surface, detail is inset into the shell
instead of stacked onto it, and the detail is zoned -- because detail only
registers against something undetailed.

Run:
  blender --background --factory-startup --python scripts/blender/build_fighter.py \
      -- <base.blend> <out.png> <character> [engine] [samples]
"""

import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import fighter_materials as fm  # noqa: E402

BODY = 'GEO-body_male_realistic'


def load_base(blend_path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    with bpy.data.libraries.load(blend_path, link=False) as (src, dst):
        dst.objects = [BODY]
    body = dst.objects[0]
    bpy.context.scene.collection.objects.link(body)
    # The bundle's Mask modifiers are driven by rig properties that do not exist
    # on a standalone link. A broken driver evaluates to zero, the mask keeps
    # nothing, and the object renders as no geometry at all -- while bound_box
    # still reports a full body, so every framing calculation looks correct over
    # an empty frame. Clear the stack before touching anything.
    body.modifiers.clear()
    body.animation_data_clear()
    body.location = (0.0, 0.0, 0.0)
    body.hide_render = False
    body.hide_viewport = False
    body.name = 'Body'
    for poly in body.data.polygons:
        poly.use_smooth = True
    return body


def plate(body, name, keep, *, offset, thickness, bevel=0.006, material=None):
    """One armour piece: the body, masked to a region and given a shell.

    `keep` is a predicate on the local vertex coordinate. Selecting by position
    rather than by hand-authored vertex groups is what lets one script serve the
    whole roster -- a heavier fighter is different numbers, not different code.
    """
    dup = body.copy()
    dup.data = body.data.copy()
    dup.name = name
    bpy.context.scene.collection.objects.link(dup)

    group = dup.vertex_groups.new(name='keep')
    indices = [v.index for v in dup.data.vertices if keep(v.co)]
    if not indices:
        bpy.data.objects.remove(dup, do_unlink=True)
        return None
    group.add(indices, 1.0, 'REPLACE')

    mask = dup.modifiers.new('Mask', 'MASK')
    mask.vertex_group = 'keep'
    # Standoff before thickness: the plate has to clear the skin before it is
    # given a shell, or the shell grows inward through the body.
    push = dup.modifiers.new('Standoff', 'DISPLACE')
    push.strength = offset
    push.mid_level = 0.0
    shell = dup.modifiers.new('Shell', 'SOLIDIFY')
    shell.thickness = thickness
    shell.offset = 1.0
    shell.use_rim = True
    edge = dup.modifiers.new('Bevel', 'BEVEL')
    edge.width = bevel
    edge.segments = 2
    edge.limit_method = 'ANGLE'
    edge.angle_limit = math.radians(45)
    # The mask cuts along polygon boundaries, so a plate's rim is a staircase
    # at the resolution of the base mesh. A subdivision pass after the shell
    # rounds that rim into something cast rather than torn, and costs nothing
    # at render time because these are 1k-poly pieces.
    smooth = dup.modifiers.new('Smooth', 'SUBSURF')
    smooth.levels = 2
    smooth.render_levels = 2

    dup.data.materials.clear()
    if material is not None:
        dup.data.materials.append(material)
    return dup


def build_mim(body):
    """White segmented plate over a near-black undersuit, bone-coloured mask."""
    # Violet-black, not neutral black. MIM's sheet shadows shift toward plum,
    # and a neutral undersuit next to white plate reads as a grey gap.
    undersuit = fm.plate_material(
        'MIM_Undersuit', (0.020, 0.014, 0.036, 1.0),
        roughness=0.62, variation=0.05, grime=0.42)
    armour = fm.plate_material(
        'MIM_Plate', (0.80, 0.80, 0.84, 1.0),
        roughness=0.34, metallic=0.15,
        wear_color=(0.42, 0.42, 0.47, 1.0), variation=0.11, grime=0.30)
    bone = fm.plate_material(
        'MIM_Mask', (0.88, 0.86, 0.80, 1.0),
        roughness=0.30, variation=0.06, grime=0.12)

    body.data.materials.clear()
    body.data.materials.append(undersuit)

    spec = [
        # Chest and back: one clean shell, deliberately undetailed. It is the
        # rest area the greebled limbs are measured against.
        ('Chest', lambda co: 1.22 <= co.z <= 1.50, 0.016, 0.020, 0.008, armour),
        ('Abdomen', lambda co: 1.02 <= co.z <= 1.20, 0.010, 0.014, 0.005, armour),
        # Shoulder caps: the widest silhouette event on the figure.
        ('Shoulders', lambda co: 1.36 <= co.z <= 1.56 and abs(co.x) >= 0.14,
         0.026, 0.022, 0.010, armour),
        ('Forearms', lambda co: 0.92 <= co.z <= 1.14 and abs(co.x) >= 0.22,
         0.014, 0.016, 0.006, armour),
        ('Thighs', lambda co: 0.56 <= co.z <= 0.86 and abs(co.x) >= 0.03,
         0.014, 0.018, 0.007, armour),
        ('Shins', lambda co: 0.10 <= co.z <= 0.42 and abs(co.x) >= 0.03,
         0.013, 0.016, 0.006, armour),
        ('Boots', lambda co: co.z <= 0.10, 0.010, 0.016, 0.005, armour),
        # Face only. The skull sides and back stay undersuit, which is what
        # makes this read as a mask worn rather than as a white head.
        # Front of the skull only, and above the jaw line: taking the whole
        # head produced a white scalp with a chin strap rather than a mask.
        ('Mask', lambda co: co.z >= 1.655 and co.y <= -0.005,
         0.009, 0.012, 0.006, bone),
    ]
    pieces = []
    for name, keep, offset, thickness, bevel, material in spec:
        piece = plate(body, name, keep, offset=offset, thickness=thickness,
                      bevel=bevel, material=material)
        if piece is not None:
            pieces.append(piece)
    return pieces


BUILDERS = {'mim': build_mim}


def frame_camera(objects, lens=95):
    """Derive the camera from the bounding box; hand-placed ones end up inside."""
    deps = bpy.context.evaluated_depsgraph_get()
    pts = []
    for obj in objects:
        ev = obj.evaluated_get(deps)
        pts += [obj.matrix_world @ Vector(c) for c in ev.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    ctr = (lo + hi) / 2
    rad = max((p - ctr).length for p in pts)

    data = bpy.data.cameras.new('Cam')
    data.lens = lens
    cam = bpy.data.objects.new('Cam', data)
    bpy.context.scene.collection.objects.link(cam)
    direction = Vector((0.42, -1.0, 0.06)).normalized()
    cam.location = ctr + direction * (rad / math.tan(data.angle / 2) * 1.06)
    cam.rotation_euler = (ctr - cam.location).to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.camera = cam
    return ctr, rad


def light_rig(ctr, rad):
    """One hard key, a cold rim, fill only strong enough to keep shadows off black.

    Lighting from six directions at once is the safe rig, and the reason nothing
    lit with it has a shadow side: the silhouette gets filled in from behind and
    dissolves into the set.
    """
    def add(name, loc, energy, color, size):
        data = bpy.data.lights.new(name, 'AREA')
        data.energy = energy
        data.color = color
        data.size = size
        obj = bpy.data.objects.new(name, data)
        obj.location = ctr + Vector(loc) * rad
        obj.rotation_euler = (ctr - obj.location).to_track_quat('-Z', 'Y').to_euler()
        bpy.context.scene.collection.objects.link(obj)

    # Watts, at roughly a metre. The first pass ran the key at 1400 and the
    # rim at 1500, which clipped the entire figure to paper white -- the dark
    # undersuit rendered the same value as the white plate, and the armour
    # zoning the build exists to produce was invisible. Exposure is the first
    # thing to get right, because every material judgement made over a clipped
    # frame is a judgement about the tone curve instead.
    add('Key', (-1.25, -1.45, 1.35), 190, (1.0, 0.95, 0.88), rad * 0.9)
    add('Fill', (1.85, -0.85, 0.05), 34, (0.50, 0.64, 1.0), rad * 2.2)
    add('RimCool', (0.75, 1.55, 0.95), 260, (0.55, 0.82, 1.0), rad * 0.8)
    add('RimWarm', (-1.50, 1.25, 0.25), 90, (1.0, 0.55, 0.35), rad * 0.9)

    world = bpy.data.worlds.new('W')
    bpy.context.scene.world = world
    world.use_nodes = True
    background = world.node_tree.nodes['Background']
    background.inputs[0].default_value = (0.010, 0.012, 0.018, 1.0)


def render(out, engine, samples, width, height, transparent):
    scene = bpy.context.scene
    scene.render.engine = engine
    if engine == 'CYCLES':
        scene.cycles.samples = samples
        scene.cycles.use_denoising = True
        scene.cycles.device = 'CPU'
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.film_transparent = transparent
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA' if transparent else 'RGB'
    # Standard, not AgX, and this matters more than it looks.
    # These renders become sprite atlases that the game composites and then
    # tone-maps itself with ACES. Baking a display transform in here means the
    # curve is applied twice: the highlights are rolled off once in Blender and
    # again in the browser, which is exactly how a bright white plate arrives
    # in-game as flat grey with no specular left in it. Render the values the
    # material actually produces and let the runtime do the one tone map.
    scene.view_settings.view_transform = 'Standard'
    scene.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print('WROTE', out)


def main():
    argv = sys.argv[sys.argv.index('--') + 1:]
    blend, out, character = argv[0], argv[1], argv[2]
    engine = argv[3] if len(argv) > 3 else 'BLENDER_EEVEE'
    samples = int(argv[4]) if len(argv) > 4 else 64

    body = load_base(blend)
    pieces = BUILDERS[character](body)
    print('PIECES', [p.name for p in pieces])
    ctr, rad = frame_camera([body] + pieces)
    light_rig(ctr, rad)
    render(out, engine, samples, 800, 1200, False)


if __name__ == '__main__':
    main()
