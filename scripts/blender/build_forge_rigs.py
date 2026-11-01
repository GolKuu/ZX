"""Assemble original modular armor into rigid-skinned Mixamo-named T-pose rigs.
Run after build_forge_heroes.py. Does not add or synthesize animation.
"""
from pathlib import Path
import math
import bpy
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'assets/forge/forge-heroes.blend'))
sources = {o.name: o for o in bpy.data.objects if o.type == 'MESH'}


def point(x, y, z=0):
    return Vector((x, -z, y))


def build(variant, shoulders, limbs, bulk, head_size):
    bpy.ops.object.select_all(action='DESELECT')
    data = bpy.data.armatures.new(variant+' deform skeleton')
    rig = bpy.data.objects.new(variant+'_rig', data); bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig; rig.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bones = {}

    def bone(name, start, end, parent=None):
        b = data.edit_bones.new('mixamorig:'+name); b.head = start; b.tail = end
        if parent: b.parent = bones[parent]
        bones[name] = b

    bone('Hips', point(0,.86), point(0,1.02))
    bone('Spine', point(0,1.02), point(0,1.23), 'Hips')
    bone('Spine1', point(0,1.23), point(0,1.42), 'Spine')
    bone('Spine2', point(0,1.42), point(0,1.52), 'Spine1')
    bone('Neck', point(0,1.52), point(0,1.64), 'Spine2')
    bone('Head', point(0,1.64), point(0,1.84), 'Neck')
    pieces = [('pelvis','Hips',point(0,.86),0,(limbs,bulk,1)),
              ('torso','Spine',point(0,1.02),0,(shoulders,bulk,1)),
              ('head','Head',point(0,1.64),0,(head_size,)*3)]
    for side, sign in [('Left',-1),('Right',1)]:
        x = sign*.205*shoulders; hip = sign*.115*limbs
        bone(side+'Shoulder',point(sign*.065,1.42),point(x,1.42),'Spine2')
        bone(side+'Arm',point(x,1.42),point(x+sign*.3,1.42),side+'Shoulder')
        bone(side+'ForeArm',point(x+sign*.3,1.42),point(x+sign*.57,1.42),side+'Arm')
        bone(side+'Hand',point(x+sign*.57,1.42),point(x+sign*.67,1.42),side+'ForeArm')
        bone(side+'UpLeg',point(hip,.76),point(hip,.36),'Hips')
        bone(side+'Leg',point(hip,.36),point(hip,-.005),side+'UpLeg')
        bone(side+'Foot',point(hip,-.005),point(hip,-.045,.20),side+'Leg')
        bone(side+'ToeBase',point(hip,-.045,.20),point(hip,-.045,.28),side+'Foot')
        pieces += [('arm',side+'Arm',point(x,1.42),-sign*math.pi/2,(limbs,limbs,1)),
                   ('forearm',side+'ForeArm',point(x+sign*.3,1.42),-sign*math.pi/2,(limbs,limbs,1)),
                   ('thigh',side+'UpLeg',point(hip,.76),0,(limbs,limbs,1)),
                   ('shin',side+'Leg',point(hip,.36),0,(limbs,limbs,1))]
    bpy.ops.object.mode_set(mode='OBJECT')
    meshes = []
    for piece, joint, position, angle, scale in pieces:
        src = sources[variant+'_'+piece]
        obj = bpy.data.objects.new(variant+'_'+joint+'_armor',src.data.copy())
        bpy.context.collection.objects.link(obj)
        transform = Matrix.Translation(position) @ Matrix.Rotation(angle,4,'Y') @ Matrix.Diagonal((*scale,1))
        obj.data.transform(transform)
        group = obj.vertex_groups.new(name='mixamorig:'+joint)
        group.add(list(range(len(obj.data.vertices))),1,'REPLACE')
        obj.parent = rig
        mod = obj.modifiers.new('Rigid armor skin','ARMATURE'); mod.object = rig
        meshes.append(obj)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in meshes: obj.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]; bpy.ops.object.join()
    body = bpy.context.object; body.name = variant+'_skinned_armor'
    rig['motion_status'] = 'T-pose only; no captured clips supplied'
    rig['weighting'] = 'Rigid armor segments; hands and boots follow forearm and shin'
    bpy.ops.object.select_all(action='DESELECT'); rig.select_set(True); body.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.export_scene.gltf(filepath=str(ROOT/f'assets/forge/forge-{variant}-rigged.glb'),
                              export_format='GLB',use_selection=True,export_animations=False)
    bpy.ops.export_scene.fbx(filepath=str(ROOT/f'assets/forge/forge-{variant}-tpose.fbx'),
                             use_selection=True,object_types={'ARMATURE','MESH'},
                             add_leaf_bones=False,bake_anim=False,axis_forward='-Z',axis_up='Y')


build('ion',1.02,.94,.95,.94)
build('cinder',1.45,1.38,1.42,.96)
for source in sources.values(): bpy.data.objects.remove(source,do_unlink=True)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/forge/forge-heroes-rigged.blend'))
