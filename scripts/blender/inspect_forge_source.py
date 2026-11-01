"""Inspect actual FBX rest axes and sampled world-space limb directions in Blender."""
import json
import sys
import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=sys.argv[sys.argv.index('--') + 1], automatic_bone_orientation=False)
rig = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
scene = bpy.context.scene
action = rig.animation_data.action
start, end = action.frame_range
names = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head', 'LeftShoulder',
         'LeftArm', 'LeftForeArm', 'LeftHand', 'RightArm', 'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'LeftToeBase']
lookup = {b.name.split(':')[-1]: b for b in rig.pose.bones}
def xyz(v): return [round(x, 5) for x in v]
print('SOURCE_REST', json.dumps({n: {'head': xyz(rig.matrix_world @ lookup[n].bone.head_local),
      'direction': xyz((rig.matrix_world.to_3x3() @ (lookup[n].bone.tail_local - lookup[n].bone.head_local)).normalized()),
      'parent': lookup[n].parent.name if lookup[n].parent else None} for n in names}))
print('SOURCE_TIMING', scene.render.fps, scene.render.fps_base, list(action.frame_range))
for f in [start, start + (end-start)*.25, start + (end-start)*.5, end]:
    scene.frame_set(int(f), subframe=f-int(f))
    print('SOURCE_SAMPLE', f, json.dumps({n: xyz((rig.matrix_world.to_3x3() @ lookup[n].matrix.to_3x3().col[1]).normalized())
          for n in ['LeftArm', 'LeftForeArm', 'LeftUpLeg', 'LeftLeg']}))
