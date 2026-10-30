"""Author pass-two articulated hero shells. Local Y-up coordinates become Blender Z-up.
Run with Blender --background --python scripts/blender/build_forge_heroes.py.
This produces assets only; it does not render or validate the game.
"""
from pathlib import Path
import math
import bpy
from mathutils import Vector
ROOT = Path(__file__).resolve().parents[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0

def material(name, color, metal, rough, emission=0):
    m = bpy.data.materials.new(name); m.diffuse_color = (*color, 1); m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    for key, value in [('Base Color', (*color, 1)), ('Metallic', metal), ('Roughness', rough), ('Emission Color', (*color, 1)), ('Emission Strength', emission)]:
        p.inputs[key].default_value = value
    return m

steel = material('Ion midnight titanium', (.055,.105,.19), .86,.25)
edge = material('Machined silver bevels', (.32,.4,.5), .9,.25)
black = material('Graphite flex joints', (.018,.025,.035), .35,.6)
blue = material('Cobalt ion channels', (.005,.28,1), .5,.22, 4)
rock = material('Obsidian volcanic plates', (.10,.045,.025), .5,.38)
ember = material('Exposed molten core', (1,.10,.003), .2,.3, 3.5)
brass = material('Cinder edge metal', (.27,.12,.055), .75,.3)
parts=[]

def loft(name, rings, mat, sides=20):
    verts=[]; faces=[]
    for y,rx,rz,dx,dz in rings:
        for j in range(sides):
            a=j*math.tau/sides
            # Flatten front/back panels slightly: broad cast planes, rounded edges.
            x=math.copysign(abs(math.cos(a))**.8, math.cos(a))*rx
            z=math.copysign(abs(math.sin(a))**.8, math.sin(a))*rz
            verts.append((dx+x, -(dz+z), y))
    for k in range(len(rings)-1):
        for j in range(sides):
            a=k*sides+j; b=k*sides+(j+1)%sides
            faces.append((a,a+sides,b+sides,b))
    faces += [tuple(range(sides)), tuple((len(rings)-1)*sides+j for j in reversed(range(sides)))]
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(verts,[],faces); mesh.update()
    uv=mesh.uv_layers.new(name='SurfaceUV')
    for poly in mesh.polygons:
        for li in poly.loop_indices:
            vi=mesh.loops[li].vertex_index; uv.data[li].uv=((vi%sides)/sides,(vi//sides)/max(1,len(rings)-1))
    obj=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(obj); obj.data.materials.append(mat)
    for p in mesh.polygons: p.use_smooth=True
    bevel=obj.modifiers.new('Forged bevels','BEVEL'); bevel.width=.004; bevel.segments=2
    normal=obj.modifiers.new('Weighted normals','WEIGHTED_NORMAL'); normal.keep_sharp=True
    parts.append(obj); return obj

def shell(name, center, size, mat):
    x,y,z=center; rx,h,rz=size
    return loft(name,[(y-h/2,rx*.72,rz*.72,x,z),(y-h*.36,rx,rz,x,z),(y+h*.36,rx,rz,x,z),(y+h/2,rx*.72,rz*.72,x,z)],mat)

def rail(name, points, radius, mat):
    # Round inset piping follows the plate rather than floating rectangular bars.
    cu=bpy.data.curves.new(name,'CURVE'); cu.dimensions='3D'; cu.bevel_depth=radius; cu.bevel_resolution=2
    sp=cu.splines.new('POLY'); sp.points.add(len(points)-1)
    for p,(x,y,z) in zip(sp.points,points): p.co=(x,-z,y,1)
    obj=bpy.data.objects.new(name,cu); bpy.context.collection.objects.link(obj); obj.data.materials.append(mat); parts.append(obj)

def finish(name):
    bpy.ops.object.select_all(action='DESELECT')
    for obj in parts:
        obj.select_set(True); bpy.context.view_layer.objects.active=obj
        if obj.type=='CURVE': bpy.ops.object.convert(target='MESH')
        for mod in list(obj.modifiers): bpy.ops.object.modifier_apply(modifier=mod.name)
        obj.select_set(False)
    for obj in parts: obj.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]; bpy.ops.object.join()
    bpy.context.object.name=name; parts.clear()

for variant,plate,trim,glow in [('ion',steel,edge,blue),('cinder',rock,brass,ember)]:
    demon=variant=='cinder'
    # Complete continuous core behind the separately articulated extremities.
    loft('core',[(-.08,.115,.085,0,0),(.08,.14,.095,0,0),(.25,.18,.12,0,0),(.39,.235,.13,0,0),(.48,.16,.09,0,0),(.56,.055,.055,0,0)],black)
    for side in [-1,1]:
        shell('pectoral',(side*.108,.365,.075),(.116,.19,.075),plate)
        rail('clavicle',[(side*.02,.455,.115),(side*.13,.45,.133),(side*.22,.38,.105)],.006,glow)
        for i in range(3):
            shell('rib',(side*(.092-i*.008),.245-i*.069,.065),(.075,.065,.06),plate)
            rail('rib seam',[(side*.025,.25-i*.069,.126),(side*.13,.225-i*.069,.105)],.0035,glow)
        shell('back panel',(side*.1,.32,-.095),(.09,.29,.045),plate)
    if demon:
        for side in [-1,1]:
            for i in range(4):
                loft('thorax barb',[(.38-i*.08,.036,.03,side*.16,-.065),(.45-i*.08,.025,.022,side*.23,-.11),(.51-i*.08,.001,.001,side*.25,-.17)],plate,10)
    if demon:
        for side in [-1,1]:
            rail('branching magma',[(side*.035,.40,.147),(side*.065,.35,.154),(side*.04,.30,.145),(side*.11,.265,.132),(side*.075,.21,.131),(side*.13,.16,.103)],.0045,glow)
            rail('magma fork',[(side*.065,.35,.154),(side*.125,.33,.151),(side*.155,.37,.143)],.003,glow)
    finish(variant+'_torso')
    shell('pelvic core',(0,-.04,0),(.16,.22,.11),black)
    for side in [-1,1]:
        shell('hip flanks',(side*.105,-.07,.035),(.08,.19,.09),plate)
    shell('codpiece',(0,-.12,.09),(.075,.20,.04),trim)
    rail('belt',[(-.14,.025,.07),(0,.04,.12),(.14,.025,.07)],.008,glow)
    finish(variant+'_pelvis')
    loft('helmet',[(-.13,.05,.065,0,.015),(-.08,.09,.092,0,.01),(.025,.104,.1,0,0),(.105,.075,.08,0,-.01),(.13,.025,.035,0,-.02)],plate)
    shell('jaw guard',(0,-.075,.08),(.075,.07,.035),trim)
    rail('visor',[(-.085,.01,.07),(-.045,.018,.105),(0,.005,.112),(.045,.018,.105),(.085,.01,.07)],.009 if not demon else .007,glow)
    for side in [-1,1]:
        shell('temple',(side*.095,.015,-.008),(.022,.11,.055),trim)
        if demon:
            loft('swept horn',[(.07,.045,.04,side*.07,-.025),(.18,.04,.035,side*.13,-.06),(.29,.023,.02,side*.15,-.12),(.35,.001,.001,side*.11,-.18)],plate,12)
        else:
            rail('helmet channel',[(side*.075,-.06,.065),(side*.09,.06,.045),(side*.04,.12,-.015)],.004,glow)
    if demon:
        shell('maw recess',(0,-.063,.113),(.070,.05,.013),black)
        for i in range(5):
            x=(i-2)*.026
            loft('obsidian fang',[(-.041,.010,.012,x,.128),(-.078,.001,.001,x,.141)],trim,8)
        rail('molten brow',[(-.08,.04,.083),(-.04,.025,.112),(0,.035,.117),(.04,.025,.112),(.08,.04,.083)],.005,glow)
    finish(variant+'_head')
    shell('deltoid',(0,-.025,0),(.12,.17,.12),black)
    shell('pauldron',(0,.005,.005),(.145,.16,.13),plate)
    rail('shoulder seam',[(-.105,.035,.08),(0,.07,.12),(.105,.035,.08)],.005,glow)
    shell('bicep',(0,-.18,0),(.075,.24,.075),plate)
    if demon:
        for i in range(3):
            loft('shoulder spike',[(.015,.037,.03,(i-1)*.09,-.025),(.10,.025,.025,(i-1)*.13,-.05),(.19+(.03 if i==1 else 0),.001,.001,(i-1)*.16,-.12)],plate,10)
    finish(variant+'_arm')
    shell('elbow',(0,0,0),(.075,.10,.075),trim)
    shell('forearm core',(0,-.14,0),(.068,.27,.07),black)
    loft('gauntlet',[(-.27,.058,.062,0,0),(-.21,.09,.085,0,.01),(-.09,.095,.085,0,.01),(-.035,.065,.065,0,0)],plate)
    for side in [-1,1]: rail('bracer channel',[(side*.06,-.23,.055),(side*.075,-.10,.068)],.004,glow)
    shell('fist',(0,-.315,.02),(.075,.10,.077),black)
    for i in range(4):
        shell('finger',((i-1.5)*.033,-.335,.07),(.017,.075,.025),trim if not demon else plate)
        if demon: loft('claw',[(-.35,.012,.014,(i-1.5)*.034,.085),(-.405,.008,.009,(i-1.5)*.034,.12),(-.42,.001,.001,(i-1.5)*.034,.14)],trim,8)
    finish(variant+'_forearm')
    shell('thigh core',(0,-.18,0),(.09,.38,.09),black)
    shell('cuisses',(0,-.18,.04),(.095,.30,.075),plate)
    rail('thigh channel',[(-.065,-.05,.085),(-.075,-.23,.095),(-.045,-.31,.085)],.005,glow)
    finish(variant+'_thigh')
    shell('knee',(0,0,.035),(.085,.13,.09),trim)
    shell('calf core',(0,-.19,0),(.075,.35,.075),black)
    loft('greave',[(-.36,.057,.065,0,.01),(-.28,.08,.08,0,.02),(-.1,.09,.092,0,.025),(-.035,.065,.07,0,.02)],plate)
    rail('shin channel',[(0,-.075,.12),(0,-.28,.1),(0,-.35,.07)],.005,glow)
    shell('boot',(0,-.405,.075),(.083,.12,.16),plate)
    for i in range(3): shell('toe',((i-1)*.052,-.425,.20),(.027,.075,.06),trim)
    finish(variant+'_shin')

(ROOT/'assets/forge').mkdir(parents=True,exist_ok=True)
(ROOT/'public/environment').mkdir(parents=True,exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/forge/forge-heroes.blend'))
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/environment/forge-heroes.glb'),export_format='GLB',export_apply=True,export_animations=False)
