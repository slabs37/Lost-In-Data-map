import * as rm from "https://deno.land/x/remapper@4.1.0/src/mod.ts"
import * as bundleInfo from './bundleinfo.json' with { type: 'json' }

const pipeline = await rm.createPipeline({ bundleInfo })

const bundle = rm.loadBundle(bundleInfo)
const materials = bundle.materials
const prefabs = bundle.prefabs

// ----------- { SCRIPT } -----------

async function doMap(file: rm.DIFFICULTY_NAME) {
    const map = await rm.readDifficultyV3(pipeline, file)

    //need to figure out one by one asset removal to keep life and score and stuff
    rm.environmentRemoval(map, ['Environment', 'GameCore'])

    map.difficultyInfo.requirements = [
        'Chroma',
        'Noodle Extensions',
        'Vivify',
    ]

    map.difficultyInfo.settingsSetter = {
        graphics: {
            maxShockwaveParticles: 0,
            screenDisplacementEffectsEnabled: true,
        },
        chroma: {
            disableEnvironmentEnhancements: false,
        },
        playerOptions: {
            leftHanded: rm.BOOLEAN.False,
            noteJumpDurationTypeSettings: 'Dynamic',
        },
        colors: {},
        environments: {},
    }

    rm.setRenderingSettings(map, {
        qualitySettings: {
            realtimeReflectionProbes: rm.BOOLEAN.False,
            shadows: rm.SHADOWS.HardOnly,
            shadowDistance: 64,
            shadowResolution: rm.SHADOW_RESOLUTION.VeryHigh,
            
        },
        renderSettings: {
            fog: rm.BOOLEAN.True,
            fogEndDistance: 64,
        },
    })

    const sky = prefabs.sky.instantiate(map, 0)
    const forest = prefabs.forestscene.instantiate(map, 0)
    const texts = prefabs.textscene.instantiate(map, 0)
    const castle = prefabs.castlescene.instantiate(map, 0)
    const pones = prefabs.pones.instantiate(map, 0)
    
    // Set healthbar material (which has a 0-1 scale) to use the ingame life meter
    materials.health.set(map, {
        _Progress: ["baseEnergy"],
        _Color:[0.5, 0.5, 0.5, 0.75],
    }, 0, 7000)

    // For more help, read: https://github.com/Swifter1243/ReMapper/wiki

    rm.assignPathAnimation(map,{
        track: 'biosLeft',
        animation :{
            color : [0.639, 0.286, 0.643, 1],
        }
    })

    rm.assignPathAnimation(map, {
        track: 'guitarR',
        animation: {
            dissolve: [
                [0.5, 0],
                [0.7, 0.25],
                [1.0, 0.35],
            ],
            color : [0.937, 0.929, 0.929, 1],
        },
    })
        rm.assignPathAnimation(map, {
        track: 'guitarL',
        animation: {
            dissolve: [
                [0.5, 0],
                [0.7, 0.25],
                [1.0, 0.35],
            ],
            color : [0.639, 0.286, 0.643, 1],
        },
    })

    rm.assignPathAnimation(map, {
        track: 'duoR',
        animation: {
            offsetPosition: [
                [4,0,0,0],
                [0,0,0,0.2, "easeOutSine"],
            ],
        },
    })

    rm.assignPathAnimation(map, {
        track: 'duoL',
        animation: {
            offsetPosition: [
                [-4,0,0,0],
                [0,0,0,0.2, "easeOutSine"],
            ],
            color : [0.969,0.569,0.184,1],
        },
    })

    map.colorNotes.forEach(note => {
        //Duo
        if (note.beat >= 482 && note.beat <= 543) {
            note.unsafeCustomData._disableSpawnEffect = rm.BOOLEAN.True
            note.jumpDistance = 30
            //note.color 1 is right hand, 0 is left hand
            if (note.color) {
                note.track.add('duoR')
            } else {
                note.track.add('duoL')
            }
        }
        
        //Guitar
         if (note.beat >= 337 && note.beat <= 480) {
            note.unsafeCustomData._disableSpawnEffect = rm.BOOLEAN.True
            note.jumpDistance = 40
            note.noteJumpMovementSpeed = 25
            //note.color 1 is right hand, 0 is left hand
            if (note.color) {
                note.track.add('guitarR')
            } else {
                note.track.add('guitarL')
            }
         }

         //Dark sections need left color changed to be more readable
         if (note.beat >= 0 && note.beat <= 56) {
            //note.color 1 is right hand, 0 is left hand
            if (!note.color) {
                note.track.add('biosLeft')
            }
         }
         if (note.beat >= 185 && note.beat <= 192)  {
            //note.color 1 is right hand, 0 is left hand
            if (!note.color) {
                note.track.add('biosLeft')
            }
         }
    })
}

await Promise.all([
    doMap('ExpertPlusStandard')
])

// ----------- { OUTPUT } -----------

pipeline.export({
    outputDirectory: '../Lost In Data/'
})