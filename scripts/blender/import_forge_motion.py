"""Retarget supplied Mixamo FBX; export rotations and geometry-derived local floor offsets.
Blender --background --python scripts/blender/import_forge_motion.py -- --help
No acquisition, generated animation, world locomotion, or combat timing changes.
"""
import argparse
import hashlib
import json
from pathlib import Path
import sys
import bpy

sys.path.insert(0, str(Path(__file__).resolve().parent))
from forge_motion_math import (JOINTS, basis, rotation, runtime_rotations,
                               review_deform, verify_rest_contract)
from forge_motion_review import audit

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--input', required=True, type=Path)
parser.add_argument('--variant', choices=['ion', 'cinder'], required=True)
parser.add_argument('--name', required=True, help='Output clip ID; letters, digits, dash, underscore')
parser.add_argument('--source-url', required=True)
parser.add_argument('--license-note', required=True)
parser.add_argument('--start', type=int, help='Inclusive source frame (before rebasing to frame 1)')
parser.add_argument('--end', type=int, help='Inclusive source frame; trim multi-strike takes here')
parser.add_argument('--review-only', action='store_true', help='Keep JSON outside public for offline diagnostics')
args = parser.parse_args(sys.argv[sys.argv.index('--')+1:])
if not args.name or any(not (c.isalnum() or c in '-_') for c in args.name):
    raise ValueError('Invalid clip ID')
if args.input.suffix.lower() != '.fbx' or not args.input.is_file():
    raise ValueError('Supply an actual downloaded FBX')
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'assets/forge/forge-heroes-rigged.blend'))
target = bpy.data.objects[args.variant+'_rig']
before = set(bpy.data.objects)
bpy.ops.import_scene.fbx(filepath=str(args.input.resolve()), automatic_bone_orientation=False)
imported = set(bpy.data.objects)-before
sources = [o for o in imported if o.type == 'ARMATURE' and o.animation_data and o.animation_data.action]
if len(sources) != 1: raise ValueError('Expected one animated source skeleton')
source = sources[0]
by_name = {b.name.split(':')[-1]: b for b in source.pose.bones}
missing = set(JOINTS.values())-set(by_name)
missing |= {'LeftToeBase', 'LeftFoot'}-set(by_name)
if missing: raise ValueError('Unsupported skeleton; missing '+', '.join(sorted(missing)))
action = source.animation_data.action
start, end = map(int, action.frame_range)
source_range = [start, end]
start = args.start if args.start is not None else start
end = args.end if args.end is not None else end
if not source_range[0] <= start < end <= source_range[1]:
    raise ValueError('Trim must lie within source action range '+str(source_range))
if end <= start: raise ValueError('Source contains no animation interval')
scene = bpy.context.scene
fps = scene.render.fps / scene.render.fps_base

target_lookup = {b.name.split(':')[-1]: b for b in target.pose.bones}
align = basis(target, target_lookup) @ basis(source, by_name).inverted()
frames = []
verify_rest_contract()
previous = {}
samples = []
target.animation_data_clear()
for frame in range(start, end+1):
    scene.frame_set(frame)
    deforms = {}
    for name, bone in by_name.items():
        posed = source.matrix_world @ bone.matrix
        rest = source.matrix_world @ bone.bone.matrix_local
        delta = rotation(posed) @ rotation(rest).inverted()
        deforms[name] = align @ delta @ align.inverted()
    # Parent-first target pose matrices remove source translations and scale.
    desired_matrices = {}
    for bone in target.pose.bones:
        name = bone.name.split(':')[-1]
        delta = review_deform(name, deforms)
        desired = delta.to_4x4() @ bone.bone.matrix_local
        desired.translation = bone.bone.head_local
        if bone.parent:
            # Preserve target segment length while following the animated parent.
            offset = bone.parent.bone.matrix_local.inverted() @ bone.bone.matrix_local
            desired.translation = (desired_matrices[bone.parent.name] @ offset).translation
        desired_matrices[bone.name] = desired
        # Convert desired armature-space matrix into the bone's basis without
        # reading a partly updated dependency graph or an old keyed parent pose.
        local = bone.bone.matrix_local.inverted() @ desired
        if bone.parent:
            local = (bone.bone.matrix_local.inverted() @ bone.parent.bone.matrix_local
                     @ desired_matrices[bone.parent.name].inverted() @ desired)
        bone.rotation_mode = 'QUATERNION'
        bone.rotation_quaternion = local.to_quaternion().normalized()
        bone.keyframe_insert(data_path='rotation_quaternion', frame=frame-start+1)
    rotations = {}
    for joint, q in runtime_rotations(deforms).items():
        if joint in previous and q.dot(previous[joint]) < 0: q.negate()
        previous[joint] = q.copy()
        rotations[joint] = [round(q.x,7),round(q.y,7),round(q.z,7),round(q.w,7)]
    frames.append(rotations)
    # Source end-effector trajectories are evidence for trim/contact selection,
    # not automatically approved gameplay contact intervals.
    origin = source.matrix_world @ by_name['Hips'].matrix.translation
    points = {}
    for name in ('LeftHand', 'RightHand', 'LeftFoot', 'RightFoot'):
        if name in by_name:
            p = align @ (source.matrix_world @ by_name[name].matrix.translation - origin)
            points[name] = [round(v, 6) for v in p]
    samples.append({'frame': frame, 'effectorsBlenderRelativeToHips': points})
review = ROOT/'assets/forge/motion-review'; review.mkdir(parents=True, exist_ok=True)
out = review if args.review_only else ROOT/'public/animations/forge'
out.mkdir(parents=True, exist_ok=True)
payload = {'version':1,'rotationSpace':'forge-canonical-local-v2',
           'id':args.name,'variant':args.variant,'duration':(end-start)/fps,
           'fps':fps,'rootMotion':False,'frames':frames,
           'sourceFrames':{'original':source_range,'trim':[start,end]},
           'source':{'url':args.source_url,'licenseNote':args.license_note,
                     'file':args.input.name,'sha256':hashlib.sha256(args.input.read_bytes()).hexdigest()}}
bpy.ops.object.select_all(action='DESELECT')
target.select_set(True)
for obj in target.children:
    if obj.type == 'MESH': obj.select_set(True)
scene.frame_start = 1; scene.frame_end = end-start+1
scene.frame_set(1)
report = audit(target, frames)
payload['groundOffsets'] = report['groundOffsets']
if len(payload['groundOffsets']) != len(frames):
    raise ValueError('Ground offset count must match rotation frame count')
(review/(args.name+'-audit.json')).write_text(json.dumps(report, indent=2), encoding='utf-8')
(out/(args.name+'.json')).write_text(json.dumps(payload,separators=(',',':')),encoding='utf-8')
(review/(args.name+'-source-samples.json')).write_text(json.dumps({
    'fps':fps,'upAxis':'Z','forwardAxis':'-Y','samples':samples}, indent=2), encoding='utf-8')
scene.frame_set(1)
bpy.ops.export_scene.gltf(filepath=str(review/(args.name+'.glb')),use_selection=True,
                          export_format='GLB',export_animations=True,export_force_sampling=True,
                          export_animation_mode='ACTIVE_ACTIONS')
print('Imported real source:', args.input.name, '->', out/(args.name+'.json'))
