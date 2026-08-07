"""Render quick neutral previews of the generated GLBs for visual QA."""

from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
MODELS = ROOT / "public" / "models"
OUTPUT = ROOT / ".shots" / "blender-models"
OUTPUT.mkdir(parents=True, exist_ok=True)


def clear():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def aim(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def render(fid):
    clear()
    bpy.ops.import_scene.gltf(filepath=str(MODELS / f"yzx-{fid}.glb"))
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    low = Vector((999, 999, 999))
    high = Vector((-999, -999, -999))
    for mesh in meshes:
        for corner in mesh.bound_box:
            world = mesh.matrix_world @ Vector(corner)
            low.x, low.y, low.z = min(low.x, world.x), min(low.y, world.y), min(low.z, world.z)
            high.x, high.y, high.z = max(high.x, world.x), max(high.y, world.y), max(high.z, world.z)
    centre = (low + high) / 2
    height = max(.5, high.z - low.z)

    bpy.ops.object.camera_add(location=(centre.x + height * .9, centre.y - height * 2.3, centre.z + height * .12))
    camera = bpy.context.object
    camera.data.lens = 62
    aim(camera, (centre.x, centre.y, centre.z + height * .03))
    bpy.context.scene.camera = camera

    for location, energy, size, colour in [
        ((-3, -4, 5), 1100, 4, (1.0, .72, .55)),
        ((4, 1, 4), 900, 3, (.3, .55, 1.0)),
        ((0, 3, 5), 700, 3, (.7, .8, 1.0)),
    ]:
        bpy.ops.object.light_add(type="AREA", location=location)
        light = bpy.context.object
        light.data.energy = energy
        light.data.shape = "DISK"
        light.data.size = size
        light.data.color = colour
        aim(light, centre)

    bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, low.z - .015))
    floor = bpy.context.object
    mat = bpy.data.materials.new("Preview_Floor")
    mat.diffuse_color = (.018, .022, .03, 1)
    mat.roughness = .72
    floor.data.materials.append(mat)

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 700
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.world.color = (.008, .01, .018)
    scene.render.filepath = str(OUTPUT / f"{fid}.png")
    bpy.ops.render.render(write_still=True)
    print(f"YZX_PREVIEW {fid}")


for fighter in ("mim", "glitch", "lucky", "vorgh", "titan"):
    render(fighter)
