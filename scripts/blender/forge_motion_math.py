"""Rotation-only retarget to ForgeHeroSkeleton's collapsed, arms-down group axes."""
import math
from mathutils import Matrix

JOINTS = {'hips': 'Hips', 'torso': 'Spine2', 'head': 'Head',
          'leftArm': 'LeftArm', 'leftForearm': 'LeftForeArm',
          'rightArm': 'RightArm', 'rightForearm': 'RightForeArm',
          'leftLeg': 'LeftUpLeg', 'leftShin': 'LeftLeg',
          'rightLeg': 'RightUpLeg', 'rightShin': 'RightLeg'}
PARENTS = {'hips': None, 'torso': 'hips', 'head': 'torso',
           'leftArm': 'torso', 'rightArm': 'torso', 'leftForearm': 'leftArm',
           'rightForearm': 'rightArm', 'leftLeg': 'hips', 'rightLeg': 'hips',
           'leftShin': 'leftLeg', 'rightShin': 'rightLeg'}
CONVERT = Matrix(((1, 0, 0), (0, 0, 1), (0, -1, 0)))

def rotation(matrix):
    # FBX object scale (often .01) must never enter quaternion extraction.
    return matrix.to_quaternion().normalized().to_matrix()

def basis(armature, lookup):
    def rest(n): return armature.matrix_world @ lookup[n].bone.head_local
    up = (rest('Head') - rest('Hips')).normalized()
    left = rest('LeftArm') - rest('RightArm')
    left -= up * left.dot(up)
    left.normalize()
    # Labels in the modular runtime put Left at -X; Mixamo puts Left at +X.
    # Derive FRONT from the actual toes, not a cross product which would turn
    # every punch backwards. This basis may be reflected; A D A^-1 still yields
    # a proper rotation and preserves named limbs without mirroring the mesh.
    forward = rest('LeftToeBase') - rest('LeftFoot')
    forward -= up * forward.dot(up) + left * forward.dot(left)
    if forward.length < 1e-6: raise ValueError('Cannot determine source facing from toes')
    forward.normalize()
    return Matrix((left, forward, up)).transposed()

def canonical_rest(joint):
    # Geometry in both runtime rigs runs along -Y. Authored T-pose arms run
    # along -X (left) / +X (right); forearms inherit the SAME world frame.
    if joint in ('leftArm', 'leftForearm'):
        return Matrix.Rotation(-math.pi / 2, 3, 'Z')
    if joint in ('rightArm', 'rightForearm'):
        return Matrix.Rotation(math.pi / 2, 3, 'Z')
    return Matrix.Identity(3)

def runtime_rotations(deforms):
    worlds = {joint: CONVERT @ deforms[name] @ CONVERT.inverted() @ canonical_rest(joint)
              for joint, name in JOINTS.items()}
    return {joint: (worlds[PARENTS[joint]].inverted() @ world if PARENTS[joint] else world)
            .to_quaternion().normalized() for joint, world in worlds.items()}

def verify_rest_contract():
    rest = runtime_rotations({name: Matrix.Identity(3) for name in JOINTS.values()})
    worlds = {}
    for joint in JOINTS:
        parent = PARENTS[joint]
        worlds[joint] = worlds[parent] @ rest[joint] if parent else rest[joint]
        expected = canonical_rest(joint).to_quaternion()
        assert worlds[joint].rotation_difference(expected).angle < 1e-5, joint
    # No double T-pose correction on the elbow's local frame.
    assert rest['leftForearm'].angle < 1e-5 and rest['rightForearm'].angle < 1e-5

def review_deform(name, deforms):
    # The review rig has more bones, but rigid parts must follow exactly the
    # same collapsed transforms as runtime (no extra clavicle/neck animation).
    if name in ('Spine', 'Spine1', 'Spine2', 'Neck'):
        return deforms['Spine2']
    if name.endswith('Shoulder'):
        return deforms['Spine2']
    if name.endswith('Hand'):
        return deforms[name.replace('Hand', 'ForeArm')]
    if name.endswith(('Foot', 'ToeBase')):
        return deforms[name.replace('ToeBase', 'Leg').replace('Foot', 'Leg')]
    return deforms.get(name, Matrix.Identity(3))
