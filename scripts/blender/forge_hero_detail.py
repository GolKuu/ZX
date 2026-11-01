"""Original hard-surface detail; shared by modular and skinned exports. No motion data."""
import math
import random
import bpy


def enhance(piece, variant, shell, loft, rail, plate, trim, glow, black, parts):
    demon = variant == 'cinder'
    rng = random.Random(variant + piece)

    def disc(name, center, radius, depth, mat):
        x, y, z = center
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=radius, depth=depth,
                                           location=(x, -z, y), rotation=(math.pi/2, 0, 0))
        obj = bpy.context.object; obj.name = name; obj.data.materials.append(mat)
        bevel = obj.modifiers.new('Socket edge', 'BEVEL'); bevel.width = .002; bevel.segments = 2
        obj.modifiers.new('Socket normals', 'WEIGHTED_NORMAL')
        parts.append(obj)

    def shard(name, x, y, z, w, h, d):
        obj = loft(name, [(y-h*.5,w*.45,d*.6,x,z), (y-h*.2,w,d,x-w*.1,z),
                         (y+h*.25,w*.8,d*.8,x+w*.1,z), (y+h*.65,w*.08,d*.1,x+w*.4,z)], plate, 7)
        for v in obj.data.vertices:
            v.co.x += rng.uniform(-w*.12, w*.12)
            v.co.y += rng.uniform(-d*.15, d*.15)
        for p in obj.data.polygons: p.use_smooth = False

    if piece == 'torso':
        # Layered collar and sternum replace a cylinder with designed armor planes.
        for s in [-1, 1]:
            shell('Floating collar', (s*.115,.49,.01), (.12,.055,.085), trim)
            for i in range(4):
                shell('Oblique overlapping plate', (s*(.14-i*.012),.28-i*.065,.085),
                      (.055,.075,.055), plate)
            for i in range(3):
                shell('Back vertebral armor', (s*.065,.36-i*.1,-.12), (.065,.075,.035), trim)
            if not demon:
                for y in [.35,.39,.43]:
                    rail('Pectoral ventilation', [(s*.15,y,.145),(s*.205,y-.025,.12)], .003, black)
        if not demon:
            disc('Reactor housing', (0,.335,.142), .058,.022,black)
            disc('Reactor machined rim', (0,.335,.157), .047,.013,trim)
            disc('Reactor luminous ring', (0,.335,.167), .036,.008,glow)
            disc('Reactor iris', (0,.335,.174), .026,.009,black)
            for i in range(4):
                shell('Central abdominal plate',(0,.235-i*.067,.123),(.035,.052,.025),trim)
        else:
            for s in [-1,1]:
                for i in range(5):
                    shard('Fractured thorax',s*(.055+(i%2)*.085),.405-i*.062,.135,.064,.10,.045)
                    rail('Incandescent fracture',[(s*.02,.44-i*.068,.156),
                         (s*.06,.42-i*.068,.173),(s*.105,.435-i*.068,.156)],.0035,glow)
    elif piece == 'head':
        for s in [-1,1]:
            shell('Cheek plane',(s*.067,-.04,.087),(.032,.085,.035),plate)
            disc('Temple actuator',(s*.092,.025,.035),.026,.018,black)
            disc('Temple hub',(s*.092,.025,.047),.016,.012,trim)
            if demon:
                shard('Brow crest',s*.052,.075,.08,.034,.13,.035)
                shard('Mandible tusk',s*.072,-.09,.075,.023,.09,.04)
            else:
                rail('Crown spine',[(s*.035,.12,-.065),(s*.035,.14,.01),(s*.045,.09,.08)],.005,trim)
                for i in range(3):
                    rail('Jaw respirator',[(s*.012,-.07+i*.012,.115),(s*.055,-.065+i*.012,.107)],.0025,black)
    elif piece == 'pelvis':
        for s in [-1,1]:
            shell('Articulated hip skirt',(s*.13,-.13,.06),(.068,.18,.055),plate)
            disc('Belt fastening',(s*.10,.015,.115),.018,.012,trim)
    elif piece == 'arm':
        for i in range(3):
            shell('Overlapping shoulder lame',(0,.025-i*.043,.055),(.14-i*.013,.057,.095),plate)
        disc('Shoulder bearing',(0,.012,.128),.041,.022,black)
        disc('Shoulder inset',(0,.012,.144),.027,.012,glow if not demon else trim)
        for i in range(3):
            shell('Bicep flex rib',(0,-.20-i*.035,.065),(.069,.018,.022),black)
    elif piece == 'forearm':
        shell('Wrist seal',(0,-.275,.005),(.064,.048,.066),trim)
        shell('Thumb metacarpal',(.075,-.315,.015),(.029,.078,.035),plate)
        for i in range(4):
            disc('Knuckle cap',((i-1.5)*.033,-.32,.092),.014,.012,plate)
        for s in [-1,1]:
            rail('Bracer edge',[(s*.052,-.24,.08),(s*.083,-.17,.09),(s*.065,-.065,.08)],.004,trim)
    elif piece == 'thigh':
        for s in [-1,1]:
            shell('Thigh side rail',(s*.068,-.18,.015),(.025,.27,.06),trim)
        for i in range(3):
            shell('Hip articulation rib',(0,-.035-i*.022,.07),(.075,.012,.022),black)
    elif piece == 'shin':
        disc('Patella socket',(0,0,.112),.054,.024,black)
        disc('Patella inset',(0,0,.130),.037,.016,glow if not demon else plate)
        disc('Patella hub',(0,0,.141),.022,.01,trim)
        for s in [-1,1]:
            shell('Calf splint',(s*.065,-.19,.025),(.025,.27,.055),plate)
        shell('Instep armor',(0,-.37,.135),(.075,.085,.10),trim)
    if demon and piece in ['arm','forearm','thigh','shin']:
        for i in range(5):
            x = (-1 if i%2 else 1) * (.025 + rng.random()*.04)
            y = -.04-i*.055
            shard('Overlapping basalt shard',x,y,.078,.052,.105,.04)
            rail('Lava between scales',[(x-.025,y-.025,.11),(x,y,.125),(x+.026,y+.02,.10)],.003,glow)
