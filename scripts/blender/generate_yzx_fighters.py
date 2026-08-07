"""Generate five original rigged YZX fighters and export deployment-ready GLBs.

Run with:
  blender --background --python scripts/blender/generate_yzx_fighters.py

No downloaded mesh is used.  Every surface is generated from Blender geometry,
then rigid-skinned to one shared humanoid skeleton.  The web runtime supplies
the combat poses, so the files stay compact and every move remains data-driven.
"""

from pathlib import Path
import math
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "public" / "models"
HUMAN_LIBRARY = ROOT / ".tmp" / "human-base" / "human_base_meshes_bundle.blend"
OUTPUT.mkdir(parents=True, exist_ok=True)

FIGHTERS = {
    "mim": dict(height=1.02, shoulder=.88, bulk=.82, limb=.82),
    "glitch": dict(height=1.00, shoulder=1.02, bulk=.96, limb=.94),
    "lucky": dict(height=1.04, shoulder=.92, bulk=.86, limb=.85),
    "vorgh": dict(height=1.04, shoulder=1.28, bulk=1.28, limb=1.22),
    "titan": dict(height=1.14, shoulder=1.48, bulk=1.46, limb=1.40),
}

PALETTES = {
    "mim": {"body": (0.82, .84, .86, 1), "coat": (.22, .05, .48, 1), "eye": (.55, .1, 1, 1)},
    "glitch": {"body": (.015, .025, .045, 1), "coat": (.02, .07, .13, 1), "eye": (0, .75, 1, 1)},
    "lucky": {"body": (.06, .055, .04, 1), "coat": (.55, .3, .03, 1), "eye": (.8, .55, .08, 1)},
    "vorgh": {"body": (.12, .015, .02, 1), "coat": (.35, .025, .03, 1), "eye": (1, .1, .015, 1)},
    "titan": {"body": (.12, .15, .17, 1), "coat": (.22, .25, .27, 1), "eye": (1, .22, .02, 1)},
}

BONES = {
    "hips": ((0, 0, .92), (0, 0, 1.06), None),
    "spine": ((0, 0, 1.02), (0, 0, 1.28), "hips"),
    "chest": ((0, 0, 1.28), (0, 0, 1.55), "spine"),
    "neck": ((0, 0, 1.53), (0, 0, 1.65), "chest"),
    "head": ((0, 0, 1.64), (0, 0, 1.88), "neck"),
    "shoulderL": ((0, 0, 1.48), (-.22, 0, 1.48), "chest"),
    "upperArmL": ((-.22, 0, 1.48), (-.52, 0, 1.34), "shoulderL"),
    "forearmL": ((-.52, 0, 1.34), (-.72, 0, 1.12), "upperArmL"),
    "handL": ((-.72, 0, 1.12), (-.82, 0, 1.04), "forearmL"),
    "shoulderR": ((0, 0, 1.48), (.22, 0, 1.48), "chest"),
    "upperArmR": ((.22, 0, 1.48), (.52, 0, 1.34), "shoulderR"),
    "forearmR": ((.52, 0, 1.34), (.72, 0, 1.12), "upperArmR"),
    "handR": ((.72, 0, 1.12), (.82, 0, 1.04), "forearmR"),
    "thighL": ((-.12, 0, .94), (-.13, 0, .55), "hips"),
    "shinL": ((-.13, 0, .55), (-.13, 0, .16), "thighL"),
    "footL": ((-.13, 0, .16), (-.13, -.2, .07), "shinL"),
    "thighR": ((.12, 0, .94), (.13, 0, .55), "hips"),
    "shinR": ((.13, 0, .55), (.13, 0, .16), "thighR"),
    "footR": ((.13, 0, .16), (.13, -.2, .07), "shinR"),
}


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.curves, bpy.data.armatures, bpy.data.materials):
        for item in list(block):
            block.remove(item)


def material(name, colour, metallic=.25, roughness=.45, emission=None):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = colour
    mat.metallic = metallic
    mat.roughness = roughness
    if emission:
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        bsdf.inputs["Emission Color"].default_value = emission
        bsdf.inputs["Emission Strength"].default_value = 4.0
    return mat


def create_materials(fid):
    p = PALETTES[fid]
    return {
        "body": material("Body_Material", p["body"], .48, .34),
        "armor": material("Armor_Coat_Material", p["coat"], .68, .25),
        "under": material("Trouser_Undersuit_Material", (.018, .02, .025, 1), .1, .72),
        "skin": material("Skin_Material", (.48, .25, .18, 1) if fid == "lucky" else p["body"], .05, .52),
        "hair": material("Hair_Material", (.82, .84, .9, 1), .18, .48),
        "boot": material("Boot_Material", (.025, .028, .032, 1), .62, .3),
        "eye": material("Eye_Emission_Material", p["eye"], .1, .2, p["eye"]),
    }


