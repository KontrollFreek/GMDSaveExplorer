const parseSave = new Promise((resolve, reject) => {
    const fs = require('fs')
    const pako = require('pako')
    const { getName } = require('./names')
    const path = require('path')

    function decodeSave(a) {
        let b = ''
        a = String(a).split('').map(l => l.charCodeAt())
        a.forEach(c => b += String.fromCodePoint(c ^ 11))
        b = Buffer.from(b, 'base64')
        return new TextDecoder('utf-8').decode(pako.ungzip(b))
    }

    function parseLevelString(e) {
        let r = {}
        e = e.split(',')
        for (let i = 0; i < e.length; i += 2) r[e[i]] = e[i + 1]
        return r
    }

    let blacklist = [
        'buttonRows',
        'buttonsPerRow'
    ]

    fs.readFile(`${process.env.LOCALAPPDATA}/GeometryDash/CCGameManager.dat`, null, (err, data) => {
        if (err) throw err + ' (Do you have the game installed?)'

        let file = decodeSave(data)
        let json = {}

        json.bgVolume = file.match(/<k>bgVolume<\/k><r>([\d\.]+)<\/r>/)[1] * 100 + '%'
        json.sfxVolume = file.match(/<k>sfxVolume<\/k><r>([\d\.]+)<\/r>/)[1] * 100 + '%'
        json.UDID = file.match(/<k>playerUDID<\/k><s>([\w-]+)<\/s><k>/)[1]
        json.name = file.match(/<k>playerName<\/k><s>(\w+)<\/s><k>/)[1]
        try { json.password = file.match(/<k>GJA_002<\/k><s>(\w+)<\/s><k>/)[1] } catch {}
        try { json.userID = parseInt(file.match(/<k>playerUserID<\/k><i>(\d+)<\/i>/)[1]) } catch {}
        try { json.accountID = parseInt(file.match(/<k>GJA_003<\/k><i>(\d+)<\/i>/)[1]) } catch {}
        json.icon = parseInt(file.match(/<k>playerFrame<\/k><i>(\d+)<\/i>/)[1])
        json.ship = parseInt(file.match(/<k>playerShip<\/k><i>(\d+)<\/i>/)[1])
        json.ball = parseInt(file.match(/<k>playerBall<\/k><i>(\d+)<\/i>/)[1])
        json.UFO = parseInt(file.match(/<k>playerBird<\/k><i>(\d+)<\/i>/)[1])
        json.wave = parseInt(file.match(/<k>playerDart<\/k><i>(\d+)<\/i>/)[1])
        json.robot = parseInt(file.match(/<k>playerRobot<\/k><i>(\d+)<\/i>/)[1])
        json.spider = parseInt(file.match(/<k>playerSpider<\/k><i>(\d+)<\/i>/)[1])
        try { json.color1 = parseInt(file.match(/<k>playerColor<\/k><i>(\d+)<\/i>/)[1]) } catch {}
        json.color2 = parseInt(file.match(/<k>playerColor2<\/k><i>(\d+)<\/i>/)[1])
        json.trail = parseInt(file.match(/<k>playerStreak<\/k><i>(\d+)<\/i>/)[1])
        json.deathEffect = parseInt(file.match(/<k>playerDeathEffect<\/k><i>(\d+)<\/i>/)[1])
        try { json.playerIconType = parseInt(file.match(/<k>playerIconType<\/k><i>(\d+)<\/i>/)[1]) } catch { json.playerIconType = 0 }
        try { json.playerGlow = file.match(/<k>playerGlow<\/k><([tf]) \/>/)[1] == 't' } catch { json.playerGlow = false }
        try { json.cod3breaker = parseInt(file.match(/<k>secretNumber<\/k><i>(\d+)<\/i>/)[1]) } catch {}
        try { json.moderator = file.match(/<k>hasRP<\/k><([tf]) \/>/)[1] == 't' } catch { json.moderator = false }

        json.valueKeeper = {}

        let gv = file.match(/<k>gv_[\w-]+<\/k><s>\d+<\/s>/g)
        for (let i = 0; i < gv.length; i++) {
            let match = gv[i].match(/<k>(gv_[\w-]+)<\/k><s>(\d+)<\/s>/)
            let response = blacklist.includes(getName(match[1])) || getName(match[1]).startsWith('gv_1000') || getName(match[1]).startsWith('gv_gradient') || getName(match[1]).startsWith('gv_comentarios') || getName(match[1]).startsWith('gv_tabla') ? parseInt(match[2]) : match[2] == '1'
            json.valueKeeper[getName(match[1])] = response
        }

        let icon = file.match(/<k>i_\d+<\/k><s>\d+<\/s>/g)
        if (icon != null) {
            json.valueKeeper.icons = []
            for (let i = 0; i < icon.length; i++) {
                let match = icon[i].match(/<k>i_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.icons.push(parseInt(match[1]))
            }
        }

        let ship = file.match(/<k>ship_\d+<\/k><s>\d+<\/s>/g)
        if (ship != null) {
            json.valueKeeper.ships = []
            for (let i = 0; i < ship.length; i++) {
                let match = ship[i].match(/<k>ship_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.ships.push(parseInt(match[1]))
            }
        }

        let ball = file.match(/<k>ball_\d+<\/k><s>\d+<\/s>/g)
        if (ball != null) {
            json.valueKeeper.balls = []
            for (let i = 0; i < ball.length; i++) {
                let match = ball[i].match(/<k>ball_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.balls.push(parseInt(match[1]))
            }
        }

        let UFO = file.match(/<k>bird_\d+<\/k><s>\d+<\/s>/g)
        if (UFO != null) {
            json.valueKeeper.UFOs = []
            for (let i = 0; i < UFO.length; i++) {
                let match = UFO[i].match(/<k>bird_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.UFOs.push(parseInt(match[1]))
            }
        }

        let wave = file.match(/<k>dart_\d+<\/k><s>\d+<\/s>/g)
        if (wave != null) {
            json.valueKeeper.darts = []
            for (let i = 0; i < wave.length; i++) {
                let match = wave[i].match(/<k>dart_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.darts.push(parseInt(match[1]))
            }
        }

        let robot = file.match(/<k>robot_\d+<\/k><s>\d+<\/s>/g)
        if (robot != null) {
            json.valueKeeper.robots = []
            for (let i = 0; i < robot.length; i++) {
                let match = robot[i].match(/<k>robot_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.robots.push(parseInt(match[1]))
            }
        }

        let trail = file.match(/<k>special_\d+<\/k><s>\d+<\/s>/g)
        if (trail != null) {
            json.valueKeeper.trails = []
            for (let i = 0; i < trail.length; i++) {
                let match = trail[i].match(/<k>special_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.trails.push(parseInt(match[1]))
            }
        }

        json.valueKeeper.colors = {}

        let c1 = file.match(/<k>c0_\d+<\/k><s>\d+<\/s>/g)
        if (c1 != null) {
            json.valueKeeper.colors.c1 = []
            for (let i = 0; i < c1.length; i++) {
                let match = c1[i].match(/<k>c0_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.colors.c1.push(parseInt(match[1]))
            }
        }

        let c2 = file.match(/<k>c1_\d+<\/k><s>\d+<\/s>/g)
        if (c2 != null) {
            json.valueKeeper.colors.c2 = []
            for (let i = 0; i < c2.length; i++) {
                let match = c2[i].match(/<k>c1_(\d+)<\/k><s>(\d+)<\/s>/)
                if (match[2] == '1') json.valueKeeper.colors.c2.push(parseInt(match[1]))
            }
        }

        if (c1 != null && c2 != null) delete json.valueKeeper.colors

        let ugv = file.match(/<k>ugv_[\w-]+<\/k><s>\d+<\/s>/g)
        if (ugv != null) {
            json.unlockValueKeeper = {}
            for (let i = 0; i < ugv.length; i++) {
                let match = ugv[i].match(/<k>(ugv_[\w-]+)<\/k><s>(\d+)<\/s>/)
                let name = getName(match[1])
                json.unlockValueKeeper[getName(match[1])] = parseInt(match[2]) == 1
            }
        }

        let objs = file.match(/<k>-(\d+)<\/k><s>([\d,;]+)<\/s>/g)
        if (objs != null) {
            json.customObjects = []
            for (let i = 0; i < objs.length; i++) {
                let match = objs[i].match(/<k>-(\d+)<\/k><s>([\d,;]+)<\/s>/)
                let strings = []
                match[2].slice(0, -1).split(';').forEach(e => {
                    e = parseLevelString(e)
                    let levelstring = {
                        objectID: parseInt(e[1]),
                        position: { x: parseInt(e[2]), y: parseInt(e[3]) },
                        flippedX: e[4] == '1',
                        flippedY: e[5] == '1',
                        rotation: parseInt(e[6]),
                        color: { r: parseInt(e[7]), g: parseInt(e[8]), b: parseInt(e[9]) },
                        duration: parseInt(e[10]),
                        touch: e[11] == '1',
                        secretCoin: parseInt(e[12]),
                        specialChecked: e[13] == '1',
                        tintGround: e[14] == '1',
                        playerColor1: e[15] == '1',
                        playerColor2: e[16] == '1',
                        blending: e[17] == '1',
                        editorLayer1: e[20] == '1',
                        mainColorID: parseInt(e[21]),
                        detailColorID: parseInt(e[22]),
                        targetColorID: parseInt(e[23]),
                        zLayer: parseInt(e[24]),
                        zOrder: parseInt(e[25]),
                        xOffset: parseInt(e[28]),
                        yOffset: parseInt(e[29]),
                        easing: parseInt(e[30]),
                        text: e[31],
                        scale: parseInt(e[32]),
                        parent: e[34] == '1',
                        opacity: parseInt(e[35]),
                        mainHSV: e[41] == '1',
                        detailHSV: e[42] == '1',
                        mainHSV: e[43],
                        detailHSV: e[44],
                        fadeIn: parseInt(e[45]),
                        pulseHold: parseInt(e[46]),
                        fadeOut: parseInt(e[47]),
                        pulseMode: parseInt(e[48]),
                        copiedHSV: e[49],
                        copiedColorID: parseInt(e[50]),
                        targedGroupID: parseInt(e[51]),
                        pulseTargetType: parseInt(e[52]),
                        teleportOffset: parseInt(e[54]),
                        teleportEase: e[55] == '1',
                        activateGroup: e[56] == '1',
                        groupIDs: e[57],
                        lockPlayerX: e[58] == '1',
                        lockPlayerY: e[59] == '1',
                        copyOpacity: e[60] == '1',
                        editorLayer2: parseInt(e[61]),
                        spawnTriggered: e[62] == '1',
                        spawnDelay: parseInt(e[63]),
                        dontFade: e[64] == '1',
                        mainOnly: e[65] == '1',
                        detailOnly: e[66] == '1',
                        dontEnter: e[67] == '1',
                        degrees: parseInt(e[68]),
                        times360: parseInt(e[69]),
                        lockRotation: e[70] == '1',
                        secondaryGroupID: parseInt(e[71]),
                        modX: parseInt(e[72]),
                        modY: parseInt(e[73]),
                        strength: parseInt(e[75]),
                        animationID: parseInt(e[76]),
                        count: parseInt(e[77]),
                        subtractCount: e[78] == '1',
                        pickupMode: parseInt(e[79]),
                        itemID: parseInt(e[80]),
                        hold: e[81] == '1',
                        toggle: e[82] == '1',
                        interval: parseInt(e[84]),
                        easingRate: parseInt(e[85]),
                        pulseExclusive: e[86] == '1',
                        multiTrigger: e[87] == '1',
                        comparison: parseInt(e[88]),
                        dualMode: e[89] == '1',
                        speed: parseInt(e[90]),
                        followDelay: parseInt(e[91]),
                        offsetY: parseInt(e[92]),
                        triggerOnExit: e[93] == '1',
                        dynamic: e[94] == '1',
                        blockBID: parseInt(e[95]),
                        glow: e[96] == '0',
                        customRotationSpeed: parseInt(e[97]),
                        disableRotation: e[98] == '0',
                        orbMultiActivate: e[99] == '0',
                        enableUseTarget: e[100] == '0',
                        targetPosCoords: parseInt(e[101]),
                        editorDisable: e[102] == '0',
                        highDetail: e[103] == '0',
                        triggerMultiActivate: e[104] == '0',
                        maxSpeed: parseInt(e[105]),
                        randomizeStart: e[106] == '0',
                        animationSpeed: parseInt(e[107]),
                        linkedID: parseInt(e[108])
                    }
                    
                    if (e[6] == undefined) delete levelstring.rotation
                    if (e[7] == undefined || e[8] == undefined || e[9] == undefined) delete levelstring.color
                    if (e[10] == undefined) delete levelstring.duration
                    if (e[12] == undefined) delete levelstring.secretCoin
                    if (e[21] == undefined) delete levelstring.mainColorID
                    if (e[22] == undefined) delete levelstring.detailColorID
                    if (e[23] == undefined) delete levelstring.targetColorID
                    if (e[24] == undefined) delete levelstring.zLayer
                    if (e[25] == undefined) delete levelstring.zOrder
                    if (e[28] == undefined) delete levelstring.xOffset
                    if (e[29] == undefined) delete levelstring.yOffset
                    if (e[30] == undefined) delete levelstring.easing
                    if (e[31] == undefined) delete levelstring.text
                    else levelstring.text = atob(e[31])
                    if (e[32] == undefined) delete levelstring.scale
                    if (e[35] == undefined) delete levelstring.opacity
                    if (e[45] == undefined) delete levelstring.fadeIn
                    if (e[46] == undefined) delete levelstring.pulseHold
                    if (e[47] == undefined) delete levelstring.fadeOut
                    if (e[48] == undefined) delete levelstring.pulseMode
                    if (e[50] == undefined) delete levelstring.copiedColorID
                    if (e[51] == undefined) delete levelstring.targedGroupID
                    if (e[52] == undefined) delete levelstring.pulseTargetType
                    if (e[54] == undefined) delete levelstring.teleportOffset
                    if (e[57] != undefined) levelstring.groupIDs = e[57].split('.').map(e => parseInt(e))
                    if (e[61] == undefined) delete levelstring.editorLayer2
                    if (e[63] == undefined) delete levelstring.spawnDelay
                    if (e[68] == undefined) delete levelstring.degrees
                    if (e[69] == undefined) delete levelstring.times360
                    if (e[71] == undefined) delete levelstring.secondaryGroupID
                    if (e[72] == undefined) delete levelstring.modX
                    if (e[73] == undefined) delete levelstring.modY
                    if (e[75] == undefined) delete levelstring.strength
                    if (e[76] == undefined) delete levelstring.animationID
                    if (e[77] == undefined) delete levelstring.count
                    if (e[79] == undefined) delete levelstring.pickupMode
                    if (e[80] == undefined) delete levelstring.itemID
                    if (e[84] == undefined) delete levelstring.interval
                    if (e[85] == undefined) delete levelstring.easingRate
                    if (e[88] == undefined) delete levelstring.comparison
                    if (e[90] == undefined) delete levelstring.speed
                    if (e[91] == undefined) delete levelstring.followDelay
                    if (e[92] == undefined) delete levelstring.offsetY
                    if (e[95] == undefined) delete levelstring.blockBID
                    if (e[97] == undefined) delete levelstring.customRotationSpeed
                    if (e[101] == undefined) delete levelstring.targetPosCoords
                    if (e[105] == undefined) delete levelstring.maxSpeed
                    if (e[107] == undefined) delete levelstring.animationSpeed
                    if (e[108] == undefined) delete levelstring.linkedID

                    strings.push(levelstring)
                })
                json.customObjects[parseInt(match[1]) - 1] = strings
            }
        }

        let reportedAchievements = file.match(/<k>geometry\.ach\.\w+<\/k><s>\d+<\/s>/g)
        if (reportedAchievements != null) {
            json.achievements = {}
            for (let i = 0; i < c2.length; i++) {
                let match = reportedAchievements[i].match(/<k>geometry\.ach\.(\w+)<\/k><s>(\d+)<\/s>/)
                json.achievements[getName(match[1])] = match[2] + '%'
            }
        }

        try { json.showGuidelines = file.match(/<k>showSongMarkers<\/k><([tf]) \/>/)[1] == 't' } catch { json.showGuidelines = false }
        try { json.showProgressBar = file.match(/<k>showProgressBar<\/k><([tf]) \/>/)[1] == 't' } catch { json.showProgressBar = false }
        json.clickedIconKit = file.match(/<k>clickedGarage<\/k><([tf]) \/>/)[1] == 't'
        json.clickedEditor = file.match(/<k>clickedEditor<\/k><([tf]) \/>/)[1] == 't'
        json.clickedPractice = file.match(/<k>clickedPractice<\/k><([tf]) \/>/)[1] == 't'
        try { json.showedEditorGuide = file.match(/<k>showedEditorGuide<\/k><([tf]) \/>/)[1] == 't' } catch { json.showedEditorGuide = false }
        try { json.showedLowDetailDialog = file.match(/<k>showedLowDetailDialog<\/k><([tf]) \/>/)[1] == 't' } catch { json.showedLowDetailDialog = false }
        json.bootups = parseInt(file.match(/<k>bootups<\/k><i>(\d+)<\/i><k>/)[1])
        try { json.ratedGame = file.match(/<k>hasRatedGame<\/k><([tf]) \/>/)[1] == 't' } catch { json.ratedGame = false }
        json.binary = parseInt(file.match(/<k>binaryVersion<\/k><i>(\d+)<\/i><k>/)[1])
        try { json.resolution = parseInt(file.match(/<k>resolution<\/k><i>(\d+)<\/i><k>/)[1]) } catch {}
        try { json.textQuality = parseInt(file.match(/<k>texQuality<\/k><i>(\d+)<\/i><k>/)[1]) } catch {}

        let stats = file.match(/<k>GS_value<\/k><d>(.+)<\/d><k>GS_completed<\/k>/)[1].match(/<k>\d+<\/k><s>\d+<\/s>/g).map(e => e.match(/<k>(\d+)<\/k><s>(\d+)<\/s>/))
        json.stats = {}
        for (let i = 0; i < stats.length; i++) {
            let match = stats[i]
            json.stats[getName(`gs_${match[1]}`)] = parseInt(match[2])
        }
        json.stats.demonKeys = parseInt(file.match(/<k>GS_20<\/k><i>(\d+)<\/i>/)[1])

        resolve({ file: file, json: json })
    })
})

exports.parseSave = parseSave