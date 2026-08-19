"""Procedural hard-surface materials for the fighter roster.

No image textures anywhere. Two nodes carry almost the whole read:

  * **Per-plate tonal variation** -- a Voronoi on object coordinates, remapped
    to a narrow band around 1.0 and multiplied into the base colour. Real
    armour is assembled from pieces that were finished in different batches and
    never quite match, and that mismatch is most of what says "manufactured"
    rather than "modelled".
  * **Edge wear** -- Geometry > Pointiness, remapped hard, mixed toward bare
    metal and driving Metallic up. It is free on every convex corner, which is
    exactly where paint goes in life.

Pointiness is a Cycles-only input, so the wear silently disappears under
EEVEE. The plate variation, the grime gradient and the coat still read there,
which is what makes EEVEE usable for fast look-dev on the same material.
"""

import bpy


def _n(nt, kind, x, y):
    node = nt.nodes.new(kind)
    node.location = (x, y)
    return node


def plate_material(name, base, *, roughness=0.42, metallic=0.0,
                   wear_color=(0.34, 0.33, 0.36, 1.0), variation=0.1,
                   grime=0.35, grime_color=(0.06, 0.05, 0.05, 1.0)):
    """Painted armour plate: batch variation, edge wear, grime toward the feet."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic

    coord = _n(nt, 'ShaderNodeTexCoord', -1200, 0)

    # --- per-plate tone -------------------------------------------------
    vor = _n(nt, 'ShaderNodeTexVoronoi', -1000, 200)
    vor.inputs['Scale'].default_value = 0.16
    nt.links.new(coord.outputs['Object'], vor.inputs['Vector'])
    bw = _n(nt, 'ShaderNodeMapRange', -820, 200)
    bw.inputs['To Min'].default_value = 1.0 - variation
    bw.inputs['To Max'].default_value = 1.0 + variation
    nt.links.new(vor.outputs['Distance'], bw.inputs['Value'])

    tint = _n(nt, 'ShaderNodeMixRGB', -640, 120)
    tint.blend_type = 'MULTIPLY'
    tint.inputs['Fac'].default_value = 1.0
    tint.inputs['Color1'].default_value = base
    nt.links.new(bw.outputs['Result'], tint.inputs['Color2'])

    # --- grime, low on the body ----------------------------------------
    sep = _n(nt, 'ShaderNodeSeparateXYZ', -1000, -220)
    nt.links.new(coord.outputs['Object'], sep.inputs['Vector'])
    dirt = _n(nt, 'ShaderNodeMapRange', -820, -220)
    # Ankle-height up to the waist. Invert by ordering the *from* range, never
    # by putting To Min above To Max -- a clamped inverted interval collapses
    # to zero rather than flipping.
    dirt.inputs['From Min'].default_value = 0.9
    dirt.inputs['From Max'].default_value = 0.05
    dirt.inputs['To Min'].default_value = 0.0
    dirt.inputs['To Max'].default_value = grime
    nt.links.new(sep.outputs['Z'], dirt.inputs['Value'])

    soot = _n(nt, 'ShaderNodeMixRGB', -460, 40)
    soot.blend_type = 'MIX'
    soot.inputs['Color2'].default_value = grime_color
    nt.links.new(tint.outputs['Color'], soot.inputs['Color1'])
    nt.links.new(dirt.outputs['Result'], soot.inputs['Fac'])

    # --- edge wear (Cycles) ---------------------------------------------
    geo = _n(nt, 'ShaderNodeNewGeometry', -1000, 440)
    point = _n(nt, 'ShaderNodeMapRange', -820, 440)
    point.inputs['From Min'].default_value = 0.49
    point.inputs['From Max'].default_value = 0.56
    nt.links.new(geo.outputs['Pointiness'], point.inputs['Value'])

    # Wear is scaled by how dark the paint is. On white plate a bare-metal
    # edge is a subtle shift; on a near-black undersuit the same mix lifts the
    # whole surface several times its own albedo, which is what turned MIM's
    # black bodysuit into mid grey and collapsed the value separation the
    # character design depends on.
    lift = _n(nt, 'ShaderNodeMath', -460, 340)
    lift.operation = 'MULTIPLY'
    lift.inputs[1].default_value = max(0.12, min(1.0, sum(base[:3]) / 3.0 * 3.2))
    nt.links.new(point.outputs['Result'], lift.inputs[0])

    wear = _n(nt, 'ShaderNodeMixRGB', -280, 40)
    wear.inputs['Color2'].default_value = wear_color
    nt.links.new(soot.outputs['Color'], wear.inputs['Color1'])
    nt.links.new(lift.outputs['Value'], wear.inputs['Fac'])
    nt.links.new(wear.outputs['Color'], bsdf.inputs['Base Color'])

    metal = _n(nt, 'ShaderNodeMapRange', -280, -160)
    metal.inputs['To Min'].default_value = metallic
    metal.inputs['To Max'].default_value = min(1.0, metallic + 0.75)
    nt.links.new(lift.outputs['Value'], metal.inputs['Value'])
    nt.links.new(metal.outputs['Result'], bsdf.inputs['Metallic'])

    rough = _n(nt, 'ShaderNodeMapRange', -280, -340)
    rough.inputs['To Min'].default_value = roughness
    rough.inputs['To Max'].default_value = max(0.08, roughness - 0.24)
    nt.links.new(lift.outputs['Value'], rough.inputs['Value'])
    nt.links.new(rough.outputs['Result'], bsdf.inputs['Roughness'])
    return mat


def skin_material(name, base):
    """Skin needs subsurface or it reads as painted plastic at any resolution."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = base
    bsdf.inputs["Roughness"].default_value = 0.58
    for name_, value in (("Subsurface Weight", 0.22),
                         ("Subsurface Scale", 0.06)):
        if name_ in bsdf.inputs:
            bsdf.inputs[name_].default_value = value
    if "Subsurface Radius" in bsdf.inputs:
        bsdf.inputs["Subsurface Radius"].default_value = (0.36, 0.13, 0.09)
    return mat


def emissive_material(name, color, strength):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.02, 0.02, 0.02, 1.0)
    bsdf.inputs["Emission Color"].default_value = color
    bsdf.inputs["Emission Strength"].default_value = strength
    return mat