def rig_point(point, bone_name, cfg):
    x, y, z = point
    arm = any(token in bone_name.lower() for token in ("shoulder", "arm", "forearm", "hand"))
    leg = any(token in bone_name.lower() for token in ("thigh", "shin", "foot"))
    width = cfg["shoulder"] if arm else cfg["bulk"] if leg else 1
    return Vector((x * width, y * cfg["bulk"], z * cfg["height"]))


def create_rig(cfg):
    data = bpy.data.armatures.new("YZX_Humanoid_Armature")
    rig = bpy.data.objects.new("YZX_Humanoid_Rig", data)
    bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    made = {}
    for name, (head, tail, parent) in BONES.items():
        bone = data.edit_bones.new(name)
        bone.head = rig_point(head, name, cfg)
        bone.tail = rig_point(tail, name, cfg)
        if parent:
            bone.parent = made[parent]
        made[name] = bone
    bpy.ops.object.mode_set(mode="OBJECT")
    rig.show_in_front = True
    return rig


def point_segment_distance(point, start, end):
    direction = end - start
    if direction.length_squared == 0:
        return (point - start).length
    t = max(0.0, min(1.0, (point - start).dot(direction) / direction.length_squared))
    return (point - (start + direction * t)).length


def candidate_bones(co):
    if co.z < 1.02:
        side = "L" if co.x < 0 else "R"
        return [f"thigh{side}", f"shin{side}", f"foot{side}", "hips"]
    if abs(co.x) > .2 and co.z < 1.62:
        side = "L" if co.x < 0 else "R"
        return [f"shoulder{side}", f"upperArm{side}", f"forearm{side}", f"hand{side}", "chest"]
    return ["hips", "spine", "chest", "neck", "head"]


def import_human_base(fid, cfg, rig, mat):
    if not HUMAN_LIBRARY.exists():
        raise RuntimeError(f"Missing official Blender human base library: {HUMAN_LIBRARY}")
    with bpy.data.libraries.load(str(HUMAN_LIBRARY), link=False) as (source, target):
        if "GEO-body_male_realistic" not in source.objects:
            raise RuntimeError("Official human base mesh was not found in the Blender bundle")
        target.objects = ["GEO-body_male_realistic"]
    obj = target.objects[0]
    bpy.context.collection.objects.link(obj)
    obj.name = f"Mannequin_Body_Base_{fid}"
    obj.location = (0, 0, 0)
    obj.scale = (.92 * cfg["shoulder"], .95 * cfg["bulk"], cfg["height"])
    for modifier in list(obj.modifiers):
        obj.modifiers.remove(modifier)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    obj.vertex_groups.clear()
    groups = {name: obj.vertex_groups.new(name=name) for name in BONES}
    segments = {
        name: (rig_point(head, name, cfg), rig_point(tail, name, cfg))
        for name, (head, tail, _parent) in BONES.items()
    }
    for vertex in obj.data.vertices:
        distances = sorted(
            ((name, point_segment_distance(vertex.co, *segments[name])) for name in candidate_bones(vertex.co)),
            key=lambda item: item[1],
        )[:2]
        raw = [(name, 1 / max(distance, .015) ** 2) for name, distance in distances]
        total = sum(weight for _name, weight in raw)
        for name, weight in raw:
            groups[name].add([vertex.index], weight / total, "REPLACE")
    armature = obj.modifiers.new("YZX_Humanoid_Skin", "ARMATURE")
    armature.object = rig
    obj.select_set(False)
    return obj


def apply_and_bind(obj, rig, bone, mat):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    obj.data.materials.append(mat)
    group = obj.vertex_groups.new(name=bone)
    group.add(range(len(obj.data.vertices)), 1.0, "REPLACE")
    modifier = obj.modifiers.new("YZX_Armature", "ARMATURE")
    modifier.object = rig
    obj.select_set(False)
    return obj


def ellipsoid(name, location, scale, rig, bone, mat, subdivisions=2):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdivisions, radius=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    return apply_and_bind(obj, rig, bone, mat)


def box(name, location, scale, rig, bone, mat, bevel=.04, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    apply_and_bind(obj, rig, bone, mat)
    bevel_mod = obj.modifiers.new("Edge_Bevel", "BEVEL")
    bevel_mod.width = bevel
    bevel_mod.segments = 2
    return obj


def cylinder(name, start, end, radius, rig, bone, mat, vertices=12):
    a, b = Vector(start), Vector(end)
    direction = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=direction.length, location=(a + b) / 2)
    obj = bpy.context.object
    obj.name = name
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = direction.to_track_quat("Z", "Y")
    return apply_and_bind(obj, rig, bone, mat)


