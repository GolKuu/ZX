"""Produce UI portraits from the actual Blender hero surfaces, not gameplay screenshots."""
from pathlib import Path
import bpy
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'assets/forge/forge-heroes.blend'))
scene=bpy.context.scene
scene.render.engine='CYCLES'; scene.cycles.samples=24; scene.cycles.use_denoising=True
scene.render.resolution_x=384; scene.render.resolution_y=384; scene.render.resolution_percentage=100
scene.render.film_transparent=False
scene.render.image_settings.file_format='PNG'
scene.world=bpy.data.worlds.new('Portrait studio'); scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.035,.045,.07,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
scene.view_settings.view_transform='AgX'
camdata=bpy.data.cameras.new('Portrait lens');camdata.lens=82
cam=bpy.data.objects.new('Portrait lens',camdata);scene.collection.objects.link(cam);scene.camera=cam
cam.location=(.65,-1.8,.73);target=Vector((0,0,.51));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
def light(name,loc,power,color,size):
 data=bpy.data.lights.new(name,'AREA'); data.energy=power;data.color=color;data.shape='DISK';data.size=size
 obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=loc
 obj.rotation_euler=(target-obj.location).to_track_quat('-Z','Y').to_euler()
light('Key',(-1,-1.4,1.6),130,(.85,.93,1),1)
light('Edge',(1,.4,1),180,(.15,.4,1),.65)
light('Softbox',(.8,-1,.2),65,(1,.68,.4),.8)
(ROOT/'public/portraits/forge').mkdir(parents=True,exist_ok=True)
for variant in ['ion','cinder']:
 for obj in bpy.data.objects:
  if obj.type=='MESH':
   obj.hide_render=obj.name not in [variant+'_torso',variant+'_head']
   if obj.name==variant+'_head':obj.location.z=.62
 scene.render.filepath=str(ROOT/'public/portraits/forge'/f'{variant}.png')
 bpy.ops.render.render(write_still=True)
