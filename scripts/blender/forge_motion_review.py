"""Verify runtime FK and derive a local floor correction from evaluated sole geometry."""
import math
import bpy
from mathutils import Quaternion, Vector
from forge_motion_math import JOINTS, PARENTS, CONVERT, canonical_rest, rotation

def audit(target, frames):
    bones = {b.name.split(':')[-1]: b for b in target.pose.bones}
    pivots = {j: bones['Spine' if j == 'torso' else n].bone.head_local.copy()
              for j, n in JOINTS.items()}
    offsets = {j: CONVERT @ (p - pivots[PARENTS[j]] if PARENTS[j] else p)
               for j, p in pivots.items()}
    for j in ('leftForearm', 'rightForearm'):
        offsets[j] = Vector((0, -.3, 0))
    positions = {j: [] for j in JOINTS}
    soles = {'LeftLeg': [], 'RightLeg': []}
    ground_offsets = []
    error_angle = error_position = 0.0
    meshes = [o for o in target.children if o.type == 'MESH']
    for index, frame in enumerate(frames):
        bpy.context.scene.frame_set(index + 1)
        bpy.context.view_layer.update()
        worlds = {}
        points = {}
        for j in JOINTS:
            q = frame[j]
            local = Quaternion((q[3], q[0], q[1], q[2]))
            parent = PARENTS[j]
            worlds[j] = worlds[parent] @ local if parent else local
            points[j] = points[parent] + worlds[parent] @ offsets[j] if parent else offsets[j]
            positions[j].append(list(points[j]))
            bone = bones['Spine' if j == 'torso' else JOINTS[j]]
            actual = rotation(bone.matrix) @ rotation(bone.bone.matrix_local).inverted()
            expected = CONVERT.inverted() @ (worlds[j].to_matrix()
                        @ canonical_rest(j).inverted()) @ CONVERT
            # acos of quaternion dot is stable around identity at float32 precision.
            dot = min(1., abs(actual.to_quaternion().dot(expected.to_quaternion())))
            error_angle = max(error_angle, 2 * math.acos(dot))
            error_position = max(error_position, (CONVERT @ bone.head - points[j]).length)
        frame_soles = {}
        for obj in meshes:
            evaluated = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
            mesh = evaluated.to_mesh()
            for side in soles:
                group = obj.vertex_groups.get('mixamorig:' + side)
                if group:
                    heights = [(evaluated.matrix_world @ mesh.vertices[v.index].co).z
                               for v in obj.data.vertices if any(g.group == group.index for g in v.groups)]
                    if heights:
                        minimum = min(heights)
                        soles[side].append(minimum)
                        frame_soles[side] = min(frame_soles.get(side, minimum), minimum)
            evaluated.to_mesh_clear()
        if set(frame_soles) != set(soles) or not all(math.isfinite(h) for h in frame_soles.values()):
            raise ValueError(f'Missing or invalid evaluated sole geometry at frame {index + 1}')
        # Target-model units, before the runtime presentation scale. This can
        # lower a floating stance or lift a penetrating one; it is not captured
        # root translation and never changes authoritative world locomotion.
        ground_offsets.append(-min(frame_soles.values()))
    # The review skeleton is deliberately denser than runtime; this check catches
    # missed collapsed chains, stale keyed parent transforms and doubled rest offsets.
    if error_position > 1e-4 or error_angle > .002:
        raise ValueError(f'Review/runtime FK disagree: {error_position} m, {error_angle} rad')
    return {'maxReviewRuntimePositionError': error_position,
            'maxReviewRuntimeAngleErrorRadians': error_angle,
            'rootLocked': True,
            'groundingPolicy': 'Local presentation floor offset from both evaluated soles; no world locomotion or IK',
            'groundOffsets': ground_offsets,
            'soleHeightBlenderMeters': {n: {'min': min(v), 'max': max(v)} for n, v in soles.items() if v},
            'runtimeJointRangesYUp': {j: {'min': [min(p[i] for p in values) for i in range(3)],
                                         'max': [max(p[i] for p in values) for i in range(3)]}
                                        for j, values in positions.items()}}