def cone(name, location, radius, depth, rotation, rig, bone, mat):
    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=radius, radius2=0, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    return apply_and_bind(obj, rig, bone, mat)


def torus(name, location, major, minor, rotation, rig, bone, mat):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=20, minor_segments=6, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    return apply_and_bind(obj, rig, bone, mat)


def build_humanoid(fid, cfg, rig, mats):
    s, bulk, limb, shoulders = cfg["height"], cfg["bulk"], cfg["limb"], cfg["shoulder"]
    robotic = fid != "lucky"
    ellipsoid("Hips_Armor", (0, 0, .96*s), (.2*bulk, .13*bulk, .16), rig, "hips", mats["armor"])
    ellipsoid("Abdomen_Body", (0, 0, 1.18*s), (.2*bulk, .13*bulk, .25), rig, "spine", mats["body"])
    ellipsoid("Chest_Armor", (0, 0, 1.42*s), (.3*shoulders, .17*bulk, .25), rig, "chest", mats["armor"])
    for side in (-1, 1):
        suffix = "L" if side < 0 else "R"
        x = side * .24 * shoulders
        ellipsoid(f"Shoulder_Armor_{suffix}", (x, 0, 1.49*s), (.14*limb, .15*limb, .13*limb), rig, f"shoulder{suffix}", mats["armor"])
        cylinder(f"UpperArm_Body_{suffix}", (x, 0, 1.43*s), (side*.5*shoulders, 0, 1.3*s), .085*limb, rig, f"upperArm{suffix}", mats["body"])
        ellipsoid(f"Elbow_Joint_{suffix}", (side*.52*shoulders, 0, 1.28*s), (.09*limb, .09*limb, .09*limb), rig, f"forearm{suffix}", mats["armor"])
        cylinder(f"Forearm_Armor_{suffix}", (side*.53*shoulders, 0, 1.26*s), (side*.72*shoulders, 0, 1.08*s), .09*limb, rig, f"forearm{suffix}", mats["armor"])
        ellipsoid(f"Hand_Skin_{suffix}", (side*.78*shoulders, -.01, 1.02*s), (.09*limb, .07*limb, .11*limb), rig, f"hand{suffix}", mats["skin"])
        leg_x = side * .12 * bulk
        cylinder(f"Thigh_Armor_{suffix}", (leg_x, 0, .9*s), (side*.13*bulk, 0, .58*s), .105*limb, rig, f"thigh{suffix}", mats["body"])
        ellipsoid(f"Knee_Armor_{suffix}", (side*.13*bulk, -.035, .54*s), (.105*limb, .11*limb, .09*limb), rig, f"shin{suffix}", mats["armor"])
        cylinder(f"Shin_Armor_{suffix}", (side*.13*bulk, 0, .5*s), (side*.13*bulk, 0, .18*s), .09*limb, rig, f"shin{suffix}", mats["boot"])
        box(f"Boot_Foot_{suffix}", (side*.13*bulk, -.085, .09*s), (.105*limb, .18, .07), rig, f"foot{suffix}", mats["boot"], .025)
    ellipsoid("Neck_Undersuit", (0, 0, 1.62*s), (.075, .07, .105), rig, "neck", mats["under"])
    ellipsoid("Head_Skin", (0, -.01, 1.76*s), (.125, .11, .16), rig, "head", mats["skin"] if not robotic else mats["body"])
    add_character_details(fid, cfg, rig, mats)


