from pathlib import Path
import bpy, math
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
(ROOT/'assets/forge').mkdir(parents=True,exist_ok=True)
(ROOT/'public/environment').mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
def mat(name,c,metal=.7,rough=.3,emit=0):
 m=bpy.data.materials.new(name); m.diffuse_color=(*c,1); m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*c,1); p.inputs['Metallic'].default_value=metal; p.inputs['Roughness'].default_value=rough
 p.inputs['Emission Color'].default_value=(*c,1); p.inputs['Emission Strength'].default_value=emit
 return m
steel=mat('Brushed titanium',(.16,.21,.29)); gold=mat('Aged champagne bronze',(.48,.29,.10)); rock=mat('Volcanic ceramic',(.12,.075,.055),.25,.48)
blue=mat('Ion channels',(.01,.48,1),.4,.22,3); lava=mat('Molten seams',(1,.085,.008),.2,.3,3)
stone=mat('Cut basalt',(.24,.28,.34),.28,.42)
def loft(name, rings, material, sides=12):
 verts=[]; faces=[]
 for y,rx,rz,dx,dz in rings:
  for j in range(sides):
   a=j*math.tau/sides; x=dx+math.cos(a)*rx; z=dz+math.sin(a)*rz
   verts.append((x,-z,y))
 for k in range(len(rings)-1):
  for j in range(sides):
   a=k*sides+j; b=k*sides+(j+1)%sides; faces.append((a,a+sides,b+sides,b))
 faces.extend([tuple(range(sides)),tuple((len(rings)-1)*sides+j for j in reversed(range(sides)))])
 mesh=bpy.data.meshes.new(name); mesh.from_pydata(verts,[],faces); mesh.update()
 uv=mesh.uv_layers.new(name='SurfaceUV')
 for polygon in mesh.polygons:
  for li in polygon.loop_indices:
   vi=mesh.loops[li].vertex_index; uv.data[li].uv=((vi%sides)/sides,(vi//sides)/max(1,len(rings)-1))
 o=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(o); o.data.materials.append(material)
 bevel=o.modifiers.new('Machined edge highlights','BEVEL'); bevel.width=.008; bevel.segments=3
 normal=o.modifiers.new('Weighted plate normals','WEIGHTED_NORMAL'); normal.keep_sharp=True
 return o
for variant,base,glow in [('ion',steel,blue),('cinder',rock,lava)]:
 # Deliberately tapered plates, broad clavicles and narrow abdomen; no inflated sphere torso.
 loft(variant+'_chest',[(.02,.12,.09,0,0),(.14,.17,.115,0,.015),(.33,.245,.135,0,0),(.43,.22,.12,0,-.015),(.49,.115,.08,0,-.01)],base)
 loft(variant+'_helmet',[(-.1,.065,.065,0,0),(-.04,.10,.105,0,.018),(.065,.115,.095,0,0),(.13,.072,.07,0,-.02)],base)
 loft(variant+'_visor',[(.012,.094,.008,0,.099),(.035,.103,.009,0,.103),(.052,.085,.008,0,.096)],glow,12)
 loft(variant+'_bracer',[(-.27,.065,.062,0,0),(-.22,.10,.092,0,.012),(-.10,.097,.085,0,.008),(-.035,.068,.065,0,0)],base)
 loft(variant+'_greave',[(-.34,.06,.066,0,.01),(-.26,.083,.085,0,.022),(-.09,.09,.095,0,.02),(.035,.078,.075,0,.018)],base)
 loft(variant+'_shoulder',[(-.09,.105,.10,0,0),(-.035,.16,.125,0,0),(.06,.13,.105,0,0),(.105,.06,.06,0,0)],base)
 # Recessed central power rail.
 loft(variant+'_rail',[(.075,.016,.012,0,.105),(.32,.021,.012,0,.141),(.39,.013,.012,0,.12)],glow,8)
 if variant=='cinder':
  # Swept, curved horns with asymmetric cross section, rather than straight cones.
  for side in [-1,1]:
   loft('cinder_horn'+str(side),[(.06,.052,.05,side*.08,-.025),(.16,.045,.038,side*.14,-.045),(.26,.028,.027,side*.16,-.09),(.34,.003,.004,side*.13,-.14)],base,8)
# Central astrolabe: crafted pedestal and intersecting bronze orbital hoops.
loft('altar',[(0,1.5,.8,0,0),(.16,1.5,.8,0,0),(.2,1.3,.7,0,0),(1.15,1.2,.65,0,0),(1.2,1.45,.8,0,0),(1.4,1.45,.8,0,0)],stone,32)
for i,(radius,angle) in enumerate([(1.25,.48),(1.1,-.65),(.95,1.05)]):
 bpy.ops.mesh.primitive_torus_add(major_radius=radius,minor_radius=.026,major_segments=96,minor_segments=8,location=(0,0,2.7),rotation=(angle,.32*i,0))
 o=bpy.context.object; o.name='orbit_'+str(i); o.data.materials.append(gold)
bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,radius=.46,location=(0,0,2.7)); bpy.context.object.name='orb'; bpy.context.object.data.materials.append(steel)
for i in [-1,1]:
 loft('altar_channel'+str(i),[(.24,.018,.018,i*1.12,.663),(1.13,.018,.018,i*1.12,.663)],blue,8)
# Fluted architectural kit, with collars and stepped capital to catch the key.
loft('pillar',[(0,.9,.9,0,0),(.22,.9,.9,0,0),(.3,.7,.7,0,0),(.65,.65,.65,0,0),(5.9,.48,.48,0,0),(6.05,.72,.72,0,0),(6.3,.72,.72,0,0),(6.4,.85,.85,0,0)],stone,20)
loft('pillar_trim',[(.32,.716,.716,0,0),(.39,.716,.716,0,0),(5.86,.51,.51,0,0),(5.94,.51,.51,0,0)],gold,20)
# Keep a reusable native source and a compact runtime kit. Export is production, not validation.
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/forge/yzx-forge.blend'))
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/environment/forge-kit.glb'),export_format='GLB',export_apply=True,export_animations=False)
