import type { CharacterId } from '../../game/data/characters/circleFighters';

export type CharacterSkinProfile = {
  torso: string;
  head: string;
  shoulders: number;
  hips: number;
  armWidth: number;
  legWidth: number;
  shadowWidth: number;
  stance: 'legs' | 'float' | 'tail';
  face: 'visor' | 'eyes' | 'single' | 'mask';
};

export const CHARACTER_SKINS: Record<CharacterId, CharacterSkinProfile> = {
  granite: {
    torso: 'M101 128 126 96 202 98 224 132 216 245 184 270 123 259 96 224Z',
    head: 'M112 82 137 43 194 48 216 80 196 112 128 108Z',
    shoulders: 61, hips: 30, armWidth: 30, legWidth: 27, shadowWidth: 92,
    stance: 'legs', face: 'visor',
  },
  caliber: {
    torso: 'M105 116 215 116 224 236 196 258 122 258 96 235Z',
    head: 'M112 50 207 50 218 99 201 116 116 108 101 86Z',
    shoulders: 64, hips: 27, armWidth: 24, legWidth: 22, shadowWidth: 84,
    stance: 'legs', face: 'visor',
  },
  volt: {
    torso: 'M160 91 207 135 188 252 160 274 125 246 111 136Z',
    head: 'M160 31 205 77 180 112 139 108 113 75Z',
    shoulders: 45, hips: 20, armWidth: 16, legWidth: 15, shadowWidth: 64,
    stance: 'legs', face: 'single',
  },
  nocturne: {
    torso: 'M103 133 127 99 196 103 225 134 204 249 164 270 116 246Z',
    head: 'M101 71 127 36 160 59 193 35 220 73 199 111 119 111Z',
    shoulders: 67, hips: 28, armWidth: 22, legWidth: 22, shadowWidth: 84,
    stance: 'legs', face: 'mask',
  },
  ragnar: {
    torso: 'M86 137 113 99 206 103 238 139 213 249 172 267 111 248Z',
    head: 'M98 72 131 36 197 43 226 81 202 116 119 111Z',
    shoulders: 75, hips: 35, armWidth: 32, legWidth: 26, shadowWidth: 98,
    stance: 'legs', face: 'eyes',
  },
  marina: {
    torso: 'M160 88C214 132 218 193 190 250L160 278 126 247C101 192 108 132 160 88Z',
    head: 'M160 31C190 57 210 82 192 111L160 122 128 108C109 82 130 56 160 31Z',
    shoulders: 48, hips: 19, armWidth: 15, legWidth: 13, shadowWidth: 66,
    stance: 'float', face: 'single',
  },
  zephyr: {
    torso: 'M106 144C104 117 132 102 153 114 171 86 211 104 206 132 236 145 224 181 204 187 211 224 182 257 145 247 111 257 92 216 109 190 82 174 85 147 106 144Z',
    head: 'M111 80C109 51 141 37 160 55 178 30 216 54 207 82 226 102 199 122 176 111 148 129 112 111 111 80Z',
    shoulders: 56, hips: 22, armWidth: 18, legWidth: 14, shadowWidth: 78,
    stance: 'float', face: 'eyes',
  },
  origami: {
    torso: 'M160 88 222 150 189 193 210 255 160 231 109 257 132 193 98 149Z',
    head: 'M160 29 221 81 175 112 160 98 143 114 99 80Z',
    shoulders: 62, hips: 25, armWidth: 13, legWidth: 14, shadowWidth: 74,
    stance: 'legs', face: 'mask',
  },
  poro: {
    torso: 'M83 168C83 112 125 88 164 100 211 86 242 128 233 178 250 226 213 272 160 267 100 278 72 226 83 168Z',
    head: 'M104 83C104 41 147 28 178 44 218 38 235 85 207 115L123 115C107 108 100 96 104 83Z',
    shoulders: 76, hips: 34, armWidth: 29, legWidth: 25, shadowWidth: 101,
    stance: 'legs', face: 'eyes',
  },
  fenr: {
    torso: 'M104 132 127 99 197 99 224 137 204 248 165 269 117 244Z',
    head: 'M101 44 136 62 160 42 188 63 219 42 210 91 193 115 125 111 109 88Z',
    shoulders: 65, hips: 27, armWidth: 22, legWidth: 21, shadowWidth: 82,
    stance: 'legs', face: 'eyes',
  },
  sylvan: {
    torso: 'M118 92 143 112 160 82 179 113 204 90 221 154 193 252 160 274 126 249 99 153Z',
    head: 'M107 65 129 53 137 23 158 48 177 19 184 51 214 42 202 92 181 115 132 108Z',
    shoulders: 69, hips: 31, armWidth: 24, legWidth: 25, shadowWidth: 90,
    stance: 'legs', face: 'single',
  },
  adamant: {
    torso: 'M160 84 226 124 211 232 160 278 108 231 94 124Z',
    head: 'M160 35 211 62 201 108 160 125 117 106 108 62Z',
    shoulders: 63, hips: 25, armWidth: 28, legWidth: 23, shadowWidth: 86,
    stance: 'legs', face: 'visor',
  },
  vassa: {
    torso: 'M160 86 203 124 186 201 211 244 174 276 137 247 151 207 116 168 124 118Z',
    head: 'M94 67 137 39 182 40 226 67 195 113 126 113Z',
    shoulders: 54, hips: 15, armWidth: 18, legWidth: 18, shadowWidth: 73,
    stance: 'tail', face: 'mask',
  },
  shira: {
    torso: 'M160 87 197 119 190 223 160 265 130 223 123 119Z',
    head: 'M112 52 158 37 208 53 196 105 161 122 124 103Z',
    shoulders: 49, hips: 17, armWidth: 13, legWidth: 14, shadowWidth: 72,
    stance: 'float', face: 'visor',
  },
  pyron: {
    torso: 'M160 76 181 111 207 93 202 137 230 154 202 244 160 279 119 244 91 153 118 134 113 94 140 111Z',
    head: 'M160 18 178 54 200 39 204 78 185 115 135 111 113 77 138 53Z',
    shoulders: 63, hips: 23, armWidth: 19, legWidth: 17, shadowWidth: 78,
    stance: 'float', face: 'single',
  },
};