def add_character_details(fid, cfg, rig, m):
    s, sh = cfg["height"], cfg["shoulder"]
    if fid == "mim":
        box("Mask_Armor", (0, -.095, 1.77*s), (.105, .035, .13), rig, "head", m["body"], .025)
        box("Eye_Visor", (0, -.132, 1.8*s), (.075, .009, .012), rig, "head", m["eye"], .004)
        for side in (-1, 1):
            box(f"Ceramic_Hip_Skirt_{side}", (side*.16, -.01, .86*s), (.09, .04, .25), rig, "hips", m["body"], .025, (0, side*.16, side*.16))
            torus(f"Purple_Shoulder_Ring_{side}", (side*.25*sh, 0, 1.49*s), .095, .018, (math.pi/2, 0, 0), rig, "chest", m["eye"])
    elif fid == "glitch":
        box("Glitch_Helmet", (0, -.005, 1.77*s), (.135, .12, .15), rig, "head", m["body"], .035)
        box("Glitch_Visor", (0, -.124, 1.8*s), (.105, .012, .025), rig, "head", m["eye"], .005)
        for i in range(6):
            cone(f"Hair_Fin_{i}", (0, .04+i*.025, (1.87+i*.035)*s), .045, .19, (math.pi/2+.18, 0, 0), rig, "head", m["hair"])
        for x in (-.12, 0, .12):
            box(f"Digital_Chest_Line_{x}", (x, -.17, 1.42*s), (.012, .009, .12), rig, "chest", m["eye"], .003)
    elif fid == "lucky":
        for i in range(-3, 4):
            cone(f"Hair_Strand_{i}", (i*.035, .015, (1.88+abs(i)*.012)*s), .035, .19-abs(i)*.012, (.35, 0, -i*.16), rig, "head", m["hair"])
        for side in (-1, 1):
            torus(f"Gold_Glasses_{side}", (side*.054, -.112, 1.79*s), .038, .006, (math.pi/2, 0, 0), rig, "head", m["eye"])
            box(f"Long_Coat_Tail_{side}", (side*.13, .045, 1.03*s), (.13, .045, .43), rig, "spine", m["body"], .025, (.08, side*.04, side*.07))
            box(f"Green_Coat_Lining_{side}", (side*.13, -.006, 1.02*s), (.105, .012, .34), rig, "spine", m["armor"], .015, (.08, side*.04, side*.07))
        box("Gold_Coat_Collar", (0, -.165, 1.48*s), (.2, .025, .12), rig, "chest", m["eye"], .018)
    elif fid == "vorgh":
        ellipsoid("Demon_Jaw", (0, -.13, 1.68*s), (.17, .16, .12), rig, "head", m["armor"])
        for side in (-1, 1):
            cone(f"Horn_{side}", (side*.1, .01, 1.91*s), .055, .34, (-.42, side*.2, side*-.55), rig, "head", m["boot"])
            for i in range(3):
                cone(f"Shoulder_Spike_{side}_{i}", (side*(.3+i*.045)*sh, .01, (1.56-i*.025)*s), .035, .2-i*.02, (0, side*-.8, 0), rig, "shoulderL" if side < 0 else "shoulderR", m["armor"])
            for i in range(4):
                cone(f"Hand_Claw_{side}_{i}", (side*(.79+i*.018)*sh, -.07+i*.025, 1.0*s), .014, .13, (math.pi/2, 0, side*.12), rig, "handL" if side < 0 else "handR", m["hair"])
        for i in range(4):
            cone(f"Back_Spike_{i}", (0, .14, (1.5-i*.14)*s), .045, .22-i*.025, (math.pi/2, 0, 0), rig, "chest" if i < 2 else "spine", m["armor"])
    elif fid == "titan":
        box("Titan_Head_Block", (0, 0, 1.75*s), (.13, .13, .13), rig, "head", m["boot"], .025)
        box("Titan_Visor", (0, -.133, 1.78*s), (.09, .012, .018), rig, "head", m["eye"], .004)
        torus("Titan_Reactor_Ring", (0, -.19, 1.42*s), .09, .025, (math.pi/2, 0, 0), rig, "chest", m["eye"])
        for side in (-1, 1):
            suffix = "L" if side < 0 else "R"
            box(f"Titan_Shoulder_Block_{suffix}", (side*.32*sh, 0, 1.5*s), (.2*sh, .19, .16), rig, f"shoulder{suffix}", m["armor"], .04)
            box(f"Titan_Forearm_Block_{suffix}", (side*.63*sh, 0, 1.17*s), (.14, .14, .2), rig, f"forearm{suffix}", m["armor"], .035)
            cylinder(f"Titan_Piston_{suffix}", (side*.23*sh, .14, 1.38*s), (side*.49*sh, .12, 1.22*s), .024, rig, f"upperArm{suffix}", m["eye"], 8)
        for x in (-.12, .12):
            box(f"Titan_Chest_Marking_{x}", (x, -.18, 1.55*s), (.055, .01, .018), rig, "chest", m["hair"], .002)


def export_fighter(fid):
    reset_scene()
    cfg = FIGHTERS[fid]
    mats = create_materials(fid)
    rig = create_rig(cfg)
    import_human_base(fid, cfg, rig, mats["under"] if fid != "lucky" else mats["skin"])
    build_humanoid(fid, cfg, rig, mats)
    bpy.ops.object.select_all(action="SELECT")
    output = OUTPUT / f"yzx-{fid}.glb"
    bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_animations=False,
        export_skins=True,
        export_morph=False,
        export_yup=True,
    )
    print(f"YZX_EXPORT {fid}: {output.stat().st_size / 1048576:.2f} MB")


for fighter_id in FIGHTERS:
    export_fighter(fighter_id)

print("YZX_EXPORT_COMPLETE")
