/* eslint-disable react-hooks/refs -- R3F attaches these refs during render. */
/**
 * Props for ECHO's supers, parked on the rig's spare effect groups.
 *
 * The group layout is a contract with `echoSuperFx`: аура holds the hologram
 * copies, projectile holds the mirror and the clone that steps out of it, slash
 * holds the statistics panel. Every group starts hidden and is only shown by
 * the super that owns it.
 */
import type { FighterRigRefs } from '../fighterRigRefs';
import type { EchoMaterials } from './echoMaterials';
import type { EchoResources } from './echoResources';
import {
  ECHO_CHART_BARS,
  ECHO_CHART_SHARDS,
  ECHO_HOLOGRAM_COPIES,
  ECHO_MIRROR_SHARDS,
} from './echoSuperTimeline';

interface EffectProps {
  readonly materials: EchoMaterials;
  readonly refs: FighterRigRefs;
  readonly resources: EchoResources;
}

export function EchoSuperEffects({ materials, refs, resources }: EffectProps) {
  return (
    <>
      <group ref={refs.aura}>
        {count(ECHO_HOLOGRAM_COPIES).map((index) => (
          <group key={index}>
            <Ghost material={materials.hologram} resources={resources} />
          </group>
        ))}
      </group>

      <group ref={refs.projectile}>
        <group>
          <mesh
            geometry={resources.mirrorPane}
            material={materials.mirror}
            position={[0, 1.24, 0]}
          />
          {count(ECHO_MIRROR_SHARDS).map((index) => (
            <mesh
              geometry={resources.shard}
              key={index}
              material={materials.mirror}
              position={[0, 1.24, 0]}
            />
          ))}
        </group>
        <group>
          <Ghost material={materials.mirror} resources={resources} />
        </group>
      </group>

      <group ref={refs.slash}>
        <group>
          <mesh
            geometry={resources.chartPanel}
            material={materials.hologram}
            position={[0, 0.7, 0]}
          />
        </group>
        <group>
          {count(ECHO_CHART_BARS).map((index) => (
            <group key={index} position={[(index - 1) * 0.62, 0.08, 0.06]}>
              <mesh
                geometry={resources.chartBar}
                material={index === ECHO_CHART_BARS - 1
                  ? materials.alert
                  : materials.glow}
                position={[0, 0.5, 0]}
              />
            </group>
          ))}
        </group>
        <group>
          {count(ECHO_CHART_SHARDS).map((index) => (
            <mesh
              geometry={resources.shard}
              key={index}
              material={materials.alert}
            />
          ))}
        </group>
      </group>
    </>
  );
}

/** A flat read-out of a fighter: the copies and the clone share this shape. */
function Ghost({
  material,
  resources,
}: {
  readonly material: EchoMaterials['hologram'];
  readonly resources: EchoResources;
}) {
  return (
    <>
      <mesh
        geometry={resources.ghostBody}
        material={material}
        position={[0, 1.12, 0]}
      />
      <mesh
        geometry={resources.ghostHead}
        material={material}
        position={[0, 1.74, 0]}
      />
    </>
  );
}

function count(total: number): readonly number[] {
  return Array.from({ length: total }, (_, index) => index);
}
